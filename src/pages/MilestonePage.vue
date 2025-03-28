<template>
  <q-page class="q-pa-md milestone-page">
    <div class="page-header">
      <h2 class="text-h4 text-primary q-mb-md">寶寶發展里程碑</h2>
      <p class="text-subtitle1 q-mb-lg">追蹤您寶寶的成長與發展階段</p>
    </div>

    <!-- 年齡分組選擇器 -->
    <div class="age-filter q-mb-lg">
      <q-select
        v-model="selectedAgeGroup"
        :options="ageGroups"
        label="年齡篩選"
        outlined
        emit-value
        map-options
        class="age-selector"
      />
    </div>

    <!-- 分類 Tabs -->
    <q-tabs
      v-model="activeCategory"
      class="q-mb-md"
      dense
      align="justify"
      indicator-color="primary"
    >
      <q-tab
        v-for="category in categories"
        :key="category"
        :name="category"
        :label="getCategoryTitle(category)"
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
                <q-img :src="milestone.imageUrl || ''" class="milestone-img" />
                <q-badge color="primary" class="age-badge"
                  >{{ milestone.ageInMonths }} 個月</q-badge
                >
              </div>
              <div class="milestone-content q-pa-md">
                <div class="text-h6">
                  {{ milestone.frontText }}
                </div>
              </div>
              <q-checkbox
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
                <p>{{ milestone.backText }}</p>
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
import { Notify } from 'quasar'; // Import Notify directly
import { apiPost } from 'src/api/apiHelper';
import { apiConfig } from 'src/api/config';
// Import the Baby type from the user store

// 1. 定義介面，符合 API 返回的資料結構
interface Milestone {
  id: number;
  category: string;
  milestoneId: number;
  ageInMonths: number;
  languageCode: string;
  frontText: string;
  backText: string;
  imageUrl: string;
}

interface AgeGroup {
  label: string;
  value: [number, number] | null;
}

// 2. 響應式資料
const milestones = ref<Milestone[]>([]);
const userStore = useUserStore();
const flippedCards = ref<number[]>([]);
const achievedMilestones = ref<number[]>([]);
const selectedAgeGroup = ref<[number, number] | null>(null);
const activeCategory = ref('massive motion'); // 依照 API 回傳的 category 預設

// 增加 loading 狀態
const isLoading = ref(false);

// 從選定寶寶的進度中更新已達成的里程碑
function updateAchievedMilestonesFromProgress() {
  if (userStore.isLoggedIn && userStore.selectedBaby?.progresses) {
    // 從進度資料中取得已達成的里程碑 ID
    const achievedIds = userStore.selectedBaby.progresses
      .filter((progress) => progress.achieved)
      .map((progress) => progress.flashcardId);

    // 更新已達成的里程碑列表
    achievedMilestones.value = achievedIds;
  }
}

// 3. 生命週期 - 在 onMounted 中發送 API 請求，拿取資料
onMounted(async () => {
  try {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.milestones}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'zh_TW', // 指定語言
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: Milestone[] = await response.json();
    milestones.value = data;
    console.log('取得資料:', data);

    // 資料載入後，從進度更新已達成里程碑
    updateAchievedMilestonesFromProgress();
  } catch (error) {
    console.error('Error fetching flash-card data:', error);
  }
});

// 監聽選定寶寶的變化，更新已達成的里程碑
watch(
  () => userStore.selectedBaby,
  () => {
    updateAchievedMilestonesFromProgress();
  },
  { deep: true },
);

// 根據實際里程碑資料動態生成年齡選項
const ageGroups = computed((): AgeGroup[] => {
  // 首先添加「全部」選項
  const groups: AgeGroup[] = [{ label: '全部', value: null }];

  if (milestones.value.length === 0) {
    return groups;
  }

  // 取得所有唯一的月齡，並依照月齡排序
  const uniqueAges = [...new Set(milestones.value.map((m) => m.ageInMonths))].sort((a, b) => a - b);

  // 為每個實際存在的月齡創建選項
  uniqueAges.forEach((age) => {
    groups.push({
      label: `${age} 個月`,
      value: [age, age], // 精確匹配此年齡
    });
  });

  return groups;
});

// 4. 邏輯函式
function flipCard(id: number): void {
  if (isCardFlipped(id)) {
    flippedCards.value = flippedCards.value.filter((cardId) => cardId !== id);
  } else {
    flippedCards.value.push(id);
  }
}

function isCardFlipped(id: number): boolean {
  return flippedCards.value.includes(id);
}

function isAchieved(id: number): boolean {
  return achievedMilestones.value.includes(id);
}

// 依照年齡篩選里程碑
const filteredMilestones = computed((): Milestone[] => {
  if (!selectedAgeGroup.value) {
    return milestones.value;
  }

  const [min, max] = selectedAgeGroup.value;
  return milestones.value.filter(
    (milestone) => milestone.ageInMonths >= min && milestone.ageInMonths <= max,
  );
});

// 獲取所有類別
const categories = computed((): string[] => {
  const categorySet = new Set<string>();
  filteredMilestones.value.forEach((milestone) => {
    categorySet.add(milestone.category);
  });
  return Array.from(categorySet);
});

// 根據當前 activeCategory 過濾里程碑，並將已達成的排在最後
const filteredMilestonesByCategory = computed((): Milestone[] => {
  return filteredMilestones.value
    .filter((milestone) => milestone.category === activeCategory.value)
    .sort((a, b) => {
      // 已達成的排序到最後
      const aAchieved = isAchieved(a.id);
      const bAchieved = isAchieved(b.id);

      if (aAchieved && !bAchieved) return 1; // a 已達成但 b 未達成，a 排後面
      if (!aAchieved && bAchieved) return -1; // a 未達成但 b 已達成，a 排前面
      return 0; // 兩者狀態相同，保持原順序
    });
});

function resetFilters() {
  selectedAgeGroup.value = null;
  // 可以視需要重設 activeCategory
}

// 顯示對應的中文分類名稱
function getCategoryTitle(category: string): string {
  const categoryMap: Record<string, string> = {
    'massive motion': '大動作發展',
    'fine motor': '精細動作',
    cognitive: '認知發展',
    language: '語言發展',
    social: '社交發展',
  };
  return categoryMap[category] || category;
}

// 切換里程碑狀態並呼叫 API
async function toggleMilestoneStatus(flashcardId: number, checked: boolean): Promise<void> {
  // 如果沒有登入或沒有選擇寶寶，顯示提示
  if (!userStore.isLoggedIn || !userStore.selectedBaby) {
    Notify.create({
      // Use Notify.create instead of $q.notify
      type: 'warning',
      message: '請先登入並選擇寶寶',
      position: 'top',
    });
    return;
  }

  try {
    // 開始載入
    isLoading.value = true;

    // 預先更新本地狀態，提供即時反饋
    if (checked) {
      // 如果要標記為已達成，先加入到本地列表
      if (!achievedMilestones.value.includes(flashcardId)) {
        achievedMilestones.value.push(flashcardId);
      }
    } else {
      // 如果要標記為未達成，從本地列表中移除
      achievedMilestones.value = achievedMilestones.value.filter((id) => id !== flashcardId);
    }

    // 準備 API 請求內容
    const requestBody = {
      babyId: userStore.selectedBaby.id,
      flashcardId: flashcardId,
    };

    // 使用 apiHelper 發送 API 請求
    const updatedBaby = await apiPost<Baby>('/flash-card/check-progress', requestBody);
    console.log('API返回的更新後寶寶資料:', updatedBaby);

    // 更新 Pinia 儲存的寶寶資訊
    userStore.updateSelectedBaby(updatedBaby);
    p;
    // 從後端返回的資料重新更新已達成里程碑列表，確保與後端同步
    updateAchievedMilestonesFromProgress();

    // 顯示成功通知
    Notify.create({
      // Use Notify.create instead of $q.notify
      type: 'positive',
      message: checked ? '里程碑達成！' : '已取消達成狀態',
      position: 'top',
    });
  } catch (error) {
    console.error('Error updating milestone status:', error);
    Notify.create({
      // Use Notify.create instead of $q.notify
      type: 'negative',
      message: '更新里程碑狀態時發生錯誤',
      position: 'top',
    });

    // 發生錯誤時還原本地狀態
    updateAchievedMilestonesFromProgress();
  } finally {
    // 結束載入
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
</style>

<style scoped lang="scss">
@import '../css/MilestonePage.scss';
</style>
