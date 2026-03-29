import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'simulation',
        component: () => import('../views/SimulationDashboard.vue')
      },
      {
        path: 'params/basic',
        name: 'params-basic',
        component: () => import('../views/ParamsBasicView.vue')
      },
      {
        path: 'params/environment',
        name: 'params-environment',
        component: () => import('../views/ParamsEnvironmentView.vue')
      },
      {
        path: 'params/physical',
        name: 'params-physical',
        component: () => import('../views/ParamsPhysicalView.vue')
      },
      {
        path: 'params/biological',
        name: 'params-biological',
        component: () => import('../views/ParamsBiologicalView.vue')
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})
