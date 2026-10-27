<script setup lang="ts">
  import { computed } from 'vue'
  import { Plus, ImageOff } from 'lucide-vue-next'
  import { formatCurrency } from '@nong-official-dev/core'
  import { useI18n } from 'vue-i18n'
  import QtyStepper from '../customs/QtyStepper.vue'
  import BaseBadge from '@/components/ui/BaseBadge.vue'
  import { useNotif } from '@/composables/useNotif'

  interface Variant {
    id: number | string
    name: string
    price: number
    base_price: number
  }

  interface Product {
    id: number | string
    name: string
    description?: string
    image_url?: string
    base_price?: number
    sort_order?: number
    has_variants?: boolean
    is_available?: boolean
    variants?: Variant[]
    category?: { id: number | string }
  }

  interface CartLine {
    id: string | number
    qty: number
    variant_id?: string | number
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

  const MAX_QTY_PER_ITEM = 5

  const sortedItems = computed(() =>
    [...(props.items || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  )

  const getQty = (id: string | number) => props.cart.find(i => i.id === id)?.qty || 0

  // Variant cart lines are matched by `variant_id`, not `id` — `id` now encodes
  // the full configuration (variant + sugar + note) so distinct customizations
  // of the same variant stay as separate lines instead of silently merging.
  const getProductTotalQty = (product: Product) => {
    if (!product.has_variants) return getQty(product.id)
    const variantIds = new Set((product.variants || []).map(v => v.id))
    return props.cart.reduce((sum, i) => (variantIds.has(i.variant_id as any) ? sum + i.qty : sum), 0)
  }

  const getLastVariantInCart = (product: Product) => {
    const variantIds = new Set((product.variants || []).map(v => v.id))
    return [...props.cart].reverse().find(i => variantIds.has(i.variant_id as any)) || null
  }

  function handleIncrease(product: Product) {
    if (product.is_available === false) return

    if (!product.has_variants) {
      if (getQty(product.id) >= MAX_QTY_PER_ITEM) {
        notif?.(t('notification.limitOrder'), { type: 'warning' })
        return
      }
      emit('add', { ...product, menu_id: product.id, qty: 1 })
      return
    }

    if (getProductTotalQty(product) >= MAX_QTY_PER_ITEM) {
      notif?.(t('notification.limitOrder'), { type: 'warning' })
      return
    }
    emit('customize', product)
  }

  function handleDecrease(product: Product) {
    if (!product.has_variants) {
      emit('update', product.id, -1)
      return
    }
    const last = getLastVariantInCart(product)
    if (last) emit('update', last.id, -1)
  }

  function handleStepperChange(product: Product, delta: number) {
    if (delta > 0) handleIncrease(product)
    else handleDecrease(product)
  }

  const displayPrice = (product: Product) =>
    product.has_variants ? product.variants?.[0]?.base_price : product.base_price
</script>



<template>
  <div
    class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
  >
    <article
      v-for="p in sortedItems"
      :key="p.id"
      class="group flex min-w-0 flex-col overflow-hidden rounded-2xl
             border border-charcoal/[0.07] bg-white
             shadow-[0_2px_12px_rgba(41,39,32,0.035)]
             transition-all duration-200
             hover:-translate-y-0.5 hover:shadow-soft"
      :class="{
        'opacity-75': p.is_available === false,
      }"
    >
      <!-- Product image -->
      <div class="relative m-2 mb-0 aspect-square overflow-hidden rounded-xl bg-ivory">
        <img
          v-if="p.image_url"
          :src="p.image_url"
          :alt="p.name"
          class="h-full w-full object-cover transition-transform duration-300
                 group-hover:scale-[1.03]"
          :class="{ 'grayscale': p.is_available === false }"
          loading="lazy"
        />

        <div
          v-else
          class="flex h-full w-full items-center justify-center text-charcoal/25"
        >
          <ImageOff :size="28" aria-hidden="true" />
        </div>

        <!-- Unavailable badge -->
        <div
          v-if="p.is_available === false"
          class="absolute inset-0 flex items-center justify-center bg-white/20"
        >
          <BaseBadge tone="neutral">
            {{ t('common.unavailable') }}
          </BaseBadge>
        </div>

        <!-- Quantity indicator -->
        <span
          v-if="getProductTotalQty(p) > 0"
          class="absolute right-2 top-2 flex h-7 min-w-7 items-center
                 justify-center rounded-full bg-olive px-2
                 text-xs font-semibold text-white shadow-sm"
        >
          {{ getProductTotalQty(p) }}
        </span>
      </div>

      <!-- Product information -->
      <div class="flex flex-1 flex-col p-3 pt-3">
        <h3
          class="line-clamp-2 min-h-10 text-sm font-semibold leading-5
                 tracking-[-0.01em] text-charcoal sm:text-base"
        >
          {{ p.name }}
        </h3>

        <p
          v-if="p.description"
          class="mt-1 line-clamp-2 text-xs leading-4 text-charcoal/55"
        >
          {{ p.description }}
        </p>

        <!-- Price and actions -->
        <div class="mt-auto flex items-center justify-between gap-2 pt-4">
          <span
            class="min-w-0 break-words text-sm font-bold leading-tight
                   tracking-[-0.02em] text-charcoal sm:text-base"
          >
            {{ formatCurrency(displayPrice(p)) }}
          </span>

          <button
            v-if="getProductTotalQty(p) === 0"
            type="button"
            :disabled="p.is_available === false"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center
                   rounded-full bg-olive text-white
                   transition-transform duration-150
                   hover:bg-olive/90 active:scale-90
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-olive focus-visible:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-30"
            :aria-label="`${t('btn.addToCart')}: ${p.name}`"
            @click="handleIncrease(p)"
          >
            <Plus :size="18" aria-hidden="true" />
          </button>

          <QtyStepper
            v-else
            :model-value="getProductTotalQty(p)"
            small
            :min="0"
            :max="MAX_QTY_PER_ITEM"
            @change="delta => handleStepperChange(p, delta)"
          />
        </div>
      </div>
    </article>
  </div>
</template>
