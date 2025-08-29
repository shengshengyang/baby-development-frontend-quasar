<template>
  <q-page class="q-pa-md milestone-page">
    <div class="page-header">
      <h2 class="text-h4 text-primary q-mb-md">寶寶發展里程碑</h2>
      <p class="text-subtitle1 q-mb-lg">追��您寶寶的成長與發展階段</p>
    </div>

    <!-- 頂部讀取條：切換年齡/分類重載資料時顯示 -->
    <q-linear-progress v-if="isFetching" indeterminate color="primary" class="q-mb-md" />

    <!-- 年齡分組選擇器 -->
    <div class="age-filter q-mb-lg">
      <div class="age-selector-container">
        <q-btn
          :disabled="!canGoToPreviousAge"
          icon="chevron_left"
          flat
          round
          color="primary"
          @click="goToPreviousAge"
          class="age-nav-btn"
        />
        <q-select
          v-model="selectedAgeId"
          :options="ageOptions"
          label="年齡篩選"
          outlined
          emit-value
          map-options
          class="age-selector"
        />
        <q-btn
          :disabled="!canGoToNextAge"
          icon="chevron_right"
          flat
          round
          color="primary"
          @click="goToNextAge"
          class="age-nav-btn"
        />
      </div>
    </div>

    <!-- 分類 Tabs：使用後端 options -->
    <q-tabs
      v-model="activeCategoryId"
      class="q-mb-md"
      dense
      align="justify"
      indicator-color="primary"
      @update:model-value="onCategoryTabChange"
    >
      <q-tab
        v-for="opt in categoryOptions"
        :key="opt.value ?? 'ALL'"
        :name="opt.value ?? 'ALL'"
        :label="opt.label"
      />
    </q-tabs>

    <!-- 里程碑卡片區域 -->
    <div v-if="filteredMilestonesByCategory.length > 0">
      <div class="milestone-cards-container">
        <q-card
          v-for="milestone in filteredMilestonesByCategory"
          :key="milestone.id"
          class="milestone-card q-ma-sm"
          :class="{ achieved: isAchieved(milestone.id) }"
          @click="flipCard(milestone.id)"
        >
          <q-card-section
            class="milestone-card-inner"
            :class="{ flipped: isCardFlipped(milestone.id) }"
          >
            <div class="milestone-front">
              <div class="milestone-image">
                <q-img :src="milestone.imageBase64 || ''" class="milestone-img" />
                <q-badge color="primary" class="age-badge"
                  >{{ milestone.age.displayName }}</q-badge
                >
              </div>
              <div class="milestone-content q-pa-md">
                <div class="text-h6">
                  {{ milestone.description }}
                </div>
                <!-- 已達成日期顯示 -->
                <div v-if="isAchieved(milestone.id)" class="achievement-date q-mt-sm">
                  達成於：{{ formatDate(getAchievementDate(milestone.id)) }}
                </div>
              </div>
              <!-- 只有登入用戶才顯示進度狀態按鈕組 -->
              <div v-if="userStore.isLoggedIn" class="milestone-status q-pa-sm" @click.stop>
                <div class="status-label q-mb-xs text-caption">進度狀態：</div>
                <q-btn-toggle
                  :model-value="getMilestoneStatus(milestone.id)"
                  @update:model-value="updateMilestoneStatus(milestone.id, $event)"
                  toggle-color="primary"
                  :options="[
                    { label: '未開始', value: 'NOT_STARTED', color: 'grey-6' },
                    { label: '已開始', value: 'IN_PROGRESS', color: 'orange' },
                    { label: '已完成', value: 'COMPLETED', color: 'positive' }
                  ]"
                  dense
                  no-caps
                  size="sm"
                  class="milestone-status-toggle"
                />
                <!-- 完成日期顯示 -->
                <div v-if="getMilestoneStatus(milestone.id) === 'COMPLETED'" class="achievement-date q-mt-sm">
                  達成於：{{ formatDate(getAchievementDate(milestone.id)) }}
                </div>
              </div>
            </div>

            <div class="milestone-back">
              <div class="milestone-back-content q-pa-md">
                <div class="text-h6 q-mb-md">詳細資訊</div>
                <p>{{ milestone.description }}</p>
                <div v-if="milestone.videoUrl" class="q-mt-md">
                  <a :href="milestone.videoUrl" target="_blank" class="text-primary">
                    觀看影片
                  </a>
                </div>
              </div>
              <q-btn
                flat
                color="primary"
                label="返回"
                @click.stop="flipCard(milestone.id)"
                class="q-ma-sm"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else class="no-milestones q-pa-xl text-center">
      <q-icon name="search_off" size="4rem" color="grey-6" />
      <p class="text-h6 q-mt-md">沒有找到符合此分類與年齡階段的里程碑</p>
      <q-btn color="primary" label="查看全部" @click="resetFilters" class="q-mt-md" />
    </div>

    <!-- 加入載入中遮罩 -->
    <q-dialog v-model="isLoading" persistent>
      <q-card class="bg-transparent shadow-0">
        <q-card-section class="row items-center justify-center">
          <q-spinner-dots color="primary" size="80px" />
          <div class="q-mt-md text-white text-center">更新進度中...</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from 'src/stores/user';
import { Notify } from 'quasar';
import { apiConfig } from 'src/api/config';
import apiClient from 'src/api/apiClient';
import {
  updateProgressStatus,
  ProgressStatus,
  getProgressStatusDisplayName,
  type UpdateProgressRequest
} from 'src/api/services/progressService';
import type { Progress } from 'src/components/models';

// 1. 定義介面
interface Milestone {
  id: string;
  age: {
    id: string;
    month: number;
    displayName: string;
    displayNameObject: {
      en: string;
      tw: string;
      ja: string;
      cn: string;
      vi: string;
      ko: string;
    };
  };
  category: {
    id: string;
    name: string;
    nameObject: {
      en: string;
      tw: string;
      ja: string;
      cn: string;
      vi: string;
      ko: string;
    };
  };
  description: string;
  descriptionObject: unknown;
  videoUrl: string | null;
  imageBase64: string | null;
}

interface AgeOption {
  label: string;
  value: string | null; // 從後端取得的 id；全部用 null
}

interface CategoryOption {
  label: string;
  value: string | null; // 從後端取得的分類 id；全部用 null
}

// 2. 響應式資料
const milestones = ref<Milestone[]>([]);
const userStore = useUserStore();
const flippedCards = ref<string[]>([]);
const achievedMilestones = ref<string[]>([]);

// 年齡相關
const selectedAgeId = ref<string | null>(null);
const ageOptions = ref<AgeOption[]>([{ label: '全部', value: null }]);

// 分類相關（以 id 為 v-model）
const categoryOptions = ref<CategoryOption[]>([]);
const activeCategoryId = ref<string | null>(null);

// 增加 loading 狀態
const isLoading = ref(false);

// 額外：列表資料讀取進度（切換年齡/分類時使用）
const isFetching = ref(false);

// 獲取里程碑的當前狀態
function getMilestoneStatus(flashcardId: string): ProgressStatus {
  if (!userStore.selectedBaby?.progresses) return ProgressStatus.NOT_STARTED;

  const progress = userStore.selectedBaby.progresses.find(
    (p) => String(p.flashcardId) === flashcardId
  );

  return progress?.status || ProgressStatus.NOT_STARTED;
}

// 更新里程碑狀態（使用新的三種狀態系統）
async function updateMilestoneStatus(flashcardId: string, newStatus: ProgressStatus): Promise<void> {
  if (!userStore.isLoggedIn || !userStore.selectedBaby) {
    Notify.create({ type: 'warning', message: '請先登入並選擇寶寶', position: 'top' });
    return;
  }

  try {
    isLoading.value = true;

    // 準備請求數據
    const requestData: UpdateProgressRequest = {
      babyId: userStore.selectedBaby.id,
      status: newStatus,
      flashcardId: flashcardId,
      date: new Date().toISOString()
    };

    // 調用新的 API
    await updateProgressStatus(requestData);

    // 重新獲取寶寶資料以更新進度
    // 這裡假設有一個 API 可以獲取更新後的寶寶資料
    // 如果沒有，可能需要手動更新本地狀態

    // 更新本地狀態
    updateLocalProgressStatus(flashcardId, newStatus);

    // 更新已達成的里程碑列表
    updateAchievedMilestonesFromProgress();

    // 顯示成功訊息
    const statusDisplayName = getProgressStatusDisplayName(newStatus);
    Notify.create({
      type: 'positive',
      message: `里程碑狀態已更新為：${statusDisplayName}`,
      position: 'top',
    });
  } catch (error) {
    console.error('Error updating milestone status:', error);
    Notify.create({ type: 'negative', message: '更新里程碑狀態時發生錯誤', position: 'top' });
  } finally {
    isLoading.value = false;
  }
}

// 更新本地進度狀態
function updateLocalProgressStatus(flashcardId: string, status: ProgressStatus): void {
  const selectedBaby = userStore.selectedBaby;
  if (!selectedBaby?.progresses) return;

  const existingProgressIndex = selectedBaby.progresses.findIndex(
    (p) => String(p.flashcardId) === flashcardId
  );

  if (existingProgressIndex >= 0) {
    // 更新現有進度記錄（加上安全檢查）
    const existing = selectedBaby.progresses[existingProgressIndex];
    if (existing) {
      existing.status = status;
      if (status === ProgressStatus.COMPLETED) {
        existing.date = new Date().toISOString();
      }
    }
  } else {
    // 創建新的進度記錄
    const newProgress: Progress = {
      id: `temp-${Date.now()}`, // 臨時 ID，應該從後端響應中獲取
      babyId: selectedBaby.id,
      status: status,
      flashcardId: flashcardId,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    selectedBaby.progresses.push(newProgress);
  }
}

// 從選定寶寶的進度中更新已達成的里程碑（更新為使用新狀態系統）
function updateAchievedMilestonesFromProgress() {
  if (userStore.isLoggedIn && userStore.selectedBaby?.progresses) {
    achievedMilestones.value = userStore.selectedBaby.progresses
      .filter((progress) => progress.status === ProgressStatus.COMPLETED)
      .map((progress) => String(progress.flashcardId));
  }
}

// 獲取達成日期（更新為使用新狀態系統）
function getAchievementDate(flashcardId: string): string | null {
  if (!userStore.selectedBaby?.progresses) return null;
  const progress = userStore.selectedBaby.progresses.find(
    (p) => String(p.flashcardId) === flashcardId && p.status === ProgressStatus.COMPLETED,
  );
  return progress ? progress.date : null;
}

// 檢查是否已達成（更新為使用新狀態系統）
function isAchieved(id: string): boolean {
  return getMilestoneStatus(id) === ProgressStatus.COMPLETED;
}

// 新增：根據選擇的篩選條件獲取里程碑數據
async function fetchMilestones() {
  try {
    isFetching.value = true;

    const params = new URLSearchParams();

    // 只有當選擇的不是「全部」(null/undefined) 且為合法字串時才添加參數
    if (isValidId(selectedAgeId.value)) {
      params.append('ageId', selectedAgeId.value);
    }

    if (isValidId(activeCategoryId.value)) {
      params.append('categoryId', activeCategoryId.value);
    }

    const url = `${apiConfig.baseUrl}${apiConfig.endpoints.milestones}${params.toString() ? '?' + params.toString() : ''}`;

    console.log('API 請求 URL:', url);
    console.log('發送的參數:', {
      ageId: selectedAgeId.value,
      categoryId: activeCategoryId.value,
      actualParams: params.toString(),
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'zh_TW',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    milestones.value = (await response.json()) as Milestone[];
    updateAchievedMilestonesFromProgress();
  } catch (error) {
    console.error('Error fetching milestone data:', error);
    console.error('請求的 URL:', `${apiConfig.baseUrl}${apiConfig.endpoints.milestones}`);
    console.error('選中的年齡 ID:', selectedAgeId.value);
    console.error('選中的分類 ID:', activeCategoryId.value);

    Notify.create({
      type: 'negative',
      message: '載入里程碑資料時發生錯誤',
      position: 'top',
    });
  } finally {
    isFetching.value = false;
  }
}

async function fetchAgeOptions() {
  try {
    const res = await apiClient.get(apiConfig.endpoints.ageOptions, {
      headers: { Accept: 'application/json', 'Accept-Language': 'zh_TW' },
    });
    const list = Array.isArray(res.data) ? res.data : [];
    const normalized: AgeOption[] = list
      .filter((o) => o && typeof o.label === 'string' && 'value' in o)
      .map((o) => ({ label: o.label, value: String(o.value) }));

    ageOptions.value = [{ label: '全部', value: null }, ...normalized];
  } catch (e) {
    console.error('取得年齡選項失敗，使用預設選項作為後備。', e);
    // 後備選項
    ageOptions.value = [{ label: '全部', value: null }];
  }
}

async function fetchCategoryOptions() {
  try {
    const res = await apiClient.get(apiConfig.endpoints.categoryOptions, {
      headers: { Accept: 'application/json', 'Accept-Language': 'zh_TW' },
    });
    const list = Array.isArray(res.data) ? res.data : [];
    const normalized: CategoryOption[] = list
      .filter((o) => o && typeof o.label === 'string' && typeof o.value === 'string')
      .map((o) => ({ label: o.label, value: o.value }));

    // 添加「全部」選項到最前面
    categoryOptions.value = [{ label: '全部', value: null }, ...normalized];

    // 若尚未選定分類，預設選第一個（全部）
    if (!activeCategoryId.value) {
      activeCategoryId.value = null; // 預設為「全部」
    }
  } catch (e) {
    console.error('取得分類選項失敗，使用預設分類文案。', e);
    // 後備：根據既有內部類別提供預設四大類
    categoryOptions.value = [
      { label: '全部', value: null },
      { label: '動作發展', value: 'fallback-motion' },
      { label: '認知發展', value: 'fallback-cognitive' },
      { label: '語言溝通', value: 'fallback-language' },
      { label: '社會與情感', value: 'fallback-social' },
    ];
    if (!activeCategoryId.value) {
      activeCategoryId.value = null; // 預設為「全部」
    }
  }
}

// 工具：檢查是否為有效的 ID（非空字串，且不為 'null' 或 'undefined'）
function isValidId(val: unknown): val is string {
  return typeof val === 'string' && val.trim() !== '' && val !== 'null' && val !== 'undefined';
}

// 分類 tab 切換時，將「全部」標準化為 null
function onCategoryTabChange(val: string | number | undefined) {
  if (val === 'ALL' || val === undefined || val === '') {
    activeCategoryId.value = null;
  } else {
    activeCategoryId.value = String(val);
  }
}

// 3. 生命週期
onMounted(async () => {
  // 載入 options（年齡、分類）
  await fetchAgeOptions();
  await fetchCategoryOptions();
  // 初始載入里程碑數據
  await fetchMilestones();
});

// 監聽選定寶寶的變化
watch(
  () => userStore.selectedBaby,
  () => {
    updateAchievedMilestonesFromProgress();
  },
  { deep: true },
);

// 監聽篩選條件變化，重新獲取數據
watch(
  [selectedAgeId, activeCategoryId],
  async () => {
    await fetchMilestones();
  }
);

// 由於 API 已經根據參數進行篩選，直接使用 milestones 數據並排序
const filteredMilestonesByCategory = computed((): Milestone[] => {
  return [...milestones.value].sort((a, b) => {
    const aAchieved = isAchieved(a.id);
    const bAchieved = isAchieved(b.id);
    if (aAchieved && !bAchieved) return 1;
    if (!aAchieved && bAchieved) return -1;
    return 0;
  });
});

function flipCard(id: string): void {
  if (isCardFlipped(id)) {
    flippedCards.value = flippedCards.value.filter((cardId) => cardId !== id);
  } else {
    flippedCards.value.push(id);
  }
}

function isCardFlipped(id: string): boolean {
  return flippedCards.value.includes(id);
}

// 年齡導航邏輯
const currentAgeIndex = ref<number | null>(null);

// 計算屬性：判斷是否可以導航到上一個或下一個年齡層
const canGoToPreviousAge = computed(() => {
  if (currentAgeIndex.value === null) return false;
  return currentAgeIndex.value > 0;
});

const canGoToNextAge = computed(() => {
  if (currentAgeIndex.value === null) return false;
  return currentAgeIndex.value < ageOptions.value.length - 1;
});

// 方法：導航到上一個年齡層
function goToPreviousAge() {
  if (canGoToPreviousAge.value) {
    currentAgeIndex.value!--;
    updateSelectedAge();
  }
}

// 方法：導航到下一個年齡層
function goToNextAge() {
  if (canGoToNextAge.value) {
    currentAgeIndex.value!++;
    updateSelectedAge();
  }
}

// 方法：根據當前索引更新選定的年齡
function updateSelectedAge() {
  const idx = currentAgeIndex.value;
  if (idx !== null && idx >= 0 && idx < ageOptions.value.length) {
    const ageOption = ageOptions.value[idx];
    if (ageOption) {
      selectedAgeId.value = ageOption.value;
    }
  }
}

// 監聽年齡選擇變化，更新當前年齡索引
watch(
  selectedAgeId,
  (newVal) => {
    const index = ageOptions.value.findIndex((option) => option.value === newVal);
    currentAgeIndex.value = index !== -1 ? index : 0; // 修正：如果找不到索引，設為 0（全部）
  },
);

// 修正：更安全的初始化邏輯
watch(
  ageOptions,
  () => {
    // 當年齡選項載入完成後，重新設置當前索引
    if (ageOptions.value.length > 0) {
      const index = ageOptions.value.findIndex((option) => option.value === selectedAgeId.value);
      currentAgeIndex.value = index !== -1 ? index : 0;
    }
  },
  { immediate: true }
);

// 方法：重設篩選條件
function resetFilters() {
  selectedAgeId.value = null;
  activeCategoryId.value = null; // 重設為「全部」
}

// 格式化日期字串
function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW');
}
</script>

<style lang="scss">
// 添加一些內聯樣式來確保夜間模式下的良好顯示
body.body--dark {
  .page-header {
    h2,
    p {
      color: var(--q-text-dark);
    }
  }

  .q-tabs {
    color: var(--q-text-dark);
  }

  .q-tab {
    color: rgba(240, 230, 213, 0.7);

    &--active {
      color: var(--q-text-dark);
    }
  }

  // 新增卡片正面文字暗黑模式樣式
  .milestone-front {
    background-color: var(--q-bg-dark);

    .milestone-content {
      .text-h6 {
        color: var(--q-text-dark);
      }
    }
  }

  // 新增卡片背面文字暗黑模式樣式
  .milestone-back {
    background-color: var(--q-bg-dark);

    .milestone-back-content {
      color: var(--q-text-dark);

      .text-h6 {
        color: var(--q-text-dark);
      }

      p {
        color: var(--q-text-dark);
      }
    }
  }

  // 進度狀態按鈕組樣式
  .milestone-status {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    background-color: rgba(255, 255, 255, 0.02);

    .status-label {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

// 加入載入遮罩樣式
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: white;
}

// 添加達成日期的樣式
.achievement-date {
  font-size: 0.9rem;
  color: #42b983;
  font-weight: 500;
}

// 為已達成的卡片添加特殊樣式
.milestone-card.achieved {
  border-left: 4px solid #42b983;
}

// 年齡選擇器容器樣式
.age-selector-container {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  margin: 0 auto;

  .age-selector {
    flex: 1;
    min-width: 200px;
  }

  .age-nav-btn {
    flex-shrink: 0;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background-color: rgba(var(--q-primary-rgb), 0.1);
      transform: scale(1.05);
    }

    &:disabled {
      opacity: 0.3;
    }
  }
}

// 響應式設計
@media (max-width: 600px) {
  .age-selector-container {
    max-width: 100%;
    gap: 8px;

    .age-selector {
      min-width: 150px;
    }

    .age-nav-btn {
      padding: 8px;
    }
  }
}
</style>

<style scoped lang="scss">
@import '../css/MilestonePage.scss';
</style>
