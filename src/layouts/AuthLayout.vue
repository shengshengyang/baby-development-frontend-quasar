<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header 區塊 -->
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>寶發高</q-toolbar-title>
        <q-space />
        <!-- 個人資料按鈕，點擊後根據登入狀態導向不同頁面 -->
        <q-btn flat round icon="person" @click="goToUserPage" />
      </q-toolbar>
    </q-header>

    <!-- 主內容區 -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer 區塊，只放首頁按鈕 -->
    <q-footer elevated>
      <q-btn flat label="首頁" icon="home" @click="router.push({ name: 'Milestone' })" />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'

const router = useRouter()
const userStore = useUserStore()

async function goToUserPage() {
  // 如果有登入則導向編輯頁，否則導向登入頁
  if (userStore.isLoggedIn) {
    await router.push({ name: 'ProfileEdit' })
  } else {
    await router.push({ name: 'auth-login' })
  }
}
</script>
