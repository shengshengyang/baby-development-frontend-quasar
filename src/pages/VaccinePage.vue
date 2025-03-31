<template>
  <q-page class="q-pa-md vaccine-page">
    <div class="page-header">
      <h2 class="text-h4 text-primary q-mb-md">寶寶預防接種</h2>
      <p class="text-subtitle1 q-mb-lg">追蹤您寶寶的疫苗接種時程</p>
    </div>

    <!-- 檢視模式切換 -->
    <div class="view-toggle q-mb-lg">
      <q-btn-toggle
        v-model="viewMode"
        toggle-color="primary"
        :options="[
          { label: '日程表', value: 'calendar' },
          { label: '列表', value: 'list' },
        ]"
        class="full-width"
      />
    </div>

    <!-- 載入中顯示 -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <span class="q-ml-sm text-subtitle1">載入疫苗資料中...</span>
    </div>

    <!-- 錯誤顯示 -->
    <div v-else-if="error" class="text-center text-negative q-pa-md">
      <q-icon name="error" size="2em" />
      <p>無法載入疫苗資料，請稍後再試</p>
      <q-btn color="primary" label="重新載入" @click="fetchVaccineSchedules" />
    </div>

    <!-- 日程表模式 -->
    <div v-else-if="viewMode === 'calendar'" class="calendar-view q-mt-md">
      <div v-for="(group, index) in vaccinesByAge" :key="index" class="calendar-group q-mb-lg">
        <div class="text-h6 age-title q-py-sm">{{ group.age }}</div>
        <q-card v-for="vaccine in group.vaccines" :key="vaccine.id" class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 vaccine-name">{{ vaccine.vaccineName }}</div>
            <div class="text-caption q-mt-xs">{{ vaccine.description }}</div>
            <div class="text-caption q-mt-sm">
              <q-badge :color="getStatusColor(vaccine)" class="q-pa-xs">
                {{ getStatusText(vaccine) }}
              </q-badge>
            </div>

            <!-- 新增「記錄接種」按鈕 -->
            <div class="text-right q-mt-sm" v-if="vaccine.status === 'SCHEDULED'">
              <q-btn
                color="primary"
                flat
                dense
                label="記錄接種"
                @click="findAndOpenVaccinationDialog(vaccine)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 列表模式 -->
    <div v-else class="list-view q-mt-md">
      <q-list separator>
        <q-item v-for="schedule in vaccineSchedules" :key="schedule.id" class="q-mb-md">
          <q-item-section>
            <q-item-label class="text-subtitle1 vaccine-name">
              {{ schedule.vaccine.name }} (第{{ schedule.doseNumber }}劑)
            </q-item-label>
            <q-item-label caption>{{ schedule.vaccine.description }}</q-item-label>
            <q-item-label caption
              >預計接種日期: {{ formatDate(schedule.scheduledDate) }}</q-item-label
            >

            <div class="q-mt-sm">
              <q-badge :color="getScheduleStatusColor(schedule)">
                {{ getScheduleStatusText(schedule) }}
              </q-badge>
            </div>

            <!-- 接種日期與按鈕 -->
            <div class="flex justify-between items-center q-mt-md">
              <div v-if="schedule.actualDate">
                <span class="text-subtitle2">接種日期: {{ formatDate(schedule.actualDate) }}</span>
              </div>

              <q-btn
                v-if="schedule.status === 'SCHEDULED'"
                color="primary"
                label="記錄接種"
                @click="openVaccinationDialog(schedule)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 接種記錄對話框 -->
    <q-dialog v-model="showVaccinationDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">記錄疫苗接種</div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            {{ selectedVaccine ? selectedVaccine.vaccine.name : '' }}
            (第{{ selectedVaccine ? selectedVaccine.doseNumber : '' }}劑)
          </div>

          <q-input v-model="vaccinationDate" label="接種日期" dense outlined>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="vaccinationDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input
            v-model="vaccinationNote"
            label="備註"
            dense
            outlined
            class="q-mt-md"
            type="textarea"
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="negative" v-close-popup />
          <q-btn
            flat
            label="記錄"
            color="primary"
            @click="recordVaccination"
            :loading="submitting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getVaccineSchedules, updateVaccineSchedule } from 'src/api/apiHelper';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user'; // Import Baby interface
import type { VaccineSchedule, VaccineStatus } from 'src/types/vaccine';

const $q = useQuasar();
const userStore = useUserStore();

// 定義分組後的疫苗類型
interface GroupedVaccine {
  id: number;
  vaccineId: number;
  vaccineName: string;
  description: string;
  status: VaccineStatus;
  scheduledDate: string;
  actualDate: string | null;
  doseNumber: number;
}

// 2. 視圖模式（日程表或列表）
const viewMode = ref('calendar');

// 3. 狀態變數
const vaccineSchedules = ref<VaccineSchedule[]>([]);
const loading = ref(false);
const error = ref(false);

// 疫苗接種對話框相關變數
const showVaccinationDialog = ref(false);
const selectedVaccine = ref<VaccineSchedule | null>(null);
const vaccinationDate = ref<string>('');
const vaccinationNote = ref('');
const submitting = ref(false);

// 4. 從API獲取疫苗時程表
const fetchVaccineSchedules = async () => {
  console.log('Fetching vaccine schedules...');
  if (!userStore.selectedBaby) {
    console.error('無法識別寶寶資訊，請選擇寶寶');
    error.value = true;
    return;
  }

  loading.value = true;
  error.value = false;

  try {
    vaccineSchedules.value = await getVaccineSchedules(userStore.selectedBaby.id);
  } catch (err) {
    console.error('無法獲取疫苗時程表:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 5. 按年齡分組的疫苗
const vaccinesByAge = computed(() => {
  const ageGroups: Record<string, GroupedVaccine[]> = {};

  // 將每個疫苗按照年齡分組
  vaccineSchedules.value.forEach((schedule) => {
    // 根據 recommendedAgeStart 轉換為適當的年齡組名稱
    const ageInMonths = schedule.vaccine.recommendedAgeStart;
    let ageGroup = '';

    if (ageInMonths === 0) {
      ageGroup = '出生';
    } else if (ageInMonths < 12) {
      ageGroup = `${ageInMonths}個月`;
    } else if (ageInMonths === 12) {
      ageGroup = '1歲';
    } else if (ageInMonths < 24) {
      ageGroup = `${ageInMonths}個月`;
    } else if (ageInMonths === 24) {
      ageGroup = '2歲';
    } else if (ageInMonths === 60) {
      ageGroup = '5歲';
    } else {
      ageGroup = `${Math.floor(ageInMonths / 12)}歲${ageInMonths % 12 ? ` ${ageInMonths % 12}個月` : ''}`;
    }

    if (!ageGroups[ageGroup]) {
      ageGroups[ageGroup] = [];
    }

    // 檢查是否已存在同疫苗，如果存在則不重複添加
    const existingVaccine = ageGroups[ageGroup]?.find((v) => v.vaccineId === schedule.vaccine.id);
    if (!existingVaccine && ageGroups[ageGroup]) {
      // 使用非空斷言運算符，因為我們已經檢查了 ageGroups[ageGroup] 不為空
      ageGroups[ageGroup]!.push({
        id: schedule.id,
        vaccineId: schedule.vaccine.id,
        vaccineName: schedule.vaccine.name,
        description: schedule.vaccine.description,
        status: schedule.status as VaccineStatus, // Add type assertion to ensure TypeScript recognizes this as VaccineStatus
        scheduledDate: schedule.scheduledDate,
        actualDate: schedule.actualDate,
        doseNumber: schedule.doseNumber,
      });
    }
  });

  // 自訂排序：出生 -> 1個月 -> 2個月 等等
  const ageOrder: Record<string, number> = {
    出生: 0,
    '1個月': 1,
    '2個月': 2,
    '4個月': 3,
    '6個月': 4,
    '12個月': 5,
    '1歲': 5,
    '15個月': 6,
    '18個月': 7,
    '24個月': 8,
    '2歲': 8,
    '5歲': 9,
    國小入學: 10,
  };

  return Object.entries(ageGroups)
    .map(([age, vaccines]) => ({
      age,
      vaccines,
    }))
    .sort((a, b) => (ageOrder[a.age] || 999) - (ageOrder[b.age] || 999));
});

// 6. 根據狀態獲取顏色
const getStatusColor = (vaccine: GroupedVaccine): string => {
  switch (vaccine.status) {
    case 'COMPLETED':
      return 'positive';
    case 'SCHEDULED':
      return 'primary';
    case 'MISSED':
      return 'negative';
    default:
      return 'grey';
  }
};

// 7. 根據狀態獲取文字說明
const getStatusText = (vaccine: GroupedVaccine): string => {
  switch (vaccine.status) {
    case 'COMPLETED':
      return `已完成第${vaccine.doseNumber}劑`;
    case 'SCHEDULED':
      return `待接種第${vaccine.doseNumber}劑 (${formatDate(vaccine.scheduledDate)})`;
    case 'MISSED':
      return `已錯過第${vaccine.doseNumber}劑`;
    default:
      return '未知狀態';
  }
};

// 8. 列表視圖的狀態顏色
const getScheduleStatusColor = (schedule: VaccineSchedule): string => {
  switch (schedule.status) {
    case 'COMPLETED':
      return 'positive';
    case 'SCHEDULED':
      return 'primary';
    case 'MISSED':
      return 'negative';
    default:
      return 'grey';
  }
};

// 9. 列表視圖的狀態文字
const getScheduleStatusText = (schedule: VaccineSchedule): string => {
  switch (schedule.status) {
    case 'COMPLETED':
      return '已完成';
    case 'SCHEDULED':
      return '待接種';
    case 'MISSED':
      return '已錯過';
    default:
      return '未知狀態';
  }
};

// 10. 格式化日期
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 11. 開啟接種對話框
const openVaccinationDialog = (vaccine: VaccineSchedule) => {
  selectedVaccine.value = vaccine;
  const today = new Date().toISOString().split('T')[0];
  vaccinationDate.value = today ? today : ''; // 確保不會是 undefined
  vaccinationNote.value = '';
  showVaccinationDialog.value = true;
};

// 從 GroupedVaccine 找到對應的 VaccineSchedule 並開啟對話框
const findAndOpenVaccinationDialog = (groupedVaccine: GroupedVaccine) => {
  const matchingSchedule = vaccineSchedules.value.find(
    (schedule) => schedule.id === groupedVaccine.id,
  );

  if (matchingSchedule) {
    openVaccinationDialog(matchingSchedule);
  } else {
    $q.notify({
      color: 'negative',
      message: '找不到對應的疫苗接種記錄',
      icon: 'error',
    });
  }
};

// 12. 記錄疫苗接種
const recordVaccination = async () => {
  if (!selectedVaccine.value || !vaccinationDate.value) {
    $q.notify({
      color: 'negative',
      message: '請選擇接種日期',
      icon: 'warning',
    });
    return;
  }

  if (!userStore.selectedBaby) {
    $q.notify({
      color: 'negative',
      message: '無法識別寶寶資訊',
      icon: 'error',
    });
    return;
  }

  submitting.value = true;

  try {
    await updateVaccineSchedule(userStore.selectedBaby.id, selectedVaccine.value.id, {
      actualDate: vaccinationDate.value,
      status: 'COMPLETED' as const,
      ...(vaccinationNote.value ? { note: vaccinationNote.value } : {}),
    });

    // 更新本地數據
    await fetchVaccineSchedules();

    $q.notify({
      color: 'positive',
      message: '疫苗接種記錄已更新',
      icon: 'check_circle',
    });

    // 關閉對話框
    showVaccinationDialog.value = false;
  } catch (error) {
    console.error('更新疫苗接種記錄失敗:', error);
    $q.notify({
      color: 'negative',
      message: '更新接種記錄失敗，請稍後再試',
      icon: 'error',
    });
  } finally {
    submitting.value = false;
  }
};

// 13. 組件載入時獲取疫苗時程表
onMounted(fetchVaccineSchedules);
</script>

<style lang="scss" scoped>
.vaccine-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  h2 {
    font-family: 'Bubblegum Sans', 'Baloo 2', 'Noto Sans TC', cursive;
    letter-spacing: 0.08em;
    font-weight: 600;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  }

  p {
    font-family: 'Nunito', 'Noto Sans TC', sans-serif;
    letter-spacing: 0.03em;
    font-weight: 500;
  }
}

.view-toggle {
  max-width: 400px;
  margin: 0 auto;
}

.calendar-group {
  .age-title {
    background-color: var(--q-primary);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-family: 'Baloo 2', 'Noto Sans TC', sans-serif;
    letter-spacing: 0.05em;
  }
}

.vaccine-name {
  font-weight: 600;
  color: var(--q-primary);
}

.list-view {
  .q-item {
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    background-color: white;
  }

  .progress-container {
    width: 100%;
  }

  .dose-progress {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .doses-detail {
    margin-top: 12px;
  }

  .dose-item {
    display: flex;
    align-items: center;
  }
}

// 暗黑模式樣式
.body--dark {
  .calendar-group .age-title {
    background-color: darken($primary, 10%);
  }

  .list-view .q-item {
    background-color: var(--q-bg-dark);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .vaccine-name {
    color: lighten($primary, 10%);
  }
}
</style>
