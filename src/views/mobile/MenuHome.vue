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

  onMounted(async () => {
    await menuStore.fetchMenus()
    const res = await diningTableStore.getTableNumberByToken(token)
    tableNumber.value = res.table.table_number
    tableId.value = res.table.id
    order.value = await orderStore.fetchOrderByTable(res.table.id)

    await menuCategoryStore.fetchAllMenuCategory({ loading: 'skeleton' })

    // If user refresh cart but cart empty -> go home
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
  <div>
    <AppHeader
      v-if="$route.name === 'menu.home'"
      :isOrder="order"
      @view-process="goToTracking"
      @view-history="viewHistory"
      @view-cart="goToCart"
    />

    <div class="sticky-nav bg-white shadow-sm">
      <CategoryTabs
        :categories="menuCategoryStore.items"
        v-model="selectedCategory"
        v-model:search="search"
      />
    </div>

    <v-container class="pb-16">
      <v-row>
        <!-- Skeleton -->
        <template
          v-if="loadingStore.isLoading && loadingStore.mode === 'skeleton'"
        >
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

        <!-- Empty -->
        <template v-else-if="filteredProducts.length === 0">
          <v-col
            cols="12"
            class="d-flex flex-column align-center justify-center py-12"
          >
            <v-avatar color="#3b828e10" size="100" class="mb-6">
              <v-icon size="48" color="primary">mdi-book-search-outline</v-icon>
            </v-avatar>

            <h3 class="text-h6 font-weight-black mb-1">
              {{ t('common.dishesFound') }}
            </h3>

            <v-btn
              variant="tonal"
              color="primary"
              rounded="pill"
              @click="reFilter"
            >
              {{ t('btn.reFilter') }}
            </v-btn>
          </v-col>
        </template>

        <!-- Products -->
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

    <transition name="pop">
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
    position: -webkit-sticky; /* Support for Safari */
    position: sticky;
    top: 0;
    z-index: 10;
    background: white;
    width: 100%;
  }
</style>
