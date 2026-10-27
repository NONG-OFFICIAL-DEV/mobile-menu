<script setup>
  import CurrentOrder from '@/components/mobile/CurrentOrder.vue'
  import { useCartStore } from '@/stores/cartStore'
  import { useMenuNav } from '../../composables/useMenuNav'

  const cartStore = useCartStore()
  const { goToMenu } = useMenuNav()
  function close() {
    cartStore.clearCart()
    goToMenu()
  }
</script>

<template>
  <div>
    <CurrentOrder @close="close" />
  </div>
</template>
