<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header 區塊 -->
    <q-header elevated class="app-header">
      <q-toolbar>
        <q-toolbar-title class="app-title">GOAT Baby</q-toolbar-title>

        <!-- 在工具欄中間顯示當前選擇的寶寶 -->
        <div v-if="selectedBaby" class="selected-baby">
          <q-btn flat no-caps class="baby-selector" @click="showBabySelector = true">
            <q-avatar size="24px" class="q-mr-sm">
              <img src="~assets/baby-icon.png" alt="Baby Avatar" />
            </q-avatar>
            {{ selectedBaby.name }} ({{ calculateAgeText(selectedBaby.birthDate) }})
            <q-icon name="arrow_drop_down" />
          </q-btn>
        </div>

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

    <!-- 寶寶選擇器對話框 -->
    <q-dialog v-model="showBabySelector">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">選擇寶寶</div>
        </q-card-section>

        <q-card-section>
          <q-list>
            <q-item
              v-for="(baby, index) in userStore.userData?.babies || []"
              :key="index"
              clickable
              v-close-popup
              @click="selectBaby(index)"
            >
              <q-item-section avatar>
                <q-avatar>
                  <img src="~assets/baby-icon.png" alt="Baby Avatar" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ baby.name }}</q-item-label>
                <q-item-label caption>{{ calculateAgeText(baby.birthDate) }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="index === userStore.selectedBabyIndex">
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="新增寶寶" color="primary" @click="addNewBaby" v-close-popup />
          <q-btn flat label="關閉" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 主內容區 -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer 區塊，只放首頁按鈕 -->
    <q-footer elevated :class="{ 'footer-hidden': !isFooterVisible }">
      <div class="row justify-center full-width q-pa-sm">
        <q-btn
          flat
          label="首頁"
          icon="home"
          @click="router.push({ name: 'Milestone' })"
          class="q-mx-sm"
        />
        <q-btn
          flat
          label="疫苗"
          icon="vaccines"
          @click="router.push({ name: 'Vaccine' })"
          class="q-mx-sm"
        />
      </div>
    </q-footer>

    <!-- 回到頂部按鈕 -->
    <q-page-sticky position="bottom-right" :offset="[16, 16]">
      <q-btn
        v-show="showBackToTop"
        fab
        icon="keyboard_arrow_up"
        color="primary"
        size="sm"
        class="back-to-top-btn"
        @click="scrollToTop"
      >
        <q-tooltip>top</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user';
import { Dark } from 'quasar';

const router = useRouter();
const userStore = useUserStore();
const showBabySelector = ref(false);

// 取得選定的寶寶
const selectedBaby = computed(() => userStore.selectedBaby);

// 主題切換相關
const isDarkMode = ref(Dark.isActive);

// 滾動控制相關
const lastScrollTop = ref(0);
const isFooterVisible = ref(true);
const scrollThreshold = 10; // 滾動閾值，用來防止輕微滾動觸發隱藏/顯示
const showBackToTop = ref(false); // 控制回到頂部按鈕的顯示

// 監聽滾動事件
function handleScroll() {
  const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

  // 顯示/隱藏回到頂部按鈕 (超過300px時顯示)
  showBackToTop.value = currentScrollTop > 300;

  // 檢查滾動方向並超過閾值
  if (Math.abs(currentScrollTop - lastScrollTop.value) > scrollThreshold) {
    // 下滑時隱藏，上滑時顯示
    if (currentScrollTop > lastScrollTop.value) {
      // 向下滾動
      isFooterVisible.value = false;
    } else {
      // 向上滾動
      isFooterVisible.value = true;
    }
    // 更新最後滾動位置
    lastScrollTop.value = currentScrollTop;
  }
}

// 滾動到頂部
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

// 頁面載入時設置滾動監聽
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

// 頁面卸載時移除滾動監聽，避免內存洩漏
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

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

// 計算寶寶年齡文字
function calculateAgeText(birthDateStr: string): string {
  if (!birthDateStr) return '';

  const birthDate = new Date(birthDateStr);
  const today = new Date();

  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();

  // 調整負數月份的情況
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  if (months < 0) months = 0;

  if (months < 1) {
    const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} 天`;
  } else if (months < 24) {
    return `${months} 個月`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years} 歲 ${remainingMonths} 個月` : `${years} 歲`;
  }
}

// 選擇寶寶
function selectBaby(index: number) {
  userStore.selectBaby(index);
  showBabySelector.value = false;
}

// 新增寶寶
async function addNewBaby() {
  showBabySelector.value = false;
  await router.push({ name: 'AddBaby' });
}

// 在元件掛載時初始化
onMounted(() => {
  // 確保載入已選擇的寶寶
  userStore.initSelectedBaby();

  // ... 現有的滾動監聽等初始化程式碼 ...
});
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

// Footer 滾動顯示/隱藏效果
.q-footer {
  transition: transform 0.3s ease;
  z-index: 1000;
}

.footer-hidden {
  transform: translateY(100%);
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

// 回到頂部按鈕樣式
.back-to-top-btn {
  opacity: 0.75;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
  padding: 7px;
  border-radius: 8px; // 改為圓角正方形
  height: 32px; // 縮小高度
  width: 32px; // 縮小寬度
  min-height: 0;

  .q-icon {
    font-size: 16px; // 縮小圖標
  }

  &:hover {
    opacity: 1;
    transform: translateY(-2px);
  }
}

// 暗黑模式下的回到頂部按鈕
.body--dark .back-to-top-btn {
  background: linear-gradient(135deg, var(--q-primary) 0%, darken($primary, 15%) 100%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
}

.selected-baby {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
  padding: 0 12px;

  .baby-selector {
    border-radius: 20px;
    padding: 2px 8px;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}
</style>
