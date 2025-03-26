<template>
  <q-page class="q-pa-md">
    <q-card class="q-ma-auto" style="max-width: 500px;">
      <!-- 使用者頭像與基本資訊 -->
      <q-card-section class="text-center">
        <q-avatar size="100px" class="q-mb-md">
          <!-- 可使用預設頭像或從 userData 取得 -->
          <img src="" alt="User Avatar" />
        </q-avatar>
        <div class="text-h5">{{ userData?.username || '未提供姓名' }}</div>
        <div class="text-subtitle2">{{ userData?.email || '未提供電子信箱' }}</div>
      </q-card-section>

      <q-separator />

      <!-- 詳細資料區：角色與寶寶資訊 -->
      <q-card-section>
        <div class="q-mb-md">
          <div class="text-subtitle1">角色</div>
          <div>{{ userData?.role ? userData.role.join(', ') : '無' }}</div>
        </div>

        <!-- 寶寶清單 -->
        <div>
          <div class="text-subtitle1 q-mb-sm">寶寶資訊</div>
          <q-list bordered>
            <q-item v-for="(baby, index) in userData?.babies || []" :key="index">
              <q-item-section>
                <div class="text-h6">{{ baby.name }}</div>
                <div class="text-caption">出生日期：{{ baby.birthDate }}</div>
              </q-item-section>
            </q-item>
          </q-list>
          <!-- 新增寶寶按鈕 -->
          <div class="q-mt-md text-center">
            <q-btn label="新增寶寶" color="primary" @click="addBaby" />
          </div>
        </div>
      </q-card-section>

      <!-- 編輯資料按鈕 -->
      <q-card-actions align="center">
        <q-btn label="編輯資料" color="primary" @click="editProfile" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from 'src/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const userData = computed(() => userStore.userData)

// 點擊編輯個人資料，導向編輯頁面（請確認路由設定）
const editProfile = async () => {
  await router.push({ name: 'ProfileEdit' })
}

// 點擊新增寶寶按鈕，導向新增寶寶頁面
const addBaby = async () => {
  await router.push({ name: 'AddBaby' })
}
</script>

<style scoped>
.q-card {
  max-width: 500px;
  margin: auto;
}
</style>
