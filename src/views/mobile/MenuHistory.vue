<script setup>
  import { onMounted } from 'vue'
  import CurrentOrder from '@/components/mobile/CurrentOrder.vue'
  import { useCartStore } from '@/stores/cartStore'
  import { useDigitalMenuStore } from '@/stores/digitalMenuStore'
  import { useMenuNav } from '../../composables/useMenuNav'

  const cartStore = useCartStore()
  const digitalMenuStore = useDigitalMenuStore()
  const { branchSlug, tableId, goToMenu } = useMenuNav()

  function close() {
    cartStore.clearCart()
    goToMenu()
  }

  onMounted(async () => {
    if (!digitalMenuStore.branch) {
      await digitalMenuStore.fetchDigitalMenus(branchSlug.value, tableId.value)
    }
  })
</script>

<template>
  <div>
    <CurrentOrder @close="close" />
  </div>
</template>
