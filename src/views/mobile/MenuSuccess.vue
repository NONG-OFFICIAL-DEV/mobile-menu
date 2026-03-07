<script setup>
  import { useCart } from '@/composables/useCart'
  import { useMenuNav } from '@/composables/useMenuNav'
  import SuccessPage from '@/components/mobile/SuccessPage.vue'

  const { clearCart } = useCart()
  const { goToMenu, goToHistory, goToTracking, orderNumber } = useMenuNav()

  function reset() {
    clearCart()
    goToMenu()
  }

  function goBack() {
    goToMenu()
  }
</script>

<template>
  <div>
    <SuccessPage
      @back="goBack"
      @reset="reset"
      @view-history="goToHistory"
      @view-tracking="goToTracking(orderNumber)"
    />
  </div>
</template>
