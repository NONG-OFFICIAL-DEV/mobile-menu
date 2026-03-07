<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import AppHeader from '../../components/mobile/AppHeader.vue'
  import CategoryTabs from '@/components/mobile/CategoryTabs.vue'
  import ProductCard from '@/components/mobile/ProductCard.vue'
  import CartButton from '@/components/mobile/CartButton.vue'

  import { useCart } from '@/composables/useCart'
  import { useLoadingStore } from '@/stores/loadingStore'
  import { useOrderStore } from '@/stores/orderStore'
  import { useDigitalMenuStore } from '@/stores/digitalMenuStore'
  import { storeToRefs } from 'pinia'
  import { useMenuNav } from '../../composables/useMenuNav'

  const { branchSlug, tableId, goToHistory, goToCart, goToTracking } =
    useMenuNav()
  const { t } = useI18n()
  const router = useRouter()
  const route = useRoute()

  const loadingStore = useLoadingStore()
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
  const { cart, totalItems, cartTotal, addToCart, updateQty } = useCart()

  const order = ref(null)
  const selectedCategory = ref('All')
  const search = ref('')

  // ── Filtered products ──────────────────────────────────────────────────────
  const filteredProducts = computed(() => {
    let list =
      selectedCategory.value === 'All'
        ? allProducts.value
        : allProducts.value.filter(
            p => p.category?.id === selectedCategory.value
          )

    if (search.value?.trim()) {
      const q = search.value.toLowerCase()
      list = list.filter(
        p =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }
    return list
  })

  function reFilter() {
    search.value = ''
    selectedCategory.value = 'All'
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  onMounted(async () => {
    await digitalMenuStore.fetchDigitalMenus(branchSlug.value, tableId.value)
    if (tableId.value) {
      const response = await orderStore.fetchOrderByTable(tableId.value)
      order.value = response.data
    }

    if (route.name === 'menu.cart' && cart.value.length === 0) {
      router.replace({
        name: 'menu.home',
        params: { branchSlug: branchSlug.value }
      })
    }
  })
</script>

<template>
  <div class="page-bg">
    <!-- HEADER — show on both menu.home and menu.table -->
    <AppHeader
      v-if="['menu.home', 'menu.table'].includes($route.name)"
      :isOrder="order || {}"
      :tableNumber="tableNumber"
      :branch="branch"
      @view-process="goToTracking"
      @view-history="goToHistory"
      @view-cart="goToCart"
    />
    <!-- STICKY CATEGORY NAV -->
    <div class="sticky-nav">
      <CategoryTabs
        :categories="categories"
        :isLoading="isLoading"
        v-model="selectedCategory"
        v-model:search="search"
      />
    </div>

    <!-- HERO BANNER — only on menu.table (dine-in with table context) -->
    <div
      v-if="['menu.home', 'menu.table'].includes($route.name) && !isLoading"
      class="hero-wrap px-4 pt-3 pb-1"
    >
      <v-card
        rounded="xl"
        class="hero-card pa-5 d-flex align-center"
        flat
        elevation="0"
      >
        <div>
          <p
            class="hero-label text-caption font-weight-bold mb-1 text-uppercase"
          >
            🔥 {{ t('banner.todaySpecial') }}
          </p>
          <h2 class="hero-title font-weight-black">
            {{ branch?.business_name || t('banner.orderByPhone') }}
          </h2>
          <p class="hero-sub text-caption mt-1">
            <span v-if="tableInfo">🪑 Table {{ tableInfo.number }}</span>
            <span v-else>{{ t('banner.newDishes') }}</span>
          </p>
        </div>
        <v-spacer />
        <v-avatar size="80" rounded="xl" class="hero-img-avatar">
          <v-img
            :src="
              branch?.logo_url ||
              'https://i.pinimg.com/736x/52/a5/14/52a514a2948c9e7eaff650e4143e8c60.jpg'
            "
            cover
          />
        </v-avatar>
        <span class="hero-decor hero-decor-1" />
        <span class="hero-decor hero-decor-2" />
      </v-card>
    </div>

    <!-- Branch closed warning -->
    <v-alert
      v-if="branch && !branch.is_open"
      type="warning"
      variant="tonal"
      rounded="0"
      density="compact"
      class="mx-0"
      icon="mdi-store-off-outline"
      text="This branch is currently closed. You can still browse."
    />

    <!-- Error -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      rounded="lg"
      class="ma-4"
      :text="error"
    />

    <!-- CONTENT -->
    <v-container class="pb-16 pt-3" fluid>
      <div class="d-flex align-center justify-space-between px-1 mb-3">
        <span class="section-title">{{ t('common.allDishes') }}</span>
        <span class="section-count text-caption">
          {{ filteredProducts.length }} {{ t('common.dishes') }}
        </span>
      </div>

      <v-row dense>
        <!-- SKELETON -->
        <template v-if="isLoading && loadingStore.mode === 'skeleton'">
          <v-col v-for="n in 6" :key="n" cols="6" class="pa-2">
            <v-card flat rounded="xl" class="pa-3 bg-white">
              <div class="d-flex justify-space-between align-center">
                <v-skeleton-loader
                  type="avatar"
                  height="100"
                  class="image mx-auto mb-2"
                />
              </div>
              <v-skeleton-loader type="text" width="80%" class="mx-auto mb-4" />
              <div class="d-flex justify-space-between align-center">
                <v-skeleton-loader type="text" width="40%" />
                <v-skeleton-loader type="avatar" size="32" />
              </div>
            </v-card>
          </v-col>
        </template>

        <!-- EMPTY -->
        <template v-else-if="filteredProducts.length === 0 && !isLoading">
          <v-col cols="12">
            <div
              class="empty-state d-flex flex-column align-center justify-center py-16 px-4"
            >
              <div class="empty-icon-wrap mb-5">
                <v-icon size="40" color="primary">
                  mdi-silverware-fork-knife
                </v-icon>
              </div>
              <p class="text-subtitle-1 font-weight-bold mb-1">
                {{ t('common.dishesFound') }}
              </p>
              <p class="text-caption text-medium-emphasis mb-5">
                {{ t('common.tryOrderWord') }}
              </p>
              <v-btn
                color="primary"
                variant="tonal"
                rounded="pill"
                size="small"
                prepend-icon="mdi-refresh"
                @click="reFilter"
              >
                {{ t('btn.reFilter') }}
              </v-btn>
            </div>
          </v-col>
        </template>

        <!-- PRODUCTS -->
        <template v-else>
          <ProductCard
            :items="filteredProducts"
            :cart="cart"
            @add="addToCart"
            @update="updateQty"
          />
        </template>
      </v-row>
    </v-container>

    <!-- CART FLOAT BUTTON -->
    <transition name="cart-pop">
      <CartButton
        v-if="cart.length"
        :totalItems="totalItems"
        :totalPrice="cartTotal"
        @open="goToCart"
      />
    </transition>
  </div>
</template>

<style scoped>
  :deep(.image .v-skeleton-loader__avatar) {
    max-height: 100px;
    min-height: 100px;
    height: 100px;
    max-width: 100px;
    min-width: 100px;
    width: 100px;
  }
  .sticky-nav {
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .hero-card {
    background: linear-gradient(135deg, #2d7a6e 0%, #1a5c52 100%) !important;
    min-height: 130px;
    overflow: hidden;
    position: relative;
  }
  .hero-label {
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 1px;
  }
  .hero-title {
    font-size: 22px;
    color: #fff;
    line-height: 1.2;
    font-family: 'Georgia', serif;
  }
  .hero-sub {
    color: rgba(255, 255, 255, 0.65);
  }
  .hero-img-avatar {
    border-radius: 16px !important;
    border: 2px solid rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }
  .hero-decor {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    pointer-events: none;
  }
  .hero-decor-1 {
    width: 100px;
    height: 100px;
    bottom: -30px;
    right: -10px;
  }
  .hero-decor-2 {
    width: 60px;
    height: 60px;
    top: -20px;
    right: 80px;
  }
  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1c1c1e;
    letter-spacing: -0.2px;
  }
  .section-count {
    color: #8e8e93;
    font-weight: 500;
  }
  .empty-icon-wrap {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(45, 122, 110, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cart-pop-enter-active {
    animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .cart-pop-leave-active {
    animation: pop-in 0.2s reverse;
  }
  @keyframes pop-in {
    0% {
      transform: scale(0.5) translateY(100px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
  .pb-16 {
    padding-bottom: 112px !important;
  }
</style>
