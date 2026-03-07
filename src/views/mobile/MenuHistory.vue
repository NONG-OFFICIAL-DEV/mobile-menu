<script setup>
  import CurrentOrder from '@/components/mobile/CurrentOrder.vue'
  import { useCart } from '@/composables/useCart'

  const { clearCart } = useCart()
  import { useMenuNav } from '../../composables/useMenuNav'

  const { goToMenu } = useMenuNav()
  function close() {
    clearCart()
    goToMenu()
  }
</script>

<template>
  <div>
    <CurrentOrder @close="close" />
  </div>
</template>
