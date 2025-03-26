<template>
  <q-page class="q-pa-md">
    <q-card class="q-ma-auto" style="max-width: 500px;">
      <q-card-section>
        <div class="text-h5 text-center">新增寶寶</div>
      </q-card-section>

      <q-separator />

      <!-- 表單輸入區 -->
      <q-card-section>
        <q-input filled v-model="babyName" label="寶寶姓名" class="q-mb-md" />
        <q-input filled v-model="birthDate" label="出生日期" type="date" class="q-mb-md" />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn label="儲存" color="primary" @click="saveBaby" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'

const router = useRouter()
const userStore = useUserStore()

const babyName = ref('')
const birthDate = ref('')

// 儲存寶寶資料：這裡示範簡單新增至使用者資料的 babies 陣列，實際應依需求呼叫 API 儲存資料
const saveBaby = () => {
  if (!babyName.value || !birthDate.value) {
    // 簡單驗證
    alert('請輸入完整資訊')
    return
  }
  // 新增的寶寶資料
  const newBaby = {
    name: babyName.value,
    birthDate: birthDate.value,
    progresses: []  // 初始無進度
  }

  // 若 userData 已存在寶寶陣列則新增，否則建立新的陣列
  if (userStore.userData) {
    userStore.userData.babies = userStore.userData.babies || []
    userStore.userData.babies.push(newBaby)
  }

  // 儲存完後導向個人資料頁面
  router.push({ name: 'ProfileEdit' }).then(
    () => alert('新增成功'),
    () => alert('新增失敗')
  )
}
</script>

<style scoped>
.q-card {
  max-width: 500px;
  margin: auto;
}
</style>
