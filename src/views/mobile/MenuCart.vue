<script setup>
  import { ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'

  import CartView from '@/components/mobile/CartView.vue'

  import { useCart } from '@/composables/useCart'
  import { useOrderStore } from '@/stores/orderStore'
  import { useMenuStore } from '@/stores/menuStore'

  const router = useRouter()
  const route = useRoute()
  const token = route.params.token
  const tableNumber = Number(localStorage.getItem('tableNumber'))

  const orderStore = useOrderStore()
  const menuStore = useMenuStore()

  const { cart, cartTotal, updateQty, clearCart } = useCart()

  const isOrdering = ref(false)

  async function placeOrder() {
    isOrdering.value = true
    try {
      const orderData = {
        table_id: tableNumber,
        items: cart.value.map(i => ({
          menu_id: i.menu_id,
          quantity: i.qty,
          price: i.price,
          note: i.note || null,
          customizations: i.customizations || null,
        })),
      }
      await orderStore.createOrder(orderData, 'noLoading')
      await menuStore.fetchMenus()
      router.replace({ name: 'menu.success', params: { token } })
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

  function goBack() {
    router.push({ name: 'menu.home', params: { token } })
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
  background: #FDF8F3;
  min-height: 100dvh;
}
</style>