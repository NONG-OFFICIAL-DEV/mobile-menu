// stores/digitalMenuStore.js
import { defineStore } from 'pinia'
import { toValue } from 'vue'
import { digitalMenuService } from '@/api/digitalMenuService'

export const useDigitalMenuStore = defineStore('digitalMenu', {
  state: () => ({
    branch: null,
    table: null,
    menus: [],
    categories: [],
    loading: false,
    error: null,
    tableId: null // ← add — persists across route changes
  }),

  getters: {
    allProducts: state => state.categories.flatMap(c => c.products ?? []),
    tableNumber: state => state.table?.number ?? null,
    isOpen: state => state.branch?.is_open ?? true,
    currency: state => state.branch?.currency ?? 'USD',
    isDineIn: state => !!state.tableId // ← add — true when customer has table
  },

  actions: {
    async fetchDigitalMenus(branchSlug, tableId = null) {
      this.loading = true
      this.error = null

      const slug = toValue(branchSlug)
      const table = toValue(tableId)

      // ── Save tableId to state ──────────────────────────────────────────
      this.tableId = table

      try {
        const res = await digitalMenuService.getDigitalMenus(slug, table)
        const data = res.data.data

        this.branch = data.branch
        this.table = data.table
        this.menus = data.menus ?? []
        this.categories = data.categories ?? []
      } catch (err) {
        this.error = err?.response?.data?.message || 'Failed to load menu'
      } finally {
        this.loading = false
      }
    },

    reset() {
      this.branch = null
      this.table = null
      this.menus = []
      this.categories = []
      this.error = null
      this.tableId = null // ← add
    }
  }
})
