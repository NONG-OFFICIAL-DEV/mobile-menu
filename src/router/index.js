import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/mobile/MobileMenuLayout.vue'),
    children: [
      // ── More specific routes FIRST ─────────────────────────────────────
      {
        path: 'menu/:branchSlug/table/:tableId/cart',
        name: 'menu.table.cart',
        component: () => import('@/views/mobile/MenuCart.vue')
      },
      {
        path: 'menu/:branchSlug/table/:tableId/history',
        name: 'menu.table.history',
        component: () => import('@/views/mobile/MenuHistory.vue')
      },
      {
        path: 'menu/:branchSlug/table/:tableId', // ← before menu.home
        name: 'menu.table',
        component: () => import('@/views/mobile/MenuHome.vue')
      },

      // ── Generic routes AFTER ───────────────────────────────────────────
      {
        path: 'menu/:branchSlug/cart',
        name: 'menu.cart',
        component: () => import('@/views/mobile/MenuCart.vue')
      },
      {
        path: 'menu/:branchSlug/history',
        name: 'menu.history',
        component: () => import('@/views/mobile/MenuHistory.vue')
      },
      {
        path: 'menu/:branchSlug/table/:tableId/success',
        name: 'menu.success',
        component: () => import('@/views/mobile/MenuSuccess.vue')
      },

      // ── Most generic LAST ──────────────────────────────────────────────
      {
        path: 'menu/:branchSlug',
        name: 'menu.home',
        component: () => import('@/views/mobile/MenuHome.vue')
      }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
