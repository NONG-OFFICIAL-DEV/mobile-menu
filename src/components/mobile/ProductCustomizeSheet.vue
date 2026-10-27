<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import { Check, ImageOff, X } from 'lucide-vue-next'
  import { useI18n } from 'vue-i18n'
  import BaseBottomSheet from '@/components/ui/BaseBottomSheet.vue'
  import BaseButton from '@/components/ui/BaseButton.vue'
  import BaseBadge from '@/components/ui/BaseBadge.vue'
  import QtyStepper from '../customs/QtyStepper.vue'
  import { useMoney } from '@/composables/useMoney'
  import { useDigitalMenuStore } from '@/stores/digitalMenuStore'

  interface Variant {
    id: number | string
    name: string
    price_adjustment: number
    is_default?: boolean
  }

  interface ModifierOption {
    id: number | string
    name: string
    price: number
    is_default?: boolean
  }

  interface ModifierGroup {
    id: number | string
    name: string
    selection_type: 'single' | 'multiple'
    min_selections: number
    max_selections: number | null
    is_required: boolean
    options: ModifierOption[]
  }

  interface Product {
    id: number | string
    name: string
    description?: string
    image_url?: string
    base_price: number
    variants?: Variant[]
    modifier_groups?: ModifierGroup[]
  }

  interface CartLine {
    id: string | number
    qty: number
    menu_id: string | number
  }

  const props = defineProps<{
    modelValue: boolean
    product: Product | null
    cart: CartLine[]
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    add: [payload: Record<string, unknown>]
    limit: []
  }>()

  const { t } = useI18n()
  const { formatMoney } = useMoney()
  const digitalMenuStore = useDigitalMenuStore()

  const MAX_QTY_PER_ITEM = 5

  const selectedVariant = ref<Variant | null>(null)
  // group.id -> option id (single) or option id[] (multiple)
  const selections = reactive<Record<string | number, string | number | Array<string | number>>>({})
  const qty = ref(1)
  const note = ref('')
  const noteOpen = ref(false)

  const groups = computed(() => props.product?.modifier_groups ?? [])

  // Required groups first, stable order otherwise — a blocked Add button
  // should show its reason as close to the top as possible.
  const orderedGroups = computed(() =>
    [...groups.value].sort((a, b) => (a.is_required === b.is_required ? 0 : a.is_required ? -1 : 1))
  )

  function resetState() {
    const variants = props.product?.variants ?? []
    selectedVariant.value = variants.length
      ? (variants.find(v => v.is_default) ?? variants[0])
      : null

    const next: typeof selections = {}
    for (const group of groups.value) {
      if (group.selection_type === 'multiple') {
        const defaults = group.options.filter(o => o.is_default).map(o => o.id)
        next[group.id] = group.max_selections ? defaults.slice(0, group.max_selections) : defaults
      } else {
        const defaultOption = group.options.find(o => o.is_default)
        next[group.id] = group.is_required
          ? (defaultOption?.id ?? group.options[0]?.id ?? '')
          : (defaultOption?.id ?? '')
      }
    }
    Object.keys(selections).forEach(k => delete selections[k])
    Object.assign(selections, next)

    qty.value = 1
    note.value = ''
    noteOpen.value = false
  }

  watch(
    () => props.modelValue,
    open => {
      if (open) resetState()
    }
  )

  function selectedIds(group: ModifierGroup): Array<string | number> {
    const sel = selections[group.id]
    if (group.selection_type === 'multiple') return (sel as Array<string | number>) ?? []
    return sel ? [sel as string | number] : []
  }

  function isSelected(group: ModifierGroup, optionId: string | number) {
    return selectedIds(group).includes(optionId)
  }

  function isGroupFull(group: ModifierGroup) {
    if (!group.max_selections) return false
    return selectedIds(group).length >= group.max_selections
  }

  function onChoiceClick(group: ModifierGroup, option: ModifierOption) {
    if (group.selection_type === 'multiple') {
      const current = (selections[group.id] as Array<string | number>) ?? []
      if (current.includes(option.id)) {
        selections[group.id] = current.filter(id => id !== option.id)
      } else {
        if (isGroupFull(group)) return
        selections[group.id] = [...current, option.id]
      }
    } else {
      selections[group.id] = option.id
    }
  }

  function isGroupSatisfied(group: ModifierGroup) {
    if (group.selection_type === 'multiple') {
      return selectedIds(group).length >= (group.min_selections || 1)
    }
    return !!selections[group.id]
  }

  // "Required" / "Done" / "Optional" status pill per group.
  function groupStatus(group: ModifierGroup): 'required' | 'done' | 'optional' {
    if (!group.is_required) return 'optional'
    return isGroupSatisfied(group) ? 'done' : 'required'
  }

  function ruleText(group: ModifierGroup) {
    if (group.selection_type !== 'multiple') return t('common.pickOne')
    const count = selectedIds(group).length
    return group.max_selections
      ? t('common.pickUpTo', { n: group.max_selections, count })
      : t('common.pickSeveral', { count })
  }

  const firstUnsatisfiedRequiredGroup = computed(
    () => orderedGroups.value.find(g => g.is_required && !isGroupSatisfied(g)) ?? null
  )

  const totalAlreadyInCart = computed(() =>
    props.cart.reduce((sum, i) => (i.menu_id === props.product?.id ? sum + i.qty : sum), 0)
  )
  const remainingRoom = computed(() => Math.max(0, MAX_QTY_PER_ITEM - totalAlreadyInCart.value))

  const modifiersTotal = computed(() =>
    groups.value.reduce((sum, group) => {
      const selected = selectedIds(group)
      return (
        sum +
        selected.reduce((s, id) => {
          const opt = group.options.find(o => o.id === id)
          return s + (opt ? Number(opt.price) : 0)
        }, 0)
      )
    }, 0)
  )

  const unitPrice = computed(
    () => (props.product?.base_price ?? 0) + (selectedVariant.value?.price_adjustment ?? 0) + modifiersTotal.value
  )

  const totalPrice = computed(() => unitPrice.value * qty.value)

  const canConfirm = computed(
    () => !firstUnsatisfiedRequiredGroup.value && qty.value > 0 && qty.value <= remainingRoom.value
  )

  const confirmLabel = computed(() => {
    if (firstUnsatisfiedRequiredGroup.value) {
      return t('common.chooseGroup', { name: firstUnsatisfiedRequiredGroup.value.name })
    }
    return `${t('btn.addToCart')} · ${formatMoney(totalPrice.value, digitalMenuStore.currency)}`
  })

  function increaseQty() {
    if (qty.value >= remainingRoom.value) {
      emit('limit')
      return
    }
    qty.value++
  }

  function decreaseQty() {
    if (qty.value <= 1) return
    qty.value--
  }

  function close() {
    emit('update:modelValue', false)
  }

  function confirmAdd() {
    if (!props.product || !canConfirm.value) return

    const variant = selectedVariant.value
    const trimmedNote = note.value.trim()

    const selectedOptions = groups.value.flatMap(group =>
      selectedIds(group)
        .map(id => group.options.find(o => o.id === id))
        .filter((o): o is ModifierOption => !!o)
    )

    // The id encodes the full configuration (variant + every selected
    // modifier option + note) so two lines with any different customization
    // stay distinguishable in the cart instead of silently merging.
    const id = [
      variant ? `v${variant.id}` : 'base',
      selectedOptions.map(o => o.id).sort().join(','),
      trimmedNote
    ].join('::')

    emit('add', {
      id,
      menu_id: props.product.id,
      variant_id: variant?.id ?? null,
      name: props.product.name,
      image_url: props.product.image_url,
      base_price: unitPrice.value,
      size: variant?.name,
      modifiers: selectedOptions.map(o => ({ id: o.id, name: o.name, price: o.price })),
      note: trimmedNote,
      qty: qty.value
    })

    close()
  }
</script>

<template>
  <BaseBottomSheet :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <div v-if="product" class="px-5">
      <div class="mb-4 flex items-start gap-3">
        <div class="h-16 w-16 shrink-0 overflow-hidden rounded-card bg-ivory">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.name"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full w-full items-center justify-center text-charcoal/20">
            <ImageOff :size="22" aria-hidden="true" />
          </div>
        </div>
        <div class="min-w-0 flex-1 pt-1">
          <div class="text-lg font-bold text-charcoal">{{ product.name }}</div>
          <p v-if="product.description" class="mt-0.5 line-clamp-2 text-sm text-charcoal/50">
            {{ product.description }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-full p-1.5 text-charcoal/40 hover:bg-charcoal/5"
          :aria-label="t('common.close')"
          @click="close"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Size -->
      <div v-if="(product.variants?.length ?? 0) > 1" class="mb-6">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm font-bold text-charcoal">{{ t('common.size') }}</span>
          <span class="text-xs text-charcoal/40">
            {{ t('common.maxPerItem', { max: MAX_QTY_PER_ITEM }) }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="v in product.variants"
            :key="v.id"
            type="button"
            class="relative rounded-card border p-3 text-left transition-colors"
            :class="selectedVariant?.id === v.id ? 'border-olive bg-olive/5' : 'border-charcoal/10'"
            @click="selectedVariant = v"
          >
            <Check
              v-if="selectedVariant?.id === v.id"
              :size="16"
              class="absolute right-2 top-2 text-olive"
            />
            <div class="text-sm font-semibold text-charcoal">{{ v.name }}</div>
            <div class="text-xs text-charcoal/50">
              {{ formatMoney(product.base_price + v.price_adjustment, digitalMenuStore.currency) }}
            </div>
          </button>
        </div>
      </div>

      <!-- Modifier groups (real toppings/extras) -->
      <div v-for="group in orderedGroups" :key="group.id" class="mb-6">
        <div class="mb-3 flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="text-sm font-bold text-charcoal">{{ group.name }}</div>
            <div class="text-xs text-charcoal/40">{{ ruleText(group) }}</div>
          </div>
          <BaseBadge
            :tone="groupStatus(group) === 'required' ? 'warning' : groupStatus(group) === 'done' ? 'olive' : 'neutral'"
          >
            {{ t(`common.${groupStatus(group)}`) }}
          </BaseBadge>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in group.options"
            :key="opt.id"
            type="button"
            :disabled="group.selection_type === 'multiple' && !isSelected(group, opt.id) && isGroupFull(group)"
            class="rounded-pill border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            :class="isSelected(group, opt.id) ? 'border-olive bg-olive text-white' : 'border-charcoal/10 text-charcoal/70'"
            @click="onChoiceClick(group, opt)"
          >
            {{ opt.name }}
            <span v-if="opt.price">
              +{{ formatMoney(opt.price, digitalMenuStore.currency) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Quantity -->
      <div class="mb-6 flex items-center justify-between">
        <span class="text-sm font-bold text-charcoal">{{ t('common.quantity') }}</span>
        <QtyStepper
          :model-value="qty"
          :min="1"
          :max="MAX_QTY_PER_ITEM"
          @change="delta => (delta > 0 ? increaseQty() : decreaseQty())"
        />
      </div>

      <!-- Note -->
      <button
        v-if="!noteOpen"
        type="button"
        class="mb-4 w-full rounded-card border border-dashed border-olive/40 py-2.5 text-sm font-semibold text-olive"
        @click="noteOpen = true"
      >
        + {{ t('common.addNote') }}
      </button>
      <div v-else class="mb-4">
        <textarea
          v-model="note"
          rows="2"
          maxlength="100"
          :placeholder="t('common.notePlaceholder')"
          class="w-full resize-none rounded-card border border-charcoal/10 bg-ivory/60 p-3 text-sm text-charcoal outline-none focus:border-olive"
        />
      </div>
    </div>

    <div class="sticky bottom-0 bg-white px-5 pt-3">
      <BaseButton full-width size="lg" :disabled="!canConfirm" @click="confirmAdd">
        {{ confirmLabel }}
      </BaseButton>
    </div>
  </BaseBottomSheet>
</template>
