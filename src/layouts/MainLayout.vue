<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="app-header">
      <q-toolbar>
        <!-- 左側選單按鈕 -->
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <!-- App 標題 -->
        <q-toolbar-title class="app-title"> 寶寶發展追蹤 </q-toolbar-title>

        <!-- 登入／登出按鈕 -->
        <q-btn
          flat
          round
          dense
          icon="person"
          aria-label="Auth"
          @click="handleAuth"
          class="q-mr-md"
        />

        <!-- 主題切換按鈕 - 改進版 -->
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

    <!-- 側邊抽屜 -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="app-drawer">
      <q-list>
        <q-item-label header class="drawer-header"> 功能選單 </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <!-- 主要內容區 -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Dark } from 'quasar';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

// 側邊連結清單 (依需求調整)
const linksList: EssentialLinkProps[] = [
  { title: 'Docs', caption: 'quasar.dev', icon: 'school', link: 'https://quasar.dev' },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework',
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev',
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev',
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev',
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev',
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
];

// 側邊抽屜控制
const leftDrawerOpen = ref(false);
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// 替換原來的暗黑模式切換
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

// 登入／登出處理 (範例用，請根據需求自行實作)
function handleAuth() {
  console.log('Handle authentication: Login/Logout clicked');
  // 在此實作登入／登出邏輯
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

  .app-drawer {
    background-color: darken($dark, 3%);
  }

  .drawer-header {
    color: lighten($text-dark, 5%);
  }

  // 確保主內容區在夜間模式下有正確的背景色
  .q-page-container {
    background-color: $bg-dark;
  }

  // 確保頁面在夜間模式下有正確的背景色
  .q-page {
    background-color: $bg-dark;
  }
}

.body--light {
  .app-drawer {
    background-color: $bg-light;
  }

  .drawer-header {
    color: $primary;
  }
}
</style>
