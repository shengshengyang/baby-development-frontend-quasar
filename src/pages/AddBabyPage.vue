<template>
  <q-page class="q-pa-md">
    <q-card class="q-ma-auto" style="max-width: 500px">
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiPost } from 'src/api/apiHelper';
import { useUserStore } from 'src/stores/user';
import { apiConfig } from 'src/api/config';

// 使用者輸入的欄位
const babyName = ref('');
const birthDate = ref('');

// 路由與全域使用者資料 store
const router = useRouter();
const userStore = useUserStore();

// 定義後端 API 要求的 Request Body 型別
interface BabyCreateRequestVo {
  name: string;
  birthDate: string;
}

// 定義後端 API 回傳的 Response 型別
interface BabyCreateResponseVo {
  id: number;
  name: string;
  birthDate: string;
}

const saveBaby = async () => {
  // 基本輸入驗證
  if (!babyName.value || !birthDate.value) {
    alert('請輸入完整資訊');
    return;
  }

  try {
    const response = await apiPost<BabyCreateResponseVo, BabyCreateRequestVo>(
      apiConfig.endpoints.createBaby,
      {
        name: babyName.value,
        birthDate: birthDate.value,
      },
    );

    console.log('新增寶寶成功:', response);

    // 若後端有回傳新增的寶寶資料，可以直接更新使用者資料
    if (userStore.userData && response) {
      userStore.userData.babies = userStore.userData.babies || [];
      // 使用 API 回傳的資料，包含 id
      userStore.userData.babies.push({
        id: response.id,
        name: response.name || babyName.value,
        birthDate: response.birthDate || birthDate.value,
        progresses: [], // 初始進度為空
      });

      // 將新增的寶寶設為預設寶寶
      userStore.selectBaby(userStore.userData.babies.length - 1);
    }

    // 儲存完後導向個人資料頁面
    await router.push({ name: 'ProfileEdit' });
  } catch (error) {
    console.error('新增寶寶失敗:', error);
  }
};
</script>

<style scoped>
.q-card {
  max-width: 500px;
  margin: auto;
}
</style>
