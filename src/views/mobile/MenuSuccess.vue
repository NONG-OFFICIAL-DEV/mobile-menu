<script setup>
  import { useRouter, useRoute } from 'vue-router'
  import { useCart } from '@/composables/useCart'
  import SuccessPage from '@/components/mobile/SuccessPage.vue'

  const router = useRouter()
  const route = useRoute()
  const token = route.params.token

  const { clearCart } = useCart()

  function reset() {
    clearCart()
    router.replace({ name: 'menu.home', params: { token } })
  }

  function viewHistory() {
    router.push({ name: 'menu.history', params: { token } })
  }

  function goBack() {
    router.replace({ name: 'menu.home', params: { token } })
  }
</script>

<template>
  <div>
    <SuccessPage @back="goBack" @reset="reset" @view-history="viewHistory" />
  </div>
</template>
