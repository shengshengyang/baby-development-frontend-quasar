<template>
  <q-page class="q-pa-md milestone-page">
    <div class="page-header">
      <h2 class="text-h4 text-primary q-mb-md">寶寶發展里程碑</h2>
      <p class="text-subtitle1 q-mb-lg">追��您寶寶的成長與發展階段</p>
    </div>

    <!-- 年齡分組選擇器 -->
    <div class="age-filter q-mb-lg">
      <q-select
        v-model="selectedAgeId"
        :options="ageOptions"
        label="年齡篩選"
        outlined
        emit-value
        map-options
        class="age-selector"
      />
    </div>

    <!-- 分類 Tabs：使用後端 options -->
    <q-tabs
      v-model="activeCategoryId"
      class="q-mb-md"
      dense
      align="justify"
      indicator-color="primary"
    >
      <q-tab
        v-for="opt in categoryOptions"
        :key="opt.value || 'all'"
        :name="opt.value || undefined"
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
              <!-- 只有登入用戶才顯示已達成的選項按鈕 -->
              <q-checkbox
                v-if="userStore.isLoggedIn"
                :model-value="isAchieved(milestone.id)"
                label="已達成"
                class="milestone-checkbox q-pa-sm"
                @click.stop
                @update:model-value="toggleMilestoneStatus(milestone.id, $event)"
              />
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
import { useUserStore, type Baby } from 'src/stores/user';
import { Notify } from 'quasar';
import { apiPost } from 'src/api/apiHelper';
import { apiConfig } from 'src/api/config';
import apiClient from 'src/api/apiClient';

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

// 從選定寶寶的進度中更新已達成的里程碑
function updateAchievedMilestonesFromProgress() {
  if (userStore.isLoggedIn && userStore.selectedBaby?.progresses) {
    achievedMilestones.value = userStore.selectedBaby.progresses
      .filter((progress) => progress.achieved)
      .map((progress) => String(progress.flashcardId));
  }
}

function getAchievementDate(flashcardId: string): string | null {
  if (!userStore.selectedBaby?.progresses) return null;
  const progress = userStore.selectedBaby.progresses.find(
    (p) => String(p.flashcardId) === flashcardId && p.achieved,
  );
  return progress ? progress.dateAchieved : null;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW');
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
    const fallback: CategoryOption[] = [
      { label: '全部', value: null },
      { label: '動作發展', value: 'fallback-motion' },
      { label: '認知發展', value: 'fallback-cognitive' },
      { label: '語言溝通', value: 'fallback-language' },
      { label: '社會與情感', value: 'fallback-social' },
    ];
    categoryOptions.value = fallback;
    if (!activeCategoryId.value) {
      activeCategoryId.value = null; // 預設為「全部」
    }
  }
}

// 新增：根據選擇的篩選條件獲取里程碑數據
async function fetchMilestones() {
  try {
    const params = new URLSearchParams();

    // 添加年齡參數
    if (selectedAgeId.value) {
      params.append('ageId', selectedAgeId.value);
    }

    // 添加分類參數
    if (activeCategoryId.value) {
      params.append('categoryId', activeCategoryId.value);
    }

    const url = `${apiConfig.baseUrl}${apiConfig.endpoints.milestones}${params.toString() ? '?' + params.toString() : ''}`;

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

    const data: Milestone[] = await response.json();
    milestones.value = data;
    updateAchievedMilestonesFromProgress();
  } catch (error) {
    console.error('Error fetching milestone data:', error);
    Notify.create({
      type: 'negative',
      message: '載入里程碑資料時發生錯誤',
      position: 'top'
    });
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

function isAchieved(id: string): boolean {
  return achievedMilestones.value.includes(id);
}

function resetFilters() {
  selectedAgeId.value = null;
  activeCategoryId.value = null; // 重設為「全部」
}

// 切換里程碑狀態並呼叫 API
async function toggleMilestoneStatus(flashcardId: string, checked: boolean): Promise<void> {
  if (!userStore.isLoggedIn || !userStore.selectedBaby) {
    Notify.create({ type: 'warning', message: '請先登入並選擇寶寶', position: 'top' });
    return;
  }

  try {
    isLoading.value = true;

    if (checked) {
      if (!achievedMilestones.value.includes(flashcardId)) {
        achievedMilestones.value.push(flashcardId);
      }
    } else {
      achievedMilestones.value = achievedMilestones.value.filter((id) => id !== flashcardId);
    }

    const requestBody = {
      babyId: userStore.selectedBaby.id,
      flashcardId: flashcardId,
    };

    const updatedBaby = await apiPost<Baby>('/flash-card/check-progress', requestBody);
    userStore.updateSelectedBaby(updatedBaby);
    updateAchievedMilestonesFromProgress();

    Notify.create({
      type: 'positive',
      message: checked ? '里程碑達成！' : '已取消達成狀態',
      position: 'top',
    });
  } catch (error) {
    console.error('Error updating milestone status:', error);
    Notify.create({ type: 'negative', message: '更新里程碑狀態時發生錯誤', position: 'top' });
    updateAchievedMilestonesFromProgress();
  } finally {
    isLoading.value = false;
  }
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
</style>

<style scoped lang="scss">
@import '../css/MilestonePage.scss';
</style>
