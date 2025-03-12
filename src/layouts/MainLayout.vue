<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated>
      <q-toolbar>
        <!-- 左側選單按鈕 -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <!-- App 標題 -->
        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <!-- 顯示 Quasar 版本 -->
        <div class="q-mr-md">Quasar v{{ $q.version }}</div>

        <!-- 登入／登出按鈕 (範例用，請自行替換邏輯) -->
        <q-btn
          flat
          round
          dense
          icon="person"
          aria-label="Auth"
          @click="handleAuth"
          class="q-mr-md"
        />

        <!-- 主題切換開關 -->
        <q-toggle
          v-model="isDarkMode"
          color="yellow"
          label=""
          @update:model-value="toggleDarkMode"
        />
      </q-toolbar>
    </q-header>

    <!-- 側邊抽屜 -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <!-- 主要內容區 -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dark } from 'quasar'
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue'

// 側邊連結清單 (依需求調整)
const linksList: EssentialLinkProps[] = [
  { title: 'Docs', caption: 'quasar.dev', icon: 'school', link: 'https://quasar.dev' },
  { title: 'Github', caption: 'github.com/quasarframework', icon: 'code', link: 'https://github.com/quasarframework' },
  { title: 'Discord Chat Channel', caption: 'chat.quasar.dev', icon: 'chat', link: 'https://chat.quasar.dev' },
  { title: 'Forum', caption: 'forum.quasar.dev', icon: 'record_voice_over', link: 'https://forum.quasar.dev' },
  { title: 'Twitter', caption: '@quasarframework', icon: 'rss_feed', link: 'https://twitter.quasar.dev' },
  { title: 'Facebook', caption: '@QuasarFramework', icon: 'public', link: 'https://facebook.quasar.dev' },
  { title: 'Quasar Awesome', caption: 'Community Quasar projects', icon: 'favorite', link: 'https://awesome.quasar.dev' }
]

// 側邊抽屜控制
const leftDrawerOpen = ref(false)
function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// 主題切換控制，使用 Quasar Dark API
const isDarkMode = ref(Dark.isActive)
function toggleDarkMode (val: boolean) {
  isDarkMode.value = val
  Dark.set(val)
}

// 登入／登出處理 (範例用，請根據需求自行實作)
function handleAuth () {
  console.log('Handle authentication: Login/Logout clicked')
  // 在此實作登入／登出邏輯
}
</script>

<style scoped>
/* 根據需要自行添加自訂樣式 */
</style>
