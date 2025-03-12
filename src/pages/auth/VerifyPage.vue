<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 400px; margin: 0 auto;">
      <q-card>
        <q-card-section class="text-h6 text-center">
          驗證您的信箱
        </q-card-section>
        <q-card-section>
          <q-input v-model="verificationCode" label="驗證碼" outlined />
        </q-card-section>
        <q-card-actions class="q-mt-md">
          <q-btn label="確認驗證碼" color="primary" @click="verifyCode" style="width: 100%;" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const verificationCode = ref('')
const route = useRoute()
// 從 query 中取得 email（如果需要）
const email = route.query.email as string || ''

function verifyCode () {
  // 呼叫 API 驗證驗證碼
  console.log('驗證碼:', verificationCode.value, '針對 email:', email)
  // 如果驗證成功，可轉跳至登入頁面或自動登入
}
</script>
