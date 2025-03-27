<template>
  <q-page class="q-pa-md">
    <q-card class="custom-card">
      <!-- 右上角操作按鈕：在非編輯狀態下顯示編輯 icon -->
      <div class="action-buttons">
        <!-- 新增寶寶 icon 依然存在 -->
        <q-btn flat round icon="person_add" color="primary" @click="addBaby" />
        <!-- 當非編輯狀態下才顯示編輯 icon -->
        <q-btn
          v-if="!editMode"
          flat
          round
          icon="edit"
          color="primary"
          @click="toggleEditMode"
        />
      </div>

      <!-- 使用者頭像與基本資訊 -->
      <q-card-section class="text-center">
        <q-avatar size="100px" class="q-mb-md">
          <!-- 請換成實際的頭像路徑 -->
          <img src="~assets/user-avatar.png" alt="User Avatar" />
        </q-avatar>
        <!-- 如果處於編輯狀態則變成 input，否則顯示靜態文字 -->
        <div v-if="editMode">
          <q-input
            filled
            v-model="editedUsername"
            label="姓名"
            class="q-mb-sm"
          />
          <q-input
            filled
            v-model="editedEmail"
            label="電子信箱"
            class="q-mb-sm"
          />
        </div>
        <div v-else>
          <div class="text-h5">{{ userData?.username || '未提供姓名' }}</div>
          <div class="text-subtitle2">
            {{ userData?.email || '未提供電子信箱' }}
          </div>
        </div>
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
            <q-item
              v-for="(baby, index) in userData?.babies || []"
              :key="index"
            >
              <q-item-section>
                <div class="text-h6">{{ baby.name }}</div>
                <div class="text-caption">出生日期：{{ baby.birthDate }}</div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <!-- 編輯模式下顯示儲存與取消按鈕 -->
      <q-card-actions align="center" v-if="editMode">
        <q-btn label="儲存" color="primary" @click="saveProfile" />
        <q-btn label="取消" color="secondary" @click="cancelEdit" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore } from 'src/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const userData = computed(() => userStore.userData)

// 編輯模式狀態
const editMode = ref(false)
// 編輯中的暫存欄位，初始化時取自 userData
const editedUsername = ref(userData.value?.username || '')
const editedEmail = ref(userData.value?.email || '')

// 當 userData 改變時，也更新暫存欄位 (例如登入後)
watch(
  userData,
  (newVal) => {
    editedUsername.value = newVal?.username || ''
    editedEmail.value = newVal?.email || ''
  },
  { immediate: true }
)

const toggleEditMode = () => {
  editMode.value = true
  // 初始化編輯欄位
  editedUsername.value = userData.value?.username || ''
  editedEmail.value = userData.value?.email || ''
}

const saveProfile = () => {
  // 這裡你可以呼叫 API 更新使用者資料
  // 範例直接更新 store 中的資料：
  if (userStore.userData) {
    userStore.userData.username = editedUsername.value
    userStore.userData.email = editedEmail.value
  }
  editMode.value = false
}

const cancelEdit = () => {
  // 放棄修改，直接退出編輯模式
  editMode.value = false
}

const addBaby = async () => {
  await router.push({ name: 'AddBaby' })
}
</script>

<style scoped>
.custom-card {
  max-width: 500px;
  margin: auto;
  position: relative;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.action-buttons {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  z-index: 10;
}
</style>
