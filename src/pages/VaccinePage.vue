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

        <q-card
          v-for="vaccineGroup in groupVaccinesByType(group.vaccines)"
          :key="vaccineGroup.id"
          class="q-mb-md"
        >
          <q-card-section>
            <div class="text-subtitle1 vaccine-name">{{ vaccineGroup.name }}</div>
            <div class="text-caption q-mt-xs">{{ vaccineGroup.description }}</div>

            <!-- 疫苗進度條 -->
            <div class="progress-container q-mt-md">
              <div class="text-caption q-mb-xs">
                接種進度 ({{ vaccineGroup.completedDoses }}/{{ vaccineGroup.totalDoses }})
              </div>
              <q-linear-progress
                :value="vaccineGroup.completedDoses / vaccineGroup.totalDoses"
                color="primary"
                class="q-mb-sm"
              />
              <div class="dose-progress">
                <div
                  v-for="dose in vaccineGroup.doses"
                  :key="dose.id"
                  class="dose-item text-caption q-mr-sm"
                >
                  <q-badge
                    :color="dose.status === 'COMPLETED' ? 'positive' : 'grey'"
                    class="q-mr-xs"
                    v-tooltip="getStatusText(dose)"
                  >
                    {{ dose.doseNumber }}
                  </q-badge>
                  <span>{{ getStatusTextShort(dose) }}</span>
                </div>
              </div>

              <!-- 新增「記錄接種」按鈕 -->
              <div class="text-right q-mt-sm">
                <q-btn
                  v-for="dose in vaccineGroup.doses.filter((d) => d.status === 'SCHEDULED')"
                  :key="dose.id"
                  color="primary"
                  flat
                  dense
                  :label="`記錄第${dose.doseNumber}劑`"
                  @click="findAndOpenVaccinationDialog(dose)"
                  class="q-ml-sm"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 列表模式 -->
    <div v-else class="list-view q-mt-md">
      <q-item-label header class="text-subtitle1">依疫苗類型分組</q-item-label>
      <q-list separator>
        <q-expansion-item
          v-for="group in groupedVaccinesList"
          :key="group.id"
          :label="group.name"
          :caption="`進度: ${group.completedDoses}/${group.totalDoses}`"
          header-class="text-primary"
          expand-separator
          class="q-mb-md vaccine-group"
        >
          <div class="q-pa-md">
            <div class="text-caption q-mb-md">{{ group.description }}</div>

            <!-- 進度條 -->
            <q-linear-progress
              :value="group.completedDoses / group.totalDoses"
              color="primary"
              class="q-mb-md"
            />

            <!-- 劑量詳情 -->
            <div class="doses-detail">
              <q-item v-for="dose in group.doses" :key="dose.id" class="q-mb-sm no-padding">
                <q-item-section avatar>
                  <q-badge :color="getStatusColor(dose)"> 第{{ dose.doseNumber }}劑 </q-badge>
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    <span class="status-text">{{ getGroupedVaccineStatusText(dose) }}</span>
                    <q-badge
                      :color="getScheduleStatusColor(findScheduleForGroupedVaccine(dose))"
                      class="q-ml-sm"
                    >
                      {{ getScheduleStatusText(findScheduleForGroupedVaccine(dose)) }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption>
                    預計: {{ formatDate(dose.scheduledDate) }}
                    <span v-if="dose.actualDate"> | 實際: {{ formatDate(dose.actualDate) }} </span>
                  </q-item-label>
                </q-item-section>

                <q-item-section side v-if="dose.status === 'SCHEDULED'">
                  <q-btn
                    flat
                    color="primary"
                    label="記錄"
                    @click="openVaccinationDialog(findScheduleForGroupedVaccine(dose))"
                  />
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-expansion-item>
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
import { getVaccineSchedules, completeVaccineSchedule } from 'src/api/apiHelper';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user'; // Import Baby interface
import type { VaccineSchedule, VaccineStatus } from 'src/types/vaccine';
import 'src/styles/vaccinePage.scss'; // 導入獨立的 SCSS 文件

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

// 新增疫苗組類型
interface VaccineGroup {
  id: number;
  name: string;
  description: string;
  totalDoses: number;
  completedDoses: number;
  doses: GroupedVaccine[];
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

// 將同一種疫苗分到一組
const groupVaccinesByType = (vaccines: GroupedVaccine[]): VaccineGroup[] => {
  const groups: Record<number, VaccineGroup> = {};

  vaccines.forEach((vaccine) => {
    if (!groups[vaccine.vaccineId]) {
      groups[vaccine.vaccineId] = {
        id: vaccine.vaccineId,
        name: vaccine.vaccineName,
        description: vaccine.description,
        totalDoses: 0,
        completedDoses: 0,
        doses: [],
      };
    }

    // Add non-null assertion operator to tell TypeScript this is definitely defined
    groups[vaccine.vaccineId]!.doses.push(vaccine);
  });

  // 計算每種疫苗的總劑數與已完成劑數
  Object.values(groups).forEach((group) => {
    group.doses.sort((a, b) => a.doseNumber - b.doseNumber);
    group.totalDoses = group.doses.length;
    group.completedDoses = group.doses.filter((dose) => dose.status === 'COMPLETED').length;
  });

  return Object.values(groups);
};

// 列表視圖用的分組疫苗
const groupedVaccinesList = computed(() => {
  const groups: Record<number, VaccineGroup> = {};

  vaccineSchedules.value.forEach((schedule) => {
    const vaccineId = schedule.vaccine.id;

    if (!groups[vaccineId]) {
      groups[vaccineId] = {
        id: vaccineId,
        name: schedule.vaccine.name,
        description: schedule.vaccine.description,
        totalDoses: 0,
        completedDoses: 0,
        doses: [],
      };
    }

    // 將 schedule 轉換為 GroupedVaccine 格式添加到列表
    groups[vaccineId].doses.push({
      id: schedule.id,
      vaccineId: schedule.vaccine.id,
      vaccineName: schedule.vaccine.name,
      description: schedule.vaccine.description,
      status: schedule.status as VaccineStatus,
      scheduledDate: schedule.scheduledDate,
      actualDate: schedule.actualDate,
      doseNumber: schedule.doseNumber,
    });
  });

  // 計算總劑數和完成劑數
  Object.values(groups).forEach((group) => {
    group.doses.sort((a, b) => a.doseNumber - b.doseNumber);
    group.totalDoses = group.doses.length;
    group.completedDoses = group.doses.filter((dose) => dose.status === 'COMPLETED').length;
  });

  return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));
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

// 簡短狀態文字
const getStatusTextShort = (vaccine: GroupedVaccine): string => {
  switch (vaccine.status) {
    case 'COMPLETED':
      return '已完成';
    case 'SCHEDULED':
      return formatDateShort(vaccine.scheduledDate);
    case 'MISSED':
      return '已錯過';
    default:
      return '';
  }
};

// 轉換 GroupedVaccine 到對應的 VaccineSchedule
const findScheduleForGroupedVaccine = (groupedVaccine: GroupedVaccine): VaccineSchedule => {
  const schedule = vaccineSchedules.value.find((s) => s.id === groupedVaccine.id);
  if (!schedule) {
    throw new Error(`找不到ID為 ${groupedVaccine.id} 的疫苗時程`);
  }
  return schedule;
};

// 列表視圖的分組疫苗狀態文字
const getGroupedVaccineStatusText = (vaccine: GroupedVaccine): string => {
  switch (vaccine.status) {
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

// 簡短日期格式
const formatDateShort = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
  });
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
const openVaccinationDialog = (vaccine: VaccineSchedule | null) => {
  if (!vaccine) {
    $q.notify({
      color: 'negative',
      message: '找不到對應的疫苗接種記錄',
      icon: 'error',
    });
    return;
  }

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
    // 使用新的 helper 函數
    await completeVaccineSchedule(
      selectedVaccine.value.id,
      vaccinationDate.value,
      vaccinationNote.value || undefined,
    );

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
