<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import TrackingView from '@/components/mobile/TrackingView.vue'
import { useCart } from '@/composables/useCart'

const props = defineProps({
  tableNumber: String,
  tableId: Number
})

const router = useRouter()
const route = useRoute()
const token = route.params.token

const { cart, clearCart } = useCart()
const viewProcess = ref(false)

function reset() {
  clearCart()
  router.replace({ name: 'menu.home', params: { token } })
}

function back() {
  router.push({ name: 'menu.home', params: { token } })
}
</script>

<template>
  <TrackingView
    v-model="viewProcess"
    :cart="cart"
    :tableNumber="tableNumber"
    :tableId="tableId"
    @back="back"
    @reset="reset"
  />
</template>
