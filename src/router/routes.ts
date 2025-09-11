import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // 首頁改為介紹頁（不需要登入）
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', name: 'Home', component: () => import('pages/IntroHomePage.vue') }],
  },
  // 認證相關頁面（登入、註冊、驗證...）
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'auth-login', component: () => import('pages/auth/LoginPage.vue') },
      {
        path: 'register',
        name: 'auth-register',
        component: () => import('pages/auth/RegisterPage.vue'),
      },
      { path: 'verify', name: 'auth-verify', component: () => import('pages/auth/VerifyPage.vue') },
      // 如果需要也可以加入 forgot-password 頁面
    ],
  },
  // 編輯個人資料頁面：此路由只在使用者已登入時會用到
  {
    path: '/profile',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'ProfileEdit', component: () => import('pages/ProfileEditPage.vue') },
      { path: 'add-baby', name: 'AddBaby', component: () => import('pages/AddBabyPage.vue') },
    ],
  },
  // 里程碑頁面
  {
    path: '/milestone',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'Milestone', component: () => import('pages/MilestonePage.vue') },
    ],
  },
  // FlashCard 頁面
  {
    path: '/flashcard',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'FlashCard', component: () => import('pages/FlashCardPage.vue') },
    ],
  },
  // 疫苗接種時程表頁面
  {
    path: '/vaccine',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', name: 'Vaccine', component: () => import('pages/VaccinePage.vue') }],
  },
  // 捕捉所有未定義的路由
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
