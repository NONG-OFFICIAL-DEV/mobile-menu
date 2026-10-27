<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { AnimatePresence, motion } from 'motion-v'
  import { RefreshCw, UtensilsCrossed, StoreIcon } from 'lucide-vue-next'
  import AppHeader from '../../components/mobile/AppHeader.vue'
  import CategoryTabs from '@/components/mobile/CategoryTabs.vue'
  import ProductCard from '@/components/mobile/ProductCard.vue'
  import ProductCustomizeSheet from '@/components/mobile/ProductCustomizeSheet.vue'
  import CartButton from '@/components/mobile/CartButton.vue'
  import AppContainer from '@/components/ui/AppContainer.vue'
  import BaseButton from '@/components/ui/BaseButton.vue'

  import { useCartStore } from '@/stores/cartStore'
  import { useNotif } from '@/composables/useNotif'
  import { useOrderStore } from '@/stores/orderStore'
  import { useDigitalMenuStore } from '@/stores/digitalMenuStore'
  import { storeToRefs } from 'pinia'
  import { useMenuNav } from '../../composables/useMenuNav'

  const { branchSlug, tableId, goToHistory, goToCart, goToTracking } = useMenuNav()
  const { t } = useI18n()
  const route = useRoute()

  const orderStore = useOrderStore()
  const digitalMenuStore = useDigitalMenuStore()

  const {
    branch,
    table: tableInfo,
    categories,
    loading: isLoading,
    error,
    tableNumber
  } = storeToRefs(digitalMenuStore)

  const allProducts = computed(() => digitalMenuStore.allProducts)
  const cartStore = useCartStore()
  const { items: cart, totalItems, cartTotal } = storeToRefs(cartStore)
  const { addToCart, updateQty } = cartStore
  const notif = useNotif()

  const orderCount = ref(0)
  const selectedCategory = ref<number | string>('All')
  const search = ref('')

  const showHeaderContext = computed(() => ['menu.home', 'menu.table'].includes(route.name as string))

  const featuredProducts = computed(() => allProducts.value.filter((p: any) => p.is_featured))

  const filteredProducts = computed(() => {
    let list =
      selectedCategory.value === 'All'
        ? allProducts.value
        : allProducts.value.filter((p: any) => p.category?.id === selectedCategory.value)

    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      list = list.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      )
    }
    return list
  })

  function reFilter() {
    search.value = ''
    selectedCategory.value = 'All'
  }

  // ── Product customization sheet ───────────────────────────────────────────
  const customizeOpen = ref(false)
  const customizeProduct = ref<any>(null)

  function openCustomize(product: any) {
    customizeProduct.value = product
    customizeOpen.value = true
  }

  function handleCustomizeAdd(item: any) {
    addToCart(item)
  }

  function handleCustomizeLimit() {
    notif?.(t('notification.limitOrder'), { type: 'warning' })
  }

  onMounted(async () => {
    await digitalMenuStore.fetchDigitalMenus(branchSlug.value, tableId.value)
    if (tableId.value) {
      const response = await orderStore.fetchSessionHistory(tableId.value)
      orderCount.value = (response.data ?? []).length
    }
  })
</script>

<template>
  <div class="min-h-dvh bg-ivory pb-28">
    <AppHeader
      v-if="showHeaderContext"
      :order-count="orderCount"
      :table-number="tableNumber"
      :branch="branch"
      @view-process="goToTracking"
      @view-history="goToHistory"
      @view-cart="goToCart"
    />

    <div class="sticky top-[65px] z-10">
      <CategoryTabs
        :categories="categories"
        :is-loading="isLoading"
        v-model="selectedCategory"
        v-model:search="search"
      />
    </div>

    <AppContainer>
      <!-- Hero / context banner -->
      <div v-if="showHeaderContext && !isLoading" class="pt-3 pb-1">
        <div class="flex items-center gap-4 rounded-card border border-charcoal/[0.06] bg-white p-5 shadow-soft">
          <div class="min-w-0 flex-1">
            <p class="mb-1 text-[11px] font-bold tracking-wide text-olive uppercase">
              {{ t('banner.todaySpecial') }}
            </p>
            <h1 class="truncate text-lg font-extrabold text-charcoal">
              {{ branch?.business_name || branch?.name || t('banner.orderByPhone') }}
            </h1>
            <p class="mt-1 text-sm text-charcoal/50">
              <span v-if="tableInfo">{{ t('common.table') }} {{ tableInfo.number }}</span>
              <span v-else>{{ t('banner.newDishes') }}</span>
            </p>
          </div>
          <img
            v-if="branch?.logo_url"
            :src="branch.logo_url"
            alt=""
            class="h-16 w-16 shrink-0 rounded-card object-cover"
          />
        </div>
      </div>

      <!-- Branch closed -->
      <div
        v-if="branch && branch.is_open === false"
        class="mt-3 flex items-center gap-2 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        <StoreIcon :size="16" />
        <span>{{ t('banner.closedMessage') }}</span>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="mt-3 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- Featured rail -->
      <div v-if="featuredProducts.length && !isLoading" class="pt-4">
        <div class="mb-2 px-1 text-sm font-bold text-charcoal">{{ t('common.popular') }}</div>
        <div class="scrollbar-none flex gap-3 overflow-x-auto pb-1">
          <div
            v-for="p in featuredProducts"
            :key="`featured-${p.id}`"
            class="w-32 shrink-0 rounded-card border border-charcoal/[0.06] bg-white p-2 shadow-soft"
          >
            <img
              v-if="p.image_url"
              :src="p.image_url"
              :alt="p.name"
              class="mb-2 h-20 w-full rounded-card object-cover"
            />
            <div class="truncate text-xs font-semibold text-charcoal">{{ p.name }}</div>
          </div>
        </div>
      </div>

      <!-- Section heading -->
      <div class="flex items-center justify-between px-1 pt-4 pb-3">
        <span class="text-base font-bold text-charcoal">{{ t('common.allDishes') }}</span>
        <span class="text-xs text-charcoal/40">
          {{ filteredProducts.length }} {{ t('common.dishes') }}
        </span>
      </div>

      <!-- Skeleton -->
      <div v-if="isLoading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        <div v-for="n in 6" :key="n" class="rounded-card border border-charcoal/[0.06] bg-white p-3">
          <div class="mb-3 aspect-square animate-pulse rounded-card bg-charcoal/[0.06]" />
          <div class="mb-2 h-3 w-3/4 animate-pulse rounded bg-charcoal/[0.06]" />
          <div class="h-3 w-1/3 animate-pulse rounded bg-charcoal/[0.06]" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredProducts.length === 0" class="flex flex-col items-center py-16 text-center">
        <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-olive/10">
          <UtensilsCrossed :size="32" class="text-olive" />
        </div>
        <p class="mb-1 text-[15px] font-bold text-charcoal">{{ t('common.dishesFound') }}</p>
        <p class="mb-5 text-sm text-charcoal/50">{{ t('common.tryOrderWord') }}</p>
        <BaseButton variant="secondary" size="sm" @click="reFilter">
          <template #icon-left><RefreshCw :size="14" /></template>
          {{ t('btn.reFilter') }}
        </BaseButton>
      </div>

      <!-- Products -->
      <AnimatePresence v-else mode="popLayout">
        <motion.div
          key="grid"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.15 }"
        >
          <ProductCard
            :items="filteredProducts"
            :cart="cart"
            @add="addToCart"
            @update="updateQty"
            @customize="openCustomize"
          />
        </motion.div>
      </AnimatePresence>
    </AppContainer>

    <ProductCustomizeSheet
      v-model="customizeOpen"
      :product="customizeProduct"
      :cart="cart"
      @add="handleCustomizeAdd"
      @limit="handleCustomizeLimit"
    />

    <AnimatePresence>
      <motion.div
        v-if="cart.length"
        key="cart-btn"
        :initial="{ opacity: 0, y: 40 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: 40 }"
        :transition="{ type: 'spring', stiffness: 400, damping: 32 }"
      >
        <CartButton :total-items="totalItems" :total-price="cartTotal" @open="goToCart" />
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style>
