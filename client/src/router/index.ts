import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    }
    ,
    {
      path: '/gallery',
      name: 'gallery',
      component: () => import('@/views/Gallery.vue')
    }
    ,
    {
      path: '/draw',
      name: 'draw',
      component: () => import('@/views/Draw.vue')
    }
    ,
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    }
    ,
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue')
    }
  ]
})

export default router
