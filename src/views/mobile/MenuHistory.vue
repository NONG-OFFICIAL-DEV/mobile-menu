<script setup>
  import { useRouter, useRoute } from 'vue-router'
  import CurrentOrder from '@/components/mobile/CurrentOrder.vue'
  import { useCart } from '@/composables/useCart'

  const { clearCart } = useCart()

  const router = useRouter()
  const route = useRoute()
  const token = route.params.token

  function close() {
    clearCart()
    router.push({ name: 'menu.home', params: { token } })
  }
</script>

<template>
  <div>
    <CurrentOrder @close="close" />
  </div>
</template>
