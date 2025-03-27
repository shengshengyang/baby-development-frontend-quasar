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
                v-model="achievedMilestones"
                :val="milestone.id"
                label="已達成"
                class="milestone-checkbox q-pa-sm"
                @click.stop
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

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

const flippedCards = ref<number[]>([]);
const achievedMilestones = ref<number[]>([]);
const selectedAgeGroup = ref<[number, number] | null>(null);
const activeCategory = ref('massive motion'); // 依照 API 回傳的 category 預設

// 3. 生命週期 - 在 onMounted 中發送 API 請求，拿取資料
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8080/open/flash-card', {
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
  } catch (error) {
    console.error('Error fetching flash-card data:', error);
  }
});
// 年齡分組定義
const ageGroups: AgeGroup[] = [
  { label: '全部', value: null },
  { label: '0-6 個月', value: [0, 6] },
  { label: '7-12 個月', value: [7, 12] },
  { label: '13-18 個月', value: [13, 18] },
  { label: '19-24 個月', value: [19, 24] },
  { label: '24+ 個月', value: [25, 100] },
];

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

// 根據當前 activeCategory 過濾里程碑
const filteredMilestonesByCategory = computed((): Milestone[] => {
  return filteredMilestones.value.filter(
    (milestone) => milestone.category === activeCategory.value,
  );
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
</style>

<style scoped src="../css/MilestonePage.scss"></style>
