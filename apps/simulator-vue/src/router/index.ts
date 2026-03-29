import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'simulator',
    component: () => import('../layouts/AppLayout.vue')
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})
