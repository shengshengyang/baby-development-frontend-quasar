import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // 首頁直接使用 milestone 頁面，不需要登入
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'Milestone', component: () => import('pages/MilestonePage.vue') }
    ]
  },
  // 認證相關頁面（登入、註冊、驗證...）
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'auth-login', component: () => import('pages/auth/LoginPage.vue') },
      { path: 'register', name: 'auth-register', component: () => import('pages/auth/RegisterPage.vue') },
      { path: 'verify', name: 'auth-verify', component: () => import('pages/auth/VerifyPage.vue') },
      // 如果需要也可以加入 forgot-password 頁面
    ]
  },
  // 編輯個人資料頁面：此路由只在使用者已登入時會用到
  {
    path: '/profile',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'ProfileEdit', component: () => import('pages/ProfileEditPage.vue') },
      { path: 'add-baby', name: 'AddBaby', component: () => import('pages/AddBabyPage.vue') },
    ]
  },
  // 如果需要讓 milestone 有其他 alias，也可以保留此路由（選用）
  {
    path: '/milestone',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'MilestoneAlias', component: () => import('pages/MilestonePage.vue') }
    ]
  },
  // 捕捉所有未定義的路由
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
