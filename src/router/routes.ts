import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/auth/login'
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'auth-login', component: () => import('pages/auth/LoginPage.vue') },
      { path: 'register', name: 'auth-register', component: () => import('pages/auth/RegisterPage.vue') },
      { path: 'verify', name: 'auth-verify', component: () => import('pages/auth/VerifyPage.vue') },
      // 如果需要，也可以加入 forgot-password 頁面
    ]
  },
  {
    path: '/milestone',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {path: '', name: 'Milestone', component: () => import('pages/MilestonePage.vue')}
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
