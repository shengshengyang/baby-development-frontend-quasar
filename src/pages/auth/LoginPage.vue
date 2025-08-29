<template>
  <q-page class="q-pa-md auth-page">
    <div class="login-container">
      <q-card class="login-card">
        <!-- 卡片上方 Logo 與標題 -->
        <q-card-section class="text-center card-header">
          <q-img src="~assets/baby-logo.png" class="logo" contain />
          <div class="card-title">會員登入</div>
        </q-card-section>

        <!-- 輸入欄位 -->
        <q-card-section>
          <q-input v-model="email" label="電子信箱" type="email" class="q-mb-md" />
          <q-input v-model="password" label="密碼" type="password" class="q-mb-md" />
        </q-card-section>

        <!-- 登入按鈕 -->
        <q-card-actions align="center">
          <q-btn label="登入" color="primary" @click="onLogin" class="full-width" />
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiPost } from 'src/api/apiHelper';
import { useUserStore } from 'src/stores/user';
import type { UserData, Progress as StoreProgress } from 'src/stores/user';
import { ProgressStatus } from 'src/api/services/progressService';

const router = useRouter();
const userStore = useUserStore();

const email = ref('');
const password = ref('');

interface LoginResponse {
  username: string;
  email: string;
  role: string[];
  token: string;
  babies: {
    id: number;
    name: string;
    birthDate: string;
    gender?: 'MALE' | 'FEMALE';
    createdAt?: string;
    updatedAt?: string;
    progresses: {
      id?: string;
      babyId: number;
      flashcardId?: number;
      milestoneId?: string;
      videoId?: string;
      ageInMonths?: number;
      category?: string;
      achieved?: boolean;
      dateAchieved?: string;
      status?: string;
      date?: string;
      createdAt?: string;
      updatedAt?: string;
    }[];
  }[];
}

// 類型轉換函數：將 LoginResponse 轉換為 UserData
function convertLoginResponseToUserData(loginResponse: LoginResponse): UserData {
  return {
    username: loginResponse.username,
    email: loginResponse.email,
    role: loginResponse.role,
    token: loginResponse.token,
    babies: loginResponse.babies.map(baby => ({
      id: String(baby.id), // 轉換 number 為 string
      name: baby.name,
      birthDate: baby.birthDate,
      gender: baby.gender || 'MALE', // 設定預設值
      createdAt: baby.createdAt || new Date().toISOString(),
      updatedAt: baby.updatedAt || new Date().toISOString(),
      progresses: baby.progresses.map(progress => {
        let status: ProgressStatus;
        if (progress.status === 'COMPLETED') {
          status = ProgressStatus.COMPLETED;
        } else if (progress.status === 'IN_PROGRESS') {
          status = ProgressStatus.IN_PROGRESS;
        } else if (progress.achieved) {
          status = ProgressStatus.COMPLETED;
        } else {
          status = ProgressStatus.NOT_STARTED;
        }

        return {
          id: progress.id || `temp-${Date.now()}-${Math.random()}`, // 生成臨時 ID
          babyId: String(progress.babyId), // 轉換為 string
          status,
          flashcardId: progress.flashcardId ? String(progress.flashcardId) : undefined,
          milestoneId: progress.milestoneId || undefined,
          videoId: progress.videoId || undefined,
          date: progress.date || progress.dateAchieved || new Date().toISOString(),
          createdAt: progress.createdAt || new Date().toISOString(),
          updatedAt: progress.updatedAt || new Date().toISOString(),
        };
      }).filter(progress => {
        // 過濾掉無效的進度記錄，確保必要欄位都存在
        return progress.id && progress.babyId && progress.status && progress.date;
      }) as StoreProgress[]
    }))
  };
}

async function onLogin() {
  try {
    const result = await apiPost<LoginResponse>('/auth/login', {
      email: email.value,
      password: password.value,
    });
    console.log('登入成功:', result);

    // 轉換類型並儲存到 Pinia 全域 store 中
    const userData = convertLoginResponseToUserData(result);
    userStore.setUser(userData);

    // 導航至 milestone 頁面
    router.push('/milestone').catch((err) => {
      if (err.name !== 'NavigationDuplicated') {
        console.error('導航錯誤:', err);
      }
    });
  } catch (error) {
    console.error('登入失敗:', error);
  }
}

function onForgotPassword() {
  router.push('/auth/forgot-password').catch((err) => {
    if (err.name !== 'NavigationDuplicated') {
      console.error('導航錯誤:', err);
    }
  });
}

function onRegister() {
  router.push('/auth/register').catch((err) => {
    if (err.name !== 'NavigationDuplicated') {
      console.error('導航錯誤:', err);
    }
  });
}
</script>

<style scoped>
.auth-page {
  background-color: #fff6f0;
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
  background-color: #ffffff;
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
  font-size: 24px;
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
  color: #5e412f;
}
</style>
