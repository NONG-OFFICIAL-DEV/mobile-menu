<script setup lang="ts">
  import { computed } from 'vue'
  import { Plus, ImageOff } from 'lucide-vue-next'
  import { useI18n } from 'vue-i18n'
  import QtyStepper from '../customs/QtyStepper.vue'
  import BaseBadge from '@/components/ui/BaseBadge.vue'
  import { useNotif } from '@/composables/useNotif'
  import { useMoney } from '@/composables/useMoney'
  import { useDigitalMenuStore } from '@/stores/digitalMenuStore'

  interface Variant {
    id: number | string
    name: string
    price_adjustment: number
    is_default?: boolean
    sort_order?: number
  }

  interface ModifierGroup {
    id: number | string
    options?: unknown[]
  }

  interface Product {
    id: number | string
    name: string
    description?: string
    image_url?: string
    base_price: number
    sort_order?: number
    is_available?: boolean
    variants?: Variant[]
    modifier_groups?: ModifierGroup[]
    category?: { id: number | string }
  }

  interface CartLine {
    id: string | number
    qty: number
    menu_id: string | number
  }

  const props = defineProps<{
    items: Product[]
    cart: CartLine[]
  }>()

  const emit = defineEmits<{
    add: [payload: Record<string, unknown>]
    update: [id: string | number, delta: number]
    customize: [product: Product]
  }>()

  const { t } = useI18n()
  const notif = useNotif()
  const { formatMoney } = useMoney()
  const digitalMenuStore = useDigitalMenuStore()

  const MAX_QTY_PER_ITEM = 5

  const sortedItems = computed(() =>
    [...(props.items || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  )

  // There's no `has_variants` flag on the real API — a product needs the
  // customize sheet if it actually has sizes and/or modifier groups to pick.
  const needsCustomization = (product: Product) =>
    (product.variants?.length ?? 0) > 0 || (product.modifier_groups?.length ?? 0) > 0

  // Every cart line — quick-added or built from the customize sheet — carries
  // `menu_id` back to the source product, so this works regardless of
  // whether the line's own `id` is the plain product id or a composite
  // variant+modifiers+note key.
  const getProductQtyInCart = (product: Product) =>
    props.cart.reduce((sum, i) => (i.menu_id === product.id ? sum + i.qty : sum), 0)

  const getLastLineInCart = (product: Product) =>
    [...props.cart].reverse().find(i => i.menu_id === product.id) || null

  function handleIncrease(product: Product) {
    if (product.is_available === false) return

    if (!needsCustomization(product)) {
      if (getProductQtyInCart(product) >= MAX_QTY_PER_ITEM) {
        notif?.(t('notification.limitOrder'), { type: 'warning' })
        return
      }
      emit('add', {
        id: product.id,
        menu_id: product.id,
        name: product.name,
        image_url: product.image_url,
        base_price: product.base_price,
        qty: 1
      })
      return
    }

    if (getProductQtyInCart(product) >= MAX_QTY_PER_ITEM) {
      notif?.(t('notification.limitOrder'), { type: 'warning' })
      return
    }
    emit('customize', product)
  }

  function handleDecrease(product: Product) {
    if (!needsCustomization(product)) {
      emit('update', product.id, -1)
      return
    }
    const last = getLastLineInCart(product)
    if (last) emit('update', last.id, -1)
  }

  function handleStepperChange(product: Product, delta: number) {
    if (delta > 0) handleIncrease(product)
    else handleDecrease(product)
  }

  // "$X+" (starting-at price) when the product has more than one size,
  // the exact price otherwise — variants only ever carry a
  // price_adjustment, never their own absolute price.
  const priceDisplay = (product: Product) => {
    const price = formatMoney(product.base_price, digitalMenuStore.currency)
    return (product.variants?.length ?? 0) > 1 ? `${price}+` : price
  }
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
    <div
      v-for="p in sortedItems"
      :key="p.id"
      class="flex flex-col rounded-card border border-charcoal/[0.06] bg-white p-3 shadow-soft"
    >
      <div class="relative mb-3 aspect-square overflow-hidden rounded-card bg-ivory">
        <img
          v-if="p.image_url"
          :src="p.image_url"
          :alt="p.name"
          class="h-full w-full object-cover"
          :class="{ 'opacity-40 grayscale': p.is_available === false }"
          loading="lazy"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-charcoal/20">
          <ImageOff :size="28" aria-hidden="true" />
        </div>

        <BaseBadge v-if="p.is_available === false" tone="neutral" class="absolute left-2 top-2">
          {{ t('common.unavailable') }}
        </BaseBadge>
      </div>

      <div class="mb-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-charcoal">
        {{ p.name }}
      </div>
      <p v-if="p.description" class="mb-2 line-clamp-1 text-xs text-charcoal/50">
        {{ p.description }}
      </p>

      <div class="mt-auto flex items-center justify-between pt-1">
        <span class="text-[15px] font-bold text-charcoal">{{ priceDisplay(p) }}</span>

        <button
          v-if="getProductQtyInCart(p) === 0"
          type="button"
          :disabled="p.is_available === false"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-olive text-white transition-transform active:scale-90 disabled:opacity-30"
          :aria-label="t('btn.addToCart')"
          @click="handleIncrease(p)"
        >
          <Plus :size="16" />
        </button>

        <QtyStepper
          v-else
          :model-value="getProductQtyInCart(p)"
          small
          :min="0"
          :max="MAX_QTY_PER_ITEM"
          @change="delta => handleStepperChange(p, delta)"
        />
      </div>
    </div>
  </div>
</template>
