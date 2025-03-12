<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 400px; margin: 0 auto;">
      <q-card>
        <q-card-section class="text-h6 text-center">
          註冊
        </q-card-section>
        <q-card-section>
          <q-input v-model="email" label="Email" type="email" outlined />
          <q-input v-model="password" label="密碼" type="password" outlined class="q-mt-md" />
        </q-card-section>
        <q-card-actions class="q-mt-md">
          <q-btn label="發送驗證碼" color="primary" @click="sendVerificationCode" style="width: 100%;" />
        </q-card-actions>
        <q-card-section class="text-center">
          已有帳號？
          <q-btn flat label="登入" color="primary" @click="onLogin()" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

async function sendVerificationCode() {
  // 呼叫 API 發送驗證碼至信箱
  console.log('發送驗證碼至:', email.value)
  // 成功後轉跳至驗證頁面，並將 email 作為 query 參數傳遞
  await router.push({ name: 'auth-verify', query: { email: email.value } }).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      console.error('導航錯誤:', err);
    }
  });
}

async function onLogin() {
  try {
    // 這裡假設你可能需要一個登入 API 呼叫，如果不需要，可以直接導航
    // const result = await apiPost('/auth/login', { email: email.value, password: password.value });
    // console.log('登入成功:', result);

    // 直接使用 router 進行導航到登入頁面
    await router.push('/auth/login').catch(err => {
      if (err.name !== 'NavigationDuplicated') {
        console.error('導航錯誤:', err);
      }
    });
  } catch (error) {
    console.error('操作失敗:', error);
  }
}
</script>
