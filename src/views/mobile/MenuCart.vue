<script setup>
  import { ref, computed, onMounted } from 'vue'
  import CartView from '@/components/mobile/CartView.vue'
  import { useDigitalMenuStore } from '@/stores/digitalMenuStore'
  import { useCart } from '@/composables/useCart'
  import { useOrderStore } from '@/stores/orderStore'
  import { useMenuNav } from '@/composables/useMenuNav'

  const digitalMenuStore = useDigitalMenuStore()
  const { branchSlug, tableId, goToMenu, goToSuccess } = useMenuNav()
  const orderStore = useOrderStore()
  const { cart, cartTotal, updateQty, clearCart } = useCart()

  const tableNumber = computed(() => digitalMenuStore.tableNumber)
  const isOrdering = ref(false)

  async function placeOrder() {
    isOrdering.value = true
    try {
      const orderData = {
        branch_id: digitalMenuStore.branch?.id,
        table_id: digitalMenuStore.tableId ?? null,
        items: cart.value.map(i => ({
          product_id: i.menu_id,
          quantity: i.qty,
          price: i.base_price,
          note: i.note || null,
          customizations: i.customizations || null
        }))
      }
      await orderStore.placeOrder(orderData, 'noLoading')
      goToSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      isOrdering.value = false
    }
  }

  function handleUpdateNote(itemId, note) {
    const item = cart.value.find(i => i.id === itemId)
    if (item) item.note = note
  }
  onMounted(async () => {
    if (!digitalMenuStore.branch) {
      await digitalMenuStore.fetchDigitalMenus(branchSlug.value, tableId.value)
    }
  })
  function goBack() {
    goToMenu()
  }
</script>

<template>
  <div class="page-bg">
    <CartView
      :cart="cart"
      :total="cartTotal"
      :tableNumber="tableNumber"
      :loading="isOrdering"
      @back="goBack"
      @update="updateQty"
      @submit="placeOrder"
      @clear="clearCart"
      @update-note="handleUpdateNote"
    />
  </div>
</template>

<style scoped>
  .page-bg {
    background: #fdf8f3;
    min-height: 100dvh;
  }
</style>
