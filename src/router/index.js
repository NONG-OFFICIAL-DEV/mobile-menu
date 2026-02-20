import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/mobile-menu/:token',
    component: () => import('@/views/mobile/MobileMenuLayout.vue'),
    children: [
      {
        path: '',
        name: 'menu.home',
        component: () => import('@/views/mobile/MenuHome.vue')
      },
      {
        path: 'cart',
        name: 'menu.cart',
        component: () => import('@/views/mobile/MenuCart.vue')
      },
      {
        path: 'success',
        name: 'menu.success',
        component: () => import('@/views/mobile/MenuSuccess.vue')
      },
      {
        path: 'tracking',
        name: 'menu.tracking',
        component: () => import('@/views/mobile/MenuTracking.vue')
      },
      {
        path: 'history',
        name: 'menu.history',
        component: () => import('@/views/mobile/MenuHistory.vue')
      }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
