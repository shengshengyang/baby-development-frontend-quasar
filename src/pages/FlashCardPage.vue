<template>
  <q-page class="q-pa-md milestone-page">
    <div class="page-header">
      <h2 class="text-h4 text-primary q-mb-md">學習閃卡</h2>
      <p class="text-subtitle1 q-mb-lg">透過互動卡片學習寶寶發展知識</p>
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

    <!-- 分類 Tabs -->
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

    <!-- flashCard 卡片區域 -->
    <div v-if="filteredFlashCardsByCategory.length > 0">
      <div class="milestone-cards-container">
        <q-card
          v-for="flashcard in filteredFlashCardsByCategory"
          :key="flashcard.id"
          class="milestone-card q-ma-sm"
          :class="statusClass(flashcard.id)"
          @click="flipCard(flashcard.id)"
        >
          <q-card-section
            class="milestone-card-inner"
            :class="{ flipped: isCardFlipped(flashcard.id) }"
          >
            <div class="milestone-front">
              <div class="milestone-image">
                <q-img :src="flashcard.imageUrl || ''" class="milestone-img" />
                <q-badge color="primary" class="age-badge"
                  >{{ flashcard.ageInMonths }}個月</q-badge
                >
              </div>
              <div class="milestone-content q-pa-md">
                <div class="text-h6">
                  {{ flashcard.subjectString }}
                </div>
                <!-- 開始日期顯示 -->
                <div v-if="getStartDate(flashcard.id)" class="start-date q-mt-xs">
                  開始於：{{ formatDate(getStartDate(flashcard.id)) }}
                </div>
                <!-- 已達成日期顯示 -->
                <div v-if="isAchieved(flashcard.id)" class="achievement-date q-mt-sm">
                  達成於：{{ formatDate(getAchievementDate(flashcard.id)) }}
                </div>
              </div>
              <!-- 只有登入用戶才顯示進度狀態按鈕組 -->
              <div v-if="userStore.isLoggedIn" class="milestone-status q-pa-sm" @click.stop>
                <div class="row items-center clickable q-pa-xs rounded-borders status-pill" @click="openStatusDialog(flashcard.id)">
                  <StatusIcon :status="getFlashCardStatus(flashcard.id)" :size="14" />
                  <span class="q-ml-sm text-body2">{{ getProgressStatusDisplayName(getFlashCardStatus(flashcard.id)) }}</span>
                  <q-space />
                  <q-icon name="expand_more" size="16px" />
                </div>
              </div>
            </div>

            <div class="milestone-back">
              <div class="milestone-back-content q-pa-md">
                <div class="text-h6 q-mb-md">詳細資訊</div>
                <p>{{ flashcard.milestone.description }}</p>
                <div v-if="flashcard.translations.length > 0" class="q-mt-md">
                  <div class="text-subtitle2 q-mb-sm">多語言內容：</div>
                  <div v-for="translation in flashcard.translations" :key="translation.id" class="q-mb-xs">
                    <q-chip :label="`${translation.languageCode}: ${translation.description}`" />
                  </div>
                </div>
              </div>
              <q-btn
                flat
                color="primary"
                label="返回"
                @click.stop="flipCard(flashcard.id)"
                class="q-ma-sm"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else class="no-milestones q-pa-xl text-center">
      <q-icon name="search_off" size="4rem" color="grey-6" />
      <p class="text-h6 q-mt-md">沒有找到符合此分類與年齡階段的學習卡片</p>
      <q-btn color="primary" label="查看全部" @click="resetFilters" class="q-mt-md" />
    </div>

    <!-- 載入中遮罩 -->
    <q-dialog v-model="isLoading" persistent>
      <q-card class="bg-transparent shadow-0">
        <q-card-section class="row items-center justify-center">
          <q-spinner-dots color="primary" size="80px" />
          <div class="q-mt-md text-white text-center">更新進度中...</div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 狀態選擇彈窗 -->
    <q-dialog v-model="statusDialog.open">
      <q-card style="min-width: 280px">
        <q-card-section class="text-subtitle1">更新進度狀態</q-card-section>
        <q-separator />
        <q-list bordered padding>
          <q-item clickable v-ripple @click="selectStatus(ProgressStatus.NOT_STARTED)">
            <q-item-section avatar>
              <StatusIcon :status="ProgressStatus.NOT_STARTED" :size="16" />
            </q-item-section>
            <q-item-section>未開始</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="selectStatus(ProgressStatus.IN_PROGRESS)">
            <q-item-section avatar>
              <StatusIcon :status="ProgressStatus.IN_PROGRESS" :size="16" />
            </q-item-section>
            <q-item-section>已開始</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="selectStatus(ProgressStatus.COMPLETED)">
            <q-item-section avatar>
              <StatusIcon :status="ProgressStatus.COMPLETED" :size="16" />
            </q-item-section>
            <q-item-section>已完成</q-item-section>
          </q-item>
        </q-list>
        <q-card-actions align="right">
          <q-btn flat color="grey-7" label="取消" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from 'src/stores/user';
import { Notify } from 'quasar';
import {
  updateProgressStatus,
  ProgressStatus,
  getProgressStatusDisplayName,
  type UpdateProgressRequest,
  fetchBabyProgresses,
} from 'src/api/services/progressService';
import type { Progress } from 'src/components/models';
import StatusIcon from 'src/components/StatusIcon.vue';
import {
  flashcardService,
  type FlashCard,
  type AgeOption,
  type CategoryOption
} from 'src/api/services/flashcardService';

// 響應式資料
const flashcards = ref<FlashCard[]>([]);
const userStore = useUserStore();
const flippedCards = ref<string[]>([]);
const achievedFlashCards = ref<string[]>([]);

// 年齡相關
const selectedAgeId = ref<string | null>(null);
const ageOptions = ref<AgeOption[]>([{ label: '全部', value: null }]);

// 分類相關（以 id 為 v-model）
const categoryOptions = ref<CategoryOption[]>([]);
const activeCategoryId = ref<string | null>(null);

// 載入狀態
const isLoading = ref(false);
const isFetching = ref(false);

// 狀態彈窗狀態
const statusDialog = ref<{ open: boolean; flashcardId: string | null }>({ open: false, flashcardId: null });

// 後端進度 -> Store 進度映射
function mapProgressResponseToStoreProgress(resp: {
  id: string;
  babyId: string;
  flashcardId?: string | null;
  milestoneId?: string | null;
  progressStatus: string;
  dateAchieved?: string | null;
  dateStarted?: string | null;
}): Progress {
  const status = (resp.progressStatus as keyof typeof ProgressStatus) in ProgressStatus
    ? (ProgressStatus[resp.progressStatus as keyof typeof ProgressStatus])
    : ProgressStatus.NOT_STARTED;

  const base = {
    id: resp.id,
    babyId: String(resp.babyId),
    status,
    date: resp.dateAchieved ?? '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Progress;

  return {
    ...base,
    ...(resp.flashcardId ? { flashcardId: String(resp.flashcardId) } : {}),
    ...(resp.milestoneId ? { milestoneId: String(resp.milestoneId) } : {}),
    ...(resp.dateStarted ? { startedAt: resp.dateStarted } : {}),
  } as Progress;
}

// 取得並同步選定寶寶的進度
async function fetchAndSyncBabyProgresses() {
  const baby = userStore.selectedBaby;
  if (!userStore.isLoggedIn || !baby) return;
  try {
    const list = await fetchBabyProgresses(baby.id);
    const mapped: Progress[] = list.map(mapProgressResponseToStoreProgress);
    userStore.updateSelectedBaby({ ...baby, progresses: mapped });
    updateAchievedFlashCardsFromProgress();
  } catch (e) {
    console.error('同步寶寶進度失敗:', e);
  }
}

// 獲取 flashCard 的當前狀態
function getFlashCardStatus(flashcardId: string): ProgressStatus {
  const progresses = userStore.selectedBaby?.progresses;
  if (!progresses) return ProgressStatus.NOT_STARTED;

  const progress = progresses.find(
    (p) => String(p.flashcardId) === flashcardId || String(p.milestoneId) === flashcardId
  );
  return progress?.status ?? ProgressStatus.NOT_STARTED;
}

// 更新 flashCard 狀態
async function updateFlashCardStatus(flashcardId: string, newStatus: ProgressStatus): Promise<void> {
  if (!userStore.isLoggedIn || !userStore.selectedBaby) {
    Notify.create({ type: 'warning', message: '請先登入並選擇寶寶', position: 'top' });
    return;
  }

  try {
    isLoading.value = true;

    const requestData: UpdateProgressRequest = {
      babyId: userStore.selectedBaby.id,
      status: newStatus,
      flashcardId: flashcardId,
      date: new Date().toISOString()
    };

    await updateProgressStatus(requestData);

    // 先本地更新，增加即時回饋
    updateLocalProgressStatus(flashcardId, newStatus);
    updateAchievedFlashCardsFromProgress();

    // 再向後端同步一次，確保最終狀態一致
    await fetchAndSyncBabyProgresses();

    const statusDisplayName = getProgressStatusDisplayName(newStatus);
    Notify.create({
      type: 'positive',
      message: `學習卡片狀態已更新為：${statusDisplayName}`,
      position: 'top',
    });
  } catch (error) {
    console.error('Error updating flashcard status:', error);
    Notify.create({ type: 'negative', message: '更新學習卡片狀態時發生錯誤', position: 'top' });
  } finally {
    isLoading.value = false;
  }
}

// 獲取開始日期
function getStartDate(flashcardId: string): string | null {
  const progresses = userStore.selectedBaby?.progresses;
  if (!progresses) return null;
  const progress = progresses.find(
    (p) => String(p.flashcardId) === flashcardId || String(p.milestoneId) === flashcardId
  );
  return progress?.startedAt ?? null;
}

// 更新本地進度狀態
function updateLocalProgressStatus(flashcardId: string, status: ProgressStatus): void {
  const selectedBaby = userStore.selectedBaby;
  if (!selectedBaby?.progresses) return;

  const idx = selectedBaby.progresses.findIndex(
    (p) => String(p.flashcardId) === flashcardId || String(p.milestoneId) === flashcardId
  );

  if (idx >= 0) {
    const existing = selectedBaby.progresses[idx];
    if (existing) {
      existing.status = status;
      if (!existing.flashcardId) existing.flashcardId = flashcardId;
      if (status === ProgressStatus.IN_PROGRESS && !existing.startedAt) {
        existing.startedAt = new Date().toISOString();
      }
      if (status === ProgressStatus.COMPLETED) {
        existing.date = new Date().toISOString();
      }
    }
  } else {
    const base = {
      id: `temp-${Date.now()}`,
      babyId: selectedBaby.id,
      status,
      flashcardId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Progress;

    if (status === ProgressStatus.IN_PROGRESS) {
      selectedBaby.progresses.push({ ...base, startedAt: new Date().toISOString(), date: new Date().toISOString() });
    } else if (status === ProgressStatus.COMPLETED) {
      selectedBaby.progresses.push({ ...base, date: new Date().toISOString() });
    } else {
      selectedBaby.progresses.push({ ...base, date: new Date().toISOString() });
    }
  }
}

// 更新已達成的 flashCard 列表
function updateAchievedFlashCardsFromProgress() {
  const progresses = userStore.selectedBaby?.progresses;
  if (userStore.isLoggedIn && progresses) {
    achievedFlashCards.value = progresses
      .filter((p) => p.status === ProgressStatus.COMPLETED)
      .map((p) => String(p.flashcardId ?? p.milestoneId));
  }
}

// 獲取達成日期
function getAchievementDate(flashcardId: string): string | null {
  const progresses = userStore.selectedBaby?.progresses;
  if (!progresses) return null;
  const progress = progresses.find(
    (p) => (String(p.flashcardId) === flashcardId || String(p.milestoneId) === flashcardId) && p.status === ProgressStatus.COMPLETED,
  );
  return progress ? progress.date : null;
}

// 檢查是否已達成
function isAchieved(flashcardId: string): boolean {
  return achievedFlashCards.value.includes(flashcardId);
}

// 開啟狀態選擇彈窗
function openStatusDialog(flashcardId: string) {
  statusDialog.value = { open: true, flashcardId };
}

// 選擇狀態
async function selectStatus(status: ProgressStatus) {
  const id = statusDialog.value.flashcardId;
  if (!id) return;
  await updateFlashCardStatus(id, status);
  statusDialog.value.open = false;
}

// 卡片依狀態設置樣式 class
function statusClass(flashcardId: string) {
  const s = getFlashCardStatus(flashcardId);
  return {
    'status-not-started': s === ProgressStatus.NOT_STARTED,
    'status-in-progress': s === ProgressStatus.IN_PROGRESS,
    'status-completed': s === ProgressStatus.COMPLETED,
  };
}

// 獲取 flashCards 數據
async function fetchFlashCards() {
  try {
    isFetching.value = true;
    const params = {
      ageId: selectedAgeId.value || undefined,
      categoryId: activeCategoryId.value || undefined,
    };

    const data = await flashcardService.getFlashCards(params);
    flashcards.value = data;
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    Notify.create({ type: 'negative', message: '載入學習卡片失敗', position: 'top' });
  } finally {
    isFetching.value = false;
  }
}

// 獲取年齡選項
async function fetchAgeOptions() {
  try {
    const options = await flashcardService.getAgeOptions();
    ageOptions.value = options;
  } catch (error) {
    console.error('Error fetching age options:', error);
  }
}

// 獲取分類選項
async function fetchCategoryOptions() {
  try {
    const options = await flashcardService.getCategoryOptions();
    categoryOptions.value = options;
    // 設置默認值為第一個選項（全部）
    if (options.length > 0 && options[0]) {
      activeCategoryId.value = options[0].value;
    }
  } catch (error) {
    console.error('Error fetching category options:', error);
  }
}

// 監聽選定寶寶的變化
watch(
  () => userStore.selectedBaby,
  () => {
    updateAchievedFlashCardsFromProgress();
  },
  { deep: true },
);

// 監聽篩選條件變化，重新獲取數據
watch(
  [selectedAgeId, activeCategoryId],
  async () => {
    await fetchFlashCards();
  }
);

// 由於 API 已經根據參數進行篩選，直接使用 flashcards 數據並排序
const filteredFlashCardsByCategory = computed((): FlashCard[] => {
  return [...flashcards.value].sort((a, b) => {
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

const canGoToPreviousAge = computed(() => {
  if (currentAgeIndex.value === null) return false;
  return currentAgeIndex.value > 0;
});

const canGoToNextAge = computed(() => {
  if (currentAgeIndex.value === null) return false;
  return currentAgeIndex.value < ageOptions.value.length - 1;
});

function goToPreviousAge() {
  if (canGoToPreviousAge.value) {
    currentAgeIndex.value!--;
    updateSelectedAge();
  }
}

function goToNextAge() {
  if (canGoToNextAge.value) {
    currentAgeIndex.value!++;
    updateSelectedAge();
  }
}

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
    currentAgeIndex.value = index !== -1 ? index : 0;
  },
);

watch(
  ageOptions,
  () => {
    if (ageOptions.value.length > 0) {
      const index = ageOptions.value.findIndex((option) => option.value === selectedAgeId.value);
      currentAgeIndex.value = index !== -1 ? index : 0;
    }
  },
  { immediate: true }
);

// 重設篩選條件
function resetFilters() {
  selectedAgeId.value = null;
  activeCategoryId.value = null;
}

// 格式化日期字串
function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW');
}

// 分類 tab 切換時，將「全部」標準化為 null
function onCategoryTabChange(val: string | number | undefined) {
  if (val === 'ALL' || val === undefined || val === '') {
    activeCategoryId.value = null;
  } else {
    activeCategoryId.value = String(val);
  }
}

// 組件掛載時執行
onMounted(async () => {
  await Promise.all([
    fetchAgeOptions(),
    fetchCategoryOptions(),
  ]);

  await fetchFlashCards();

  if (userStore.isLoggedIn) {
    await fetchAndSyncBabyProgresses();
  }
});
</script>

<style scoped>
/* 重用 MilestonePage 的樣式 */
@import 'src/css/MilestonePage.scss';
</style>
