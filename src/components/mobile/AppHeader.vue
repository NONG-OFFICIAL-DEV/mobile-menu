<script setup lang="ts">
  import { ShoppingCart, History } from 'lucide-vue-next'
  import { useI18n } from 'vue-i18n'
  import { storeToRefs } from 'pinia'
  import LanguageBottomSheet from '../customs/LanguageBottomSheet.vue'
  import { useCartStore } from '@/stores/cartStore'

  const { t } = useI18n()
  const { totalItems } = storeToRefs(useCartStore())

  defineProps<{
    tableNumber?: number | string | null
    isOrder?: { items?: unknown[] } | null
    branch?: { name?: string; logo_url?: string; is_open?: boolean } | null
  }>()

  defineEmits<{
    'view-cart': []
    'view-history': []
  }>()
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-charcoal/[0.06] bg-ivory/90 backdrop-blur-md">
    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <!-- Brand -->
      <div class="flex min-w-0 items-center gap-3">
        <img
          :src="
            branch?.logo_url ||
            'https://i.pinimg.com/736x/24/35/1f/24351fd9348c232ffb57e24fc809d5a2.jpg'
          "
          alt="Restaurant logo"
          class="h-10 w-10 shrink-0 rounded-card border-2 border-olive object-cover"
        />
        <div class="min-w-0">
          <div class="truncate text-[15px] font-bold text-charcoal">{{ branch?.name }}</div>
          <div class="flex items-center gap-1.5 text-[11px] text-charcoal/50">
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="branch?.is_open === false ? 'bg-red-400' : 'bg-olive'"
            />
            <span>
              {{ branch?.is_open === false ? t('common.closed') : t('common.open') }}
              <template v-if="tableNumber"> · {{ t('common.table') }} {{ tableNumber }}</template>
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex shrink-0 items-center gap-2">
        <button
          v-if="totalItems"
          type="button"
          class="relative inline-flex h-9 w-9 items-center justify-center rounded-card border border-charcoal/10 bg-white shadow-soft transition-transform active:scale-90"
          :aria-label="t('common.cart')"
          @click="$emit('view-cart')"
        >
          <ShoppingCart :size="18" class="text-olive-dark" />
          <span
            class="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-pill bg-olive px-1 text-[10px] font-bold text-white"
          >
            {{ totalItems }}
          </span>
        </button>

        <button
          v-if="isOrder?.items?.length"
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-card border border-charcoal/10 bg-white shadow-soft transition-transform active:scale-90"
          :aria-label="t('common.orderHistory')"
          @click="$emit('view-history')"
        >
          <History :size="18" class="text-olive-dark" />
        </button>

        <LanguageBottomSheet :stacked-btn="false" :icon-btn="true" />
      </div>
    </div>
  </header>
</template>
