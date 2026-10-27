<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { Check, ImageOff, X } from 'lucide-vue-next'
  import { formatCurrency } from '@nong-official-dev/core'
  import { useI18n } from 'vue-i18n'
  import BaseBottomSheet from '@/components/ui/BaseBottomSheet.vue'
  import BaseButton from '@/components/ui/BaseButton.vue'
  import QtyStepper from '../customs/QtyStepper.vue'

  interface Variant {
    id: number | string
    name: string
    base_price: number
  }

  interface Product {
    id: number | string
    name: string
    description?: string
    image_url?: string
    has_variants?: boolean
    variants?: Variant[]
  }

  interface CartLine {
    id: string | number
    qty: number
    variant_id?: string | number
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

  const MAX_QTY_PER_ITEM = 5
  const SUGAR_OPTIONS = [0, 25, 50, 75, 100]

  const selectedVariant = ref<Variant | null>(null)
  const qty = ref(1)
  const sugar = ref(50)
  const note = ref('')

  function resetExtras() {
    selectedVariant.value = props.product?.variants?.[0] ?? null
    qty.value = 1
    sugar.value = 50
    note.value = ''
  }

  watch(
    () => props.modelValue,
    open => {
      if (open) resetExtras()
    }
  )

  const totalAlreadyInCart = computed(() => {
    if (!props.product?.has_variants) return 0
    const variantIds = new Set((props.product.variants || []).map(v => v.id))
    return props.cart.reduce((sum, i) => (variantIds.has(i.variant_id as any) ? sum + i.qty : sum), 0)
  })

  const remainingRoom = computed(() => Math.max(0, MAX_QTY_PER_ITEM - totalAlreadyInCart.value))

  const totalPrice = computed(() => qty.value * (selectedVariant.value?.base_price ?? 0))

  const canConfirm = computed(() => !!selectedVariant.value && qty.value > 0 && qty.value <= remainingRoom.value)

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
    if (!props.product || !selectedVariant.value || qty.value === 0) return
    if (qty.value > remainingRoom.value) {
      emit('limit')
      return
    }

    const variant = selectedVariant.value
    const trimmedNote = note.value.trim()

    // The id encodes the full configuration so two lines of the same variant
    // with a different sugar level or note stay distinguishable in the cart
    // instead of silently merging (and losing one of the customizations).
    const id = `v${variant.id}::${sugar.value}::${trimmedNote}`

    emit('add', {
      id,
      menu_id: props.product.id,
      variant_id: variant.id,
      name: props.product.name,
      image_url: props.product.image_url,
      has_variants: true,
      base_price: variant.base_price,
      size: variant.name,
      customizations: { variant_name: variant.name, sugar: sugar.value },
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
      <div class="mb-6">
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
            <div class="text-xs text-charcoal/50">{{ formatCurrency(v.base_price) }}</div>
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

      <!-- Sugar -->
      <div class="mb-6">
        <div class="mb-3 text-sm font-bold text-charcoal">{{ t('common.sugar') }}</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="s in SUGAR_OPTIONS"
            :key="s"
            type="button"
            class="rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors"
            :class="sugar === s ? 'bg-olive text-white' : 'bg-charcoal/[0.05] text-charcoal/70'"
            @click="sugar = s"
          >
            {{ s }}%
          </button>
        </div>
      </div>

      <!-- Note -->
      <div class="mb-4">
        <div class="mb-3 text-sm font-bold text-charcoal">{{ t('common.addNote') }}</div>
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
        {{ t('btn.addToCart') }} · {{ formatCurrency(totalPrice) }}
      </BaseButton>
    </div>
  </BaseBottomSheet>
</template>
