import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'simulation',
    component: () => import('../views/SimulationDashboard.vue')
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})
