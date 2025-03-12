<template>
  <q-page class="q-pa-md auth-page">
    <div class="login-container">
      <q-card class="login-card">
        <!-- 卡片上方 Logo 與標題 -->
        <q-card-section class="text-center card-header">
          <!-- 可自行更換路徑為寶寶相關圖片 -->
          <q-img src="~assets/baby-logo.png" class="logo" contain />
          <div class="card-title">寶寶發展檢測</div>
        </q-card-section>

        <!-- 輸入欄位 -->
        <q-card-section>
          <q-input
            filled
            v-model="email"
            label="電子信箱"
            type="email"
            class="q-mb-md"
          />
          <q-input
            filled
            v-model="password"
            label="密碼"
            type="password"
            class="q-mb-md"
          />
        </q-card-section>

        <!-- 登入按鈕 -->
        <q-card-actions align="center">
          <q-btn
            label="登入"
            color="primary"
            @click="onLogin"
            class="full-width"
          />
        </q-card-actions>

        <!-- 忘記密碼 / 註冊連結 -->
        <q-card-section class="text-center">
          <div class="auth-links">
            <q-btn flat label="忘記密碼" color="primary" @click="onForgotPassword" />
            <span class="separator">|</span>
            <q-btn flat label="註冊" color="primary" @click="onRegister" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiPost } from 'src/api/apiHelper'

// 使用 Vue Router 的 useRouter 組合式函數獲取路由實例
const router = useRouter()

const email = ref('')
const password = ref('')

interface LoginResponse {
  username: string;
  email: string;
  role: string[];
  token: string;
  babies: {
    name: string;
    birthDate: string;
    progresses: {
      babyId: number;
      flashcardId: number;
      ageInMonths: number;
      category: string;
      achieved: boolean;
      dateAchieved: string;
    }[];
  }[];
}

async function onLogin() {
  try {
    const result = await apiPost<LoginResponse>('/auth/login', { email: email.value, password: password.value });
    console.log('登入成功:', result);

    // 直接使用 router 進行導航
    router.push('/milestone').catch(err => {
      if (err.name !== 'NavigationDuplicated') {
        console.error('導航錯誤:', err);
      }
    });
  } catch (error) {
    console.error('登入失敗:', error);
  }
}

function onForgotPassword() {
  router.push('/auth/forgot-password').catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      console.error('導航錯誤:', err);
    }
  });
}

function onRegister() {
  router.push('/auth/register').catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      console.error('導航錯誤:', err);
    }
  });
}
</script>

<style scoped>
.auth-page {
  background-color: #FFF6F0; /* 溫馨的淡粉背景 */
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.login-container {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

.login-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #FFFFFF;
}

.card-header {
  padding-bottom: 0;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.card-title {
  font-family: 'Bubblegum Sans', cursive; /* 若有引入此字體 */
  font-size: 24px;
  color: #5E412F;
  margin-top: 8px;
}

.full-width {
  width: 100%;
}

.auth-links {
  display: flex;
  justify-content: center;
  align-items: center;
}

.separator {
  margin: 0 8px;
  color: #5E412F;
}
</style>
