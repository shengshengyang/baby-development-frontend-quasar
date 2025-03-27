<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header 區塊 -->
    <q-header elevated class="app-header">
      <q-toolbar>
        <q-toolbar-title class="app-title">寶發高</q-toolbar-title>
        <q-space />
        <!-- 個人資料按鈕：根據登入狀態導向不同頁面 -->
        <q-btn flat round icon="person" @click="goToUserPage" />
        <!-- 若已登入，則顯示 Logout 按鈕 -->
        <q-btn v-if="userStore.isLoggedIn" flat round icon="exit_to_app" @click="logout" />
        <!-- 主題切換按鈕 -->
        <q-btn
          round
          flat
          :icon="isDarkMode ? 'dark_mode' : 'light_mode'"
          class="theme-toggle"
          @click="toggleDarkMode"
        >
          <q-tooltip>{{ isDarkMode ? '切換到日間模式' : '切換到夜間模式' }}</q-tooltip>
        </q-btn>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user';
import { Dark } from 'quasar';

const router = useRouter();
const userStore = useUserStore();

// 主題切換相關
const isDarkMode = ref(Dark.isActive);

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  Dark.set(isDarkMode.value);

  // 儲存用戶的主題偏好到本地存儲
  localStorage.setItem('darkMode', isDarkMode.value ? 'true' : 'false');
}

// 初始化主題
function initTheme() {
  // 從本地存儲中讀取用戶的主題偏好
  const savedDarkMode = localStorage.getItem('darkMode');

  if (savedDarkMode) {
    const prefersDark = savedDarkMode === 'true';
    isDarkMode.value = prefersDark;
    Dark.set(prefersDark);
  } else {
    // 如果沒有保存的偏好，則根據系統偏好設置
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode.value = prefersDark;
    Dark.set(prefersDark);
  }
}

// 頁面加載時初始化主題
initTheme();

async function goToUserPage() {
  // 如果已登入則導向編輯頁面，否則導向登入頁面
  if (userStore.isLoggedIn) {
    await router.push({ name: 'ProfileEdit' });
  } else {
    await router.push({ name: 'auth-login' });
  }
}

async function logout() {
  userStore.logout();
  await router.push({ name: 'auth-login' });
}
</script>

<style lang="scss">
.app-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, darken($primary, 15%) 100%);
}

.app-title {
  font-family: 'Bubblegum Sans', cursive;
  font-size: 1.5rem;
}

.theme-toggle {
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(30deg);
  }
}

.body--dark {
  .app-header {
    background: linear-gradient(135deg, darken($primary, 20%) 0%, darken($primary, 35%) 100%);
  }

  // 確保主內容區在夜間模式下有正確的背景色
  .q-page-container {
    background-color: $bg-dark;
  }

  // 確保頁面在夜間模式下有正確的背景色
  .q-page {
    background-color: $bg-dark;
  }

  // 確保頁腳在夜間模式下有正確的背景色
  .q-footer {
    background-color: darken($dark, 5%);
  }
}
</style>
