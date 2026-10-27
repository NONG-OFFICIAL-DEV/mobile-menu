<script setup lang="ts">
  import { useCartStore } from '@/stores/cartStore'
  import { useMenuNav } from '@/composables/useMenuNav'
  import SuccessPage from '@/components/mobile/SuccessPage.vue'

  const cartStore = useCartStore()
  const { goToMenu, goToHistory } = useMenuNav()

  function reset() {
    cartStore.clearCart()
    goToMenu()
  }

  function goBack() {
    goToMenu()
  }
</script>

<template>
  <div>
    <SuccessPage @back="goBack" @reset="reset" @view-history="goToHistory" />
  </div>
</template>
