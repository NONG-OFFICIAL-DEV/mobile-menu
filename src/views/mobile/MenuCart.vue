<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import CartView from '@/components/mobile/CartView.vue'
  import { useDigitalMenuStore } from '@/stores/digitalMenuStore'
  import { useCartStore } from '@/stores/cartStore'
  import { useOrderStore } from '@/stores/orderStore'
  import { useMenuNav } from '@/composables/useMenuNav'

  const digitalMenuStore = useDigitalMenuStore()
  const cartStore = useCartStore()
  const { branchSlug, tableId, goToMenu, goToSuccess } = useMenuNav()
  const orderStore = useOrderStore()

  const tableNumber = computed(() => digitalMenuStore.tableNumber)
  const isOrdering = ref(false)

  async function placeOrder() {
    isOrdering.value = true
    try {
      const orderData = {
        branch_id: digitalMenuStore.branch?.id,
        table_id: digitalMenuStore.tableId ?? null,
        items: cartStore.items.map(i => ({
          product_id: i.menu_id,
          quantity: i.qty,
          price: i.base_price,
          note: i.note || null,
          customizations: i.customizations || null
        }))
      }
      await orderStore.placeOrder(orderData, 'noLoading')
      cartStore.clearCart()
      goToSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      isOrdering.value = false
    }
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
  <div class="min-h-dvh bg-ivory">
    <CartView :table-number="tableNumber" :loading="isOrdering" @back="goBack" @submit="placeOrder" />
  </div>
</template>
