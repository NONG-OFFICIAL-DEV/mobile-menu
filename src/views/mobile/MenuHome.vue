<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import AppHeader from '../../components/mobile/AppHeader.vue'
  import CategoryTabs from '@/components/mobile/CategoryTabs.vue'
  import ProductCard from '@/components/mobile/ProductCard.vue'
  import CartButton from '@/components/mobile/CartButton.vue'

  import { useCart } from '@/composables/useCart'
  import { useMenuStore } from '@/stores/menuStore'
  import { useCategoryMenuStore } from '@/stores/categoryMenu'
  import { useLoadingStore } from '@/stores/loadingStore'
  import { useDiningTableStore } from '@/stores/diningTableStore'
  import { useOrderStore } from '@/stores/orderStore'

  const { t } = useI18n()
  const router = useRouter()
  const route = useRoute()

  const token = route.params.token

  const menuStore = useMenuStore()
  const menuCategoryStore = useCategoryMenuStore()
  const loadingStore = useLoadingStore()
  const diningTableStore = useDiningTableStore()
  const orderStore = useOrderStore()

  const selectedCategory = ref('All')
  const search = ref('')

  const { cart, totalItems, cartTotal, addToCart, updateQty } = useCart()

  function reFilter() {
    search.value = ''
  }

  const filteredProducts = computed(() => {
    let list = menuStore.menus.data || []
    if (selectedCategory.value !== 'All') {
      list = list.filter(p => p.menu_category_id === selectedCategory.value)
    }
    if (search.value) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(search.value.toLowerCase())
      )
    }
    return list
  })

  const tableNumber = ref(null)
  const tableId = ref(null)
  const order = ref({})
  const isLoading = ref(false)

  onMounted(async () => {
    isLoading.value = true
    await menuStore.fetchMenus()
    await menuCategoryStore.fetchAllMenuCategory({ loading: 'skeleton' })
    isLoading.value = false
    const res = await diningTableStore.getTableNumberByToken(token)
    tableNumber.value = res.table.table_number
    tableId.value = res.table.id
    order.value = await orderStore.fetchOrderByTable(res.table.id)

    if (route.name === 'menu.cart' && cart.value.length === 0) {
      router.replace({ name: 'menu.home', params: { token } })
    }
  })

  function goToCart() {
    router.push({ name: 'menu.cart', params: { token } })
  }
  function goToTracking() {
    router.push({ name: 'menu.tracking', params: { token } })
  }
  function viewHistory() {
    router.push({ name: 'menu.history', params: { token } })
  }
</script>

<template>
  <div class="page-bg">
    <!-- HEADER -->
    <AppHeader
      v-if="$route.name === 'menu.home'"
      :isOrder="order || {}"
      :tableNumber="tableNumber"
      @view-process="goToTracking"
      @view-history="viewHistory"
      @view-cart="goToCart"
    />

    <!-- STICKY CATEGORY NAV -->
    <div class="sticky-nav">
      <CategoryTabs
        :categories="menuCategoryStore.items"
        :isLoading="isLoading"
        v-model="selectedCategory"
        v-model:search="search"
      />
    </div>

    <!-- HERO BANNER -->
    <div
      v-if="$route.name === 'menu.home' && !isLoading"
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
            🔥 {{t('banner.todaySpecial')}}
          </p>
          <h2 class="hero-title font-weight-black">
            {{t('banner.orderByPhone')}}
          </h2>
          <p class="hero-sub text-caption mt-1">
            {{t('banner.newDishes')}}
          </p>
        </div>
        <v-spacer />
        <v-avatar size="80" rounded="xl" class="hero-img-avatar">
          <v-img
            src="https://i.pinimg.com/736x/52/a5/14/52a514a2948c9e7eaff650e4143e8c60.jpg"
            cover
          />
        </v-avatar>
        <!-- decorative circles -->
        <span class="hero-decor hero-decor-1" />
        <span class="hero-decor hero-decor-2" />
      </v-card>
    </div>

    <!-- CONTENT -->
    <v-container class="pb-28 pt-3" fluid>
      <div class="d-flex align-center justify-space-between px-1 mb-3">
        <span class="section-title">{{t('common.allDishes')}}</span>
        <span class="section-count text-caption">
          {{ filteredProducts.length }} {{t('common.dishes')}}
        </span>
      </div>

      <v-row dense>
        <!-- ── SKELETON ── -->
        <template v-if="isLoading && loadingStore.mode === 'skeleton'">
          <v-col v-for="n in 6" :key="n" cols="6" class="pa-2">
            <v-card flat rounded="xl" class="pa-3 bg-white">
              <div class="d-flex justify-space-between align-center">
                <v-skeleton-loader
                  type="avatar"
                  height="100"
                  class="image mx-auto mb-2"
                ></v-skeleton-loader>
              </div>
              <v-skeleton-loader type="text" width="80%" class="mx-auto mb-4" />
              <div class="d-flex justify-space-between align-center">
                <v-skeleton-loader type="text" width="40%" />
                <v-skeleton-loader type="avatar" size="32" />
              </div>
            </v-card>
          </v-col>
        </template>

        <!-- ── EMPTY ── -->
        <template v-else-if="filteredProducts.length === 0">
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

        <!-- ── PRODUCTS ── -->
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
  /* ─── STICKY NAV ─── */
  .sticky-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(253, 248, 243, 0.92);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  /* ─── HERO ─── */
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
    color: #ffffff;
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

  /* ─── SECTION HEADING ─── */
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

  /* ─── SKELETON CARD ─── */
  .skeleton-card {
    background: #fff !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
  }

  /* ─── EMPTY STATE ─── */
  .empty-icon-wrap {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(45, 122, 110, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ─── CART BUTTON TRANSITION ─── */
  .cart-pop-enter-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .cart-pop-leave-active {
    transition: all 0.25s ease;
  }

  .cart-pop-enter-from,
  .cart-pop-leave-to {
    transform: translateY(80px);
    opacity: 0;
  }

  /* bottom padding so last card not hidden by cart button */
  .pb-28 {
    padding-bottom: 112px !important;
  }
</style>
