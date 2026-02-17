import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/mobile-menu/:token',
    name: 'MobileMenu',
    component: () => import('@/views/mobile/MobileOrder.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
