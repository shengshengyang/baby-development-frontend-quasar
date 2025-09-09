<template>
  <q-page class="q-pa-md milestone-page">
    <div class="page-header">
      <h2 class="text-h4 text-primary q-mb-md">寶寶發展里程碑</h2>
      <p class="text-subtitle1 q-mb-lg">追蹤您寶寶的成長與發展階段</p>
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
          name="ageFilter"
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

    <!-- 里程碑列表：簡化為 subject -->
    <div v-if="filteredMilestonesByCategory.length > 0">
      <div class="milestone-simple-list">
        <q-card
          v-for="milestone in filteredMilestonesByCategory"
          :key="milestone.id"
          class="milestone-simple-item q-mb-sm"
          :class="statusClass(milestone.id)"
          clickable
          flat
          bordered
          @click="openMilestoneDetail(milestone)"
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar square size="56px" class="bg-grey-2">
                <q-img :src="milestone.imageBase64 || ''" ratio="1" fit="cover" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-subtitle1">{{ milestone.subject || milestone.description }}</q-item-label>
              <q-item-label caption class="row items-center q-gutter-x-sm">
                <q-badge color="primary" outline>{{ milestone.age.displayName }}</q-badge>
                <q-badge color="secondary" outline>{{ milestone.category.name }}</q-badge>
                <q-badge v-if="isAchieved(milestone.id)" color="positive" outline>已完成</q-badge>
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <StatusIcon :status="getMilestoneStatus(milestone.id)" :size="20" />
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </div>

    <div v-else class="no-milestones q-pa-xl text-center">
      <q-icon name="search_off" size="4rem" color="grey-6" />
      <p class="text-h6 q-mt-md">沒有找到符合此分類與年齡階段的里程碑</p>
      <q-btn color="primary" label="查看全部" @click="resetFilters" class="q-mt-md" />
    </div>

    <!-- 更新進度 loading 遮罩 -->
    <q-dialog v-model="isLoading" persistent>
      <q-card class="bg-transparent shadow-0">
        <q-card-section class="row items-center justify-center">
          <q-spinner-dots color="primary" size="80px" />
          <div class="q-mt-md text-white text-center">更新進度中...</div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 狀態選擇彈窗（里程碑進度） -->
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

    <!-- 里程碑詳細全螢幕彈窗 -->
    <q-dialog v-model="milestoneDetailDialog.open" maximized persistent transition-show="slide-up" transition-hide="slide-down">
      <q-card class="q-pa-none column fit">
        <q-bar class="bg-primary text-white">
          <div class="text-subtitle2">{{ milestoneDetailDialog.milestone?.subject || milestoneDetailDialog.milestone?.description }}</div>
          <q-space />
          <q-btn dense flat icon="close" @click="closeMilestoneDetail" />
        </q-bar>
        <q-scroll-area class="col">
          <div class="q-pa-md">
            <div class="row q-col-gutter-md items-start">
              <div class="col-12 col-md-7">
                <div v-if="milestoneDetailDialog.milestone?.videoUrl" class="video-wrapper q-mb-md">
                  <video :src="milestoneDetailDialog.milestone?.videoUrl" controls style="width:100%;border-radius:8px;" />
                </div>
                <q-img v-else :src="milestoneDetailDialog.milestone?.imageBase64 || ''" ratio="16/9" class="q-mb-md rounded-borders" />
                <div class="text-h6 q-mb-sm">描述</div>
                <div class="text-body1 q-mb-md">{{ milestoneDetailDialog.milestone?.description }}</div>
                <div class="row items-center q-gutter-sm q-mb-md">
                  <q-badge color="primary" outline>{{ milestoneDetailDialog.milestone?.age.displayName }}</q-badge>
                  <q-badge color="secondary" outline>{{ milestoneDetailDialog.milestone?.category.name }}</q-badge>
                  <q-badge v-if="isAchieved(milestoneDetailDialog.milestone?.id || '')" color="positive" outline>已完成</q-badge>
                </div>
                <div class="q-mb-md">
                  <q-btn dense outline color="primary" @click="openStatusDialog(milestoneDetailDialog.milestone!.id)">
                    <StatusIcon :status="getMilestoneStatus(milestoneDetailDialog.milestone!.id)" :size="14" class="q-mr-sm" />
                    更新里程碑狀態 ({{ getProgressStatusDisplayName(getMilestoneStatus(milestoneDetailDialog.milestone!.id)) }})
                  </q-btn>
                </div>
              </div>
              <div class="col-12 col-md-5">
                <div class="text-h6 q-mb-sm">支援達成的 FlashCards</div>
                <div v-if="flashcardsOfCurrentMilestone.length === 0" class="text-grey">無相關 FlashCards</div>
                <div v-else>
                  <div class="row items-center q-mb-sm">
                    <q-linear-progress :value="flashcardCompletionRatio" color="positive" track-color="grey-3" style="width:180px" />
                    <span class="text-caption q-ml-sm">{{ flashcardsCompleted }}/{{ flashcardsOfCurrentMilestone.length }} 已完成</span>
                  </div>
                  <q-list separator bordered class="rounded-borders">
                    <q-item v-for="fc in flashcardsOfCurrentMilestone" :key="fc.id" class="flashcard-item">
                      <q-item-section avatar>
                        <q-avatar size="42px" square>
                          <q-img :src="fc.imageUrl" ratio="1" fit="cover" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ fc.subject }}</q-item-label>
                        <q-item-label caption>{{ fc.description }}</q-item-label>
                      </q-item-section>
                      <q-item-section side top>
                        <q-btn size="sm" flat round :icon="flashcardStatusIcon(getFlashcardStatus(fc.id))" :color="flashcardStatusColor(getFlashcardStatus(fc.id))" @click.stop="cycleFlashcardStatus(fc.id)" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </div>
          </div>
        </q-scroll-area>
        <q-separator />
        <q-card-actions align="right" class="bg-grey-2">
          <q-btn flat color="primary" label="關閉" @click="closeMilestoneDetail" />
        </q-card-actions>
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
  type UpdateProgressRequest,
  fetchBabyProgresses,
} from 'src/api/services/progressService';
import type { Progress } from 'src/components/models';
import StatusIcon from 'src/components/StatusIcon.vue';
import type {
  Milestone,
  AgeOption,
  CategoryOption,
  MilestoneFlashcard
} from 'src/types/milestone';
import { isApiAgeOption } from 'src/types/milestone';

// ============ 響應式狀態 ============
const milestones = ref<Milestone[]>([]);
const userStore = useUserStore();
const achievedMilestones = ref<string[]>([]);
const selectedAgeId = ref<string | null>(null);
const ageOptions = ref<AgeOption[]>([{ label: '全部', value: null }]);
const hasAutoSelectedAge = ref(false);
const categoryOptions = ref<CategoryOption[]>([]);
const activeCategoryId = ref<string | null>(null);
const isLoading = ref(false);
const isFetching = ref(false);
const statusDialog = ref<{ open: boolean; milestoneId: string | null }>({ open: false, milestoneId: null });

// 新增：里程碑詳細彈窗狀態
const milestoneDetailDialog = ref<{ open: boolean; milestone: Milestone | null }>({ open: false, milestone: null });

// ============ Progress 映射與工具 ============
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

async function fetchAndSyncBabyProgresses() {
  const baby = userStore.selectedBaby;
  if (!userStore.isLoggedIn || !baby) return;
  try {
    const list = await fetchBabyProgresses(baby.id);
    const mapped: Progress[] = list.map(mapProgressResponseToStoreProgress);
    userStore.updateSelectedBaby({ ...baby, progresses: mapped });
    updateAchievedMilestonesFromProgress();
  } catch (e) {
    console.error('同步寶寶進度失敗:', e);
  }
}

function getMilestoneStatus(milestoneId: string): ProgressStatus {
  const progresses = userStore.selectedBaby?.progresses;
  if (!progresses) return ProgressStatus.NOT_STARTED;
  const progress = progresses.find(
    (p) => String(p.milestoneId) === milestoneId
  );
  return progress?.status ?? ProgressStatus.NOT_STARTED;
}

function getFlashcardStatus(flashcardId: string): ProgressStatus {
  const progresses = userStore.selectedBaby?.progresses;
  if (!progresses) return ProgressStatus.NOT_STARTED;
  const progress = progresses.find(
    (p) => String(p.flashcardId) === flashcardId
  );
  return progress?.status ?? ProgressStatus.NOT_STARTED;
}

async function updateMilestoneStatus(milestoneId: string, newStatus: ProgressStatus): Promise<void> {
  if (!userStore.isLoggedIn || !userStore.selectedBaby) {
    Notify.create({ type: 'warning', message: '請先登入並選擇寶寶', position: 'top' });
    return;
  }
  try {
    isLoading.value = true;
    const requestData: UpdateProgressRequest = {
      babyId: userStore.selectedBaby.id,
      status: newStatus,
      milestoneId: milestoneId,
      date: new Date().toISOString()
    };
    await updateProgressStatus(requestData);
    updateLocalProgressStatusByKey({ milestoneId }, newStatus);
    updateAchievedMilestonesFromProgress();
    await fetchAndSyncBabyProgresses();
    Notify.create({ type: 'positive', message: `里程碑狀態已更新為：${getProgressStatusDisplayName(newStatus)}`, position: 'top' });
  } catch (error) {
    console.error('Error updating milestone status:', error);
    Notify.create({ type: 'negative', message: '更新里程碑狀態時發生錯誤', position: 'top' });
  } finally {
    isLoading.value = false;
  }
}

async function updateFlashcardStatus(flashcardId: string, newStatus: ProgressStatus): Promise<void> {
  if (!userStore.isLoggedIn || !userStore.selectedBaby) {
    Notify.create({ type: 'warning', message: '請先登入並選擇寶寶', position: 'top' });
    return;
  }
  try {
    const requestData: UpdateProgressRequest = {
      babyId: userStore.selectedBaby.id,
      status: newStatus,
      flashcardId: flashcardId,
      date: new Date().toISOString()
    };
    await updateProgressStatus(requestData);
    updateLocalProgressStatusByKey({ flashcardId }, newStatus);
    await fetchAndSyncBabyProgresses();
  } catch (error) {
    console.error('Error updating flashcard status:', error);
    Notify.create({ type: 'negative', message: '更新 FlashCard 狀態失敗', position: 'top' });
  }
}

function updateLocalProgressStatusByKey(key: { milestoneId?: string; flashcardId?: string }, status: ProgressStatus) {
  const selectedBaby = userStore.selectedBaby;
  if (!selectedBaby) return;
  const progresses = selectedBaby.progresses || (selectedBaby.progresses = [] as Progress[]);
  const idx = progresses.findIndex((p) => (key.milestoneId && String(p.milestoneId) === key.milestoneId) || (key.flashcardId && String(p.flashcardId) === key.flashcardId));
  if (idx >= 0) {
    const existing = progresses[idx];
    if (!existing) return; // 額外防護
    existing.status = status;
    if (key.milestoneId && !existing.milestoneId) existing.milestoneId = key.milestoneId;
    if (key.flashcardId && !existing.flashcardId) existing.flashcardId = key.flashcardId;
    if (status === ProgressStatus.IN_PROGRESS && !existing.startedAt) existing.startedAt = new Date().toISOString();
    if (status === ProgressStatus.COMPLETED) existing.date = new Date().toISOString();
  } else {
    const base: Progress = {
      id: `temp-${Date.now()}`,
      babyId: selectedBaby.id,
      status,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(key.milestoneId ? { milestoneId: key.milestoneId } : {}),
      ...(key.flashcardId ? { flashcardId: key.flashcardId } : {}),
    } as Progress;
    if (status === ProgressStatus.IN_PROGRESS) base.startedAt = new Date().toISOString();
    progresses.push(base);
  }
}

function updateAchievedMilestonesFromProgress() {
  const progresses = userStore.selectedBaby?.progresses;
  if (userStore.isLoggedIn && progresses) {
    achievedMilestones.value = progresses
      .filter((p) => p.status === ProgressStatus.COMPLETED && p.milestoneId)
      .map((p) => String(p.milestoneId));
  }
}

function openStatusDialog(milestoneId: string) {
  statusDialog.value = { open: true, milestoneId };
}

async function selectStatus(status: ProgressStatus) {
  const id = statusDialog.value.milestoneId;
  if (!id) return;
  await updateMilestoneStatus(id, status);
  statusDialog.value.open = false;
}

function statusClass(milestoneId: string) {
  const s = getMilestoneStatus(milestoneId);
  return {
    'status-not-started': s === ProgressStatus.NOT_STARTED,
    'status-in-progress': s === ProgressStatus.IN_PROGRESS,
    'status-completed': s === ProgressStatus.COMPLETED,
  };
}

watch(
  () => userStore.selectedBaby,
  () => { updateAchievedMilestonesFromProgress(); },
  { deep: true },
);

watch(
  [selectedAgeId, activeCategoryId],
  async () => { await fetchMilestones(); }
);

const filteredMilestonesByCategory = computed((): Milestone[] => {
  return [...milestones.value].sort((a, b) => {
    const aAchieved = isAchieved(a.id);
    const bAchieved = isAchieved(b.id);
    if (aAchieved && !bAchieved) return 1;
    if (!aAchieved && bAchieved) return -1;
    return 0;
  });
});

// 年齡導航
const currentAgeIndex = ref<number | null>(null);
const canGoToPreviousAge = computed(() => currentAgeIndex.value !== null && currentAgeIndex.value > 0);
const canGoToNextAge = computed(() => currentAgeIndex.value !== null && currentAgeIndex.value < ageOptions.value.length - 1);
function goToPreviousAge() { if (canGoToPreviousAge.value) { currentAgeIndex.value!--; updateSelectedAge(); } }
function goToNextAge() { if (canGoToNextAge.value) { currentAgeIndex.value!++; updateSelectedAge(); } }
function updateSelectedAge() { const idx = currentAgeIndex.value; if (idx !== null && idx >= 0 && idx < ageOptions.value.length) { const ageOption = ageOptions.value[idx]; if (ageOption) selectedAgeId.value = ageOption.value; } }
watch(selectedAgeId, (newVal) => { const index = ageOptions.value.findIndex((option) => option.value === newVal); currentAgeIndex.value = index !== -1 ? index : 0; });
watch(ageOptions, () => { if (ageOptions.value.length > 0) { const index = ageOptions.value.findIndex((o) => o.value === selectedAgeId.value); currentAgeIndex.value = index !== -1 ? index : 0; } }, { immediate: true });

function resetFilters() { selectedAgeId.value = null; activeCategoryId.value = null; }
function isValidId(val: unknown): val is string { return typeof val === 'string' && val.trim() !== '' && val !== 'null' && val !== 'undefined'; }
function onCategoryTabChange(val: string | number | undefined) { activeCategoryId.value = (val === 'ALL' || val === undefined || val === '') ? null : String(val); }
function isAchieved(id: string): boolean { return getMilestoneStatus(id) === ProgressStatus.COMPLETED; }

async function fetchMilestones() {
  try {
    isFetching.value = true;
    const params = new URLSearchParams();
    if (isValidId(selectedAgeId.value)) params.append('ageId', selectedAgeId.value);
    if (isValidId(activeCategoryId.value)) params.append('categoryId', activeCategoryId.value);
    const url = `${apiConfig.baseUrl}${apiConfig.endpoints.milestones}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json', 'Accept-Language': 'zh_TW' } });
    if (!response.ok) {
      Notify.create({ type: 'negative', message: `載入里程碑失敗（${response.status}）`, position: 'top' });
      milestones.value = [];
      return;
    }
    milestones.value = (await response.json()) as Milestone[];
    updateAchievedMilestonesFromProgress();
  } catch (err) {
    console.error('Error fetching milestone data:', err);
    Notify.create({ type: 'negative', message: '載入里程碑資料時發生錯誤', position: 'top' });
  } finally { isFetching.value = false; }
}

async function fetchAgeOptions() {
  try {
    const res = await apiClient.get(apiConfig.endpoints.ageOptions, { headers: { Accept: 'application/json', 'Accept-Language': 'zh_TW' } });
    const list = Array.isArray(res.data) ? res.data : [];
    const normalized: AgeOption[] = list.filter(isApiAgeOption).map((o) => {
      const base: AgeOption = { label: o.label, value: String(o.value) };
      const m = typeof o.month === 'number' ? o.month : parseMonthFromLabel(o.label);
      const sm = typeof o.startMonth === 'number' ? o.startMonth : undefined;
      const em = typeof o.endMonth === 'number' ? o.endMonth : undefined;
      return { ...base, ...(typeof m === 'number' ? { month: m } : {}), ...(typeof sm === 'number' ? { startMonth: sm } : {}), ...(typeof em === 'number' ? { endMonth: em } : {}) } as AgeOption;
    });
    ageOptions.value = [{ label: '全部', value: null }, ...normalized];
    if (!hasAutoSelectedAge.value) autoSelectAgeByBaby();
  } catch (e) {
    console.error('取得年齡選項失敗', e);
    ageOptions.value = [{ label: '全部', value: null }];
  }
}

async function fetchCategoryOptions() {
  try {
    const res = await apiClient.get(apiConfig.endpoints.categoryOptions, { headers: { Accept: 'application/json', 'Accept-Language': 'zh_TW' } });
    const list = Array.isArray(res.data) ? res.data : [];
    const normalized: CategoryOption[] = list.filter((o) => o && typeof o.label === 'string' && typeof o.value === 'string').map((o) => ({ label: o.label, value: o.value }));
    categoryOptions.value = [{ label: '全部', value: null }, ...normalized];
    if (!activeCategoryId.value) activeCategoryId.value = null;
  } catch (e) {
    console.error('取得分類選項失敗', e);
    categoryOptions.value = [ { label: '全部', value: null } ];
    if (!activeCategoryId.value) activeCategoryId.value = null;
  }
}

// 自動選齡
watch(() => userStore.selectedBaby?.id, async (id) => { if (id) await fetchAndSyncBabyProgresses(); }, { immediate: true });
function computeBabyMonths(birthDateStr?: string | null): number | null { if (!birthDateStr) return null; const birthDate = new Date(birthDateStr); if (isNaN(birthDate.getTime())) return null; const today = new Date(); let months = (today.getFullYear() - birthDate.getFullYear()) * 12; months += today.getMonth() - birthDate.getMonth(); if (today.getDate() < birthDate.getDate()) months--; return Math.max(0, months); }
function parseMonthFromLabel(label?: string): number | undefined { if (!label) return undefined; const match = label.match(/\d+/); return match ? parseInt(match[0], 10) : undefined; }
function getBestAgeOptionForMonths(months: number): AgeOption | undefined { const opts = ageOptions.value.filter((o) => o.value !== null); if (opts.length === 0) return undefined; type AgeOptionWithMaybeM = AgeOption & { _m?: number }; const withMonth: AgeOptionWithMaybeM[] = opts.map((o) => { const m = o.month ?? o.startMonth ?? parseMonthFromLabel(o.label); return m !== undefined ? { ...o, _m: m } : { ...o }; }); const normalized = withMonth.filter((o): o is AgeOption & { _m: number } => typeof o._m === 'number'); if (normalized.length === 0) return undefined; const notGreater = normalized.filter((o) => o._m <= months).sort((a, b) => b._m - a._m); if (notGreater.length > 0) return notGreater[0]; const greater = normalized.filter((o) => o._m > months).sort((a, b) => a._m - b._m); return greater[0]; }
function autoSelectAgeByBaby() { if (hasAutoSelectedAge.value) return; if (!userStore.isLoggedIn) return; const birth = userStore.selectedBaby?.birthDate; const months = computeBabyMonths(birth); if (months === null) return; const best = getBestAgeOptionForMonths(months); if (best && best.value !== null) { selectedAgeId.value = best.value; hasAutoSelectedAge.value = true; } }
watch([ageOptions, () => userStore.selectedBaby?.birthDate], () => { if (!hasAutoSelectedAge.value && ageOptions.value.length > 1) { autoSelectAgeByBaby(); } }, { deep: true, immediate: true });
watch(() => userStore.selectedBaby?.id, () => { hasAutoSelectedAge.value = false; if (selectedAgeId.value === null) autoSelectAgeByBaby(); });

// 里程碑詳細彈窗控制
function openMilestoneDetail(m: Milestone) { milestoneDetailDialog.value = { open: true, milestone: m }; }
function closeMilestoneDetail() { milestoneDetailDialog.value.open = false; milestoneDetailDialog.value.milestone = null; }

// Flashcards 相關計算
const flashcardsOfCurrentMilestone = computed<MilestoneFlashcard[]>(() => milestoneDetailDialog.value.milestone?.flashcards || []);
const flashcardsCompleted = computed(() => flashcardsOfCurrentMilestone.value.filter(fc => getFlashcardStatus(fc.id) === ProgressStatus.COMPLETED).length);
const flashcardCompletionRatio = computed(() => flashcardsOfCurrentMilestone.value.length === 0 ? 0 : flashcardsCompleted.value / flashcardsOfCurrentMilestone.value.length);
function flashcardStatusIcon(status: ProgressStatus) { switch (status) { case ProgressStatus.COMPLETED: return 'check_circle'; case ProgressStatus.IN_PROGRESS: return 'play_circle'; default: return 'radio_button_unchecked'; } }
function flashcardStatusColor(status: ProgressStatus) { switch (status) { case ProgressStatus.COMPLETED: return 'positive'; case ProgressStatus.IN_PROGRESS: return 'warning'; default: return 'grey'; } }
async function cycleFlashcardStatus(flashcardId: string) { const current = getFlashcardStatus(flashcardId); let next: ProgressStatus; if (current === ProgressStatus.NOT_STARTED) next = ProgressStatus.IN_PROGRESS; else if (current === ProgressStatus.IN_PROGRESS) next = ProgressStatus.COMPLETED; else next = ProgressStatus.NOT_STARTED; await updateFlashcardStatus(flashcardId, next); }

onMounted(async () => { await fetchAgeOptions(); await fetchCategoryOptions(); await fetchMilestones(); await fetchAndSyncBabyProgresses(); });
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

  // 為不同狀態添加樣式
  .milestone-card.status-not-started { border-left: 0; background: transparent; }
  .milestone-card.status-in-progress { border-left-color: #ffa726; background: rgba(255,255,255,0.02); }
  .milestone-card.status-completed { border-left-color: #2ecc71; background: rgba(255,255,255,0.02); }
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

// 開始日期樣式
.start-date {
  font-size: 0.88rem;
  color: #fb8c00; // orange，與進行中一致
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

// 為不同狀態添加樣式
.milestone-card.status-not-started {
  border-left: 0;
  background: transparent;
}
.milestone-card.status-in-progress {
  border-left: 4px solid #fb8c00;
  background: rgba(251, 140, 0, 0.04);
}
.milestone-card.status-completed {
  border-left: 4px solid #21ba45;
  background: rgba(33, 186, 69, 0.04);
}

// 狀態 pill
.status-pill {
  border: 1px solid rgba(0,0,0,0.06);
}

// 新增樣式：簡化的里程碑列表項目
.milestone-simple-item {
  transition: background-color .15s;

  &:hover {
    background: rgba(0,0,0,0.03);
  }
}

// 狀態樣式
.status-not-started { }
.status-in-progress { border-left: 4px solid #ffa726; }
.status-completed { border-left: 4px solid #66bb6a; }

// 影片容器樣式
.video-wrapper {
  background:#000;
  border-radius:8px;
  overflow:hidden;
}

// Flashcard 項目樣式
.flashcard-item {
  .q-item__label + .q-item__label {
    margin-top:2px;
  }
}
</style>

<style scoped lang="scss">
@import '../css/MilestonePage.scss';
</style>
