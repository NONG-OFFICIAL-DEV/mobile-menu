// composables/useMenuNav.js
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDigitalMenuStore } from '../stores/digitalMenuStore'
const digitalMenuStore = useDigitalMenuStore()

export function useMenuNav() {
  const route = useRoute()
  const router = useRouter()

  // ── Reactive params ───────────────────────────────────────────────────────
  const branchSlug = computed(() => route.params.branchSlug ?? null)
  const tableId = computed(() => route.params.tableId ?? null)
  const orderNumber = computed(() => route.params.orderNumber ?? null)

  // ── Fetch menu using plain values ─────────────────────────────────────────
  const fetchMenu = store => store.fetchMenu(branchSlug.value, tableId.value)

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goToMenu = () =>
    tableId.value
      ? router.push({
          name: 'menu.table',
          params: { branchSlug: branchSlug.value, tableId: tableId.value }
        })
      : router.push({
          name: 'menu.home',
          params: { branchSlug: branchSlug.value }
        })

  const goToCart = () =>
    tableId.value
      ? router.push({
          name: 'menu.table.cart',
          params: { branchSlug: branchSlug.value, tableId: tableId.value }
        })
      : router.push({
          name: 'menu.cart',
          params: { branchSlug: branchSlug.value }
        })

  const goToTracking = orderNum =>
    tableId.value
      ? router.push({
          name: 'menu.table.tracking',
          params: {
            branchSlug: branchSlug.value,
            tableId: tableId.value,
            orderNumber: orderNum
          }
        })
      : router.push({
          name: 'menu.tracking',
          params: { branchSlug: branchSlug.value, orderNumber: orderNum }
        })

  const goToHistory = () =>
    tableId.value
      ? router.push({
          name: 'menu.table.history',
          params: { branchSlug: branchSlug.value, tableId: tableId.value }
        })
      : router.push({
          name: 'menu.history',
          params: { branchSlug: branchSlug.value }
        })

  const goToSuccess = () =>
    router.push({
      name: 'menu.success',
      params: { branchSlug: branchSlug.value, tableId: tableId.value }
    })

  return {
    branchSlug,
    tableId,
    orderNumber,
    fetchMenu, // ← new
    goToMenu,
    goToCart,
    goToSuccess,
    goToTracking,
    goToHistory
  }
}
