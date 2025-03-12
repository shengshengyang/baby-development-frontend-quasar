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
          :class="{ 'achieved': isAchieved(milestone.id) }"
          @click="flipCard(milestone.id)"
        >
          <q-card-section class="milestone-card-inner" :class="{ 'flipped': isCardFlipped(milestone.id) }">
            <div class="milestone-front">
              <div class="milestone-image">
                <q-img
                  :src="milestone.translations?.[0]?.imageUrl || ''"
                  class="milestone-img"
                />
                <q-badge color="primary" class="age-badge">{{ milestone.ageInMonths }} 個月</q-badge>
              </div>
              <div class="milestone-content q-pa-md">
                <div class="text-h6">{{ milestone.translations?.[0]?.frontText || '' }}</div>
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
                <p>{{ milestone.translations?.[0]?.backText || '' }}</p>
              </div>
              <q-btn flat color="primary" label="返回" @click.stop="flipCard(milestone.id)" class="q-ma-sm" />
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
import { ref, computed } from 'vue'

// 定義介面
interface Translation {
  id: number;
  languageCode: string;
  frontText: string;
  backText: string;
  imageUrl: string;
}

interface Milestone {
  id: number;
  category: string;
  milestoneId: number;
  ageInMonths: number;
  translations: Translation[];
}

interface AgeGroup {
  label: string;
  value: [number, number] | null;
}

// 假資料 - 里程碑資料
const milestones = ref<Milestone[]>([
  {
    id: 1,
    category: "motor",
    milestoneId: 101,
    ageInMonths: 3,
    translations: [
      {
        id: 1,
        languageCode: "zh-TW",
        frontText: "能抬頭",
        backText: "您的寶寶能夠在趴著時抬起頭部，並維持短時間。這是頸部肌肉發展的重要指標。",
        imageUrl: "https://via.placeholder.com/300x200?text=抬頭"
      }
    ]
  },
  {
    id: 2,
    category: "motor",
    milestoneId: 102,
    ageInMonths: 6,
    translations: [
      {
        id: 2,
        languageCode: "zh-TW",
        frontText: "會翻身",
        backText: "寶寶能夠從仰臥翻至俯臥，或反之。這表示寶寶的核心肌肉和協調能力正在發展。",
        imageUrl: "https://via.placeholder.com/300x200?text=翻身"
      }
    ]
  },
  {
    id: 3,
    category: "cognitive",
    milestoneId: 103,
    ageInMonths: 6,
    translations: [
      {
        id: 3,
        languageCode: "zh-TW",
        frontText: "認識自己的名字",
        backText: "當您呼喚寶寶的名字時，他/她會轉頭或有反應。這顯示寶寶的聽覺辨識能力正在發展。",
        imageUrl: "https://via.placeholder.com/300x200?text=名字反應"
      }
    ]
  },
  {
    id: 4,
    category: "language",
    milestoneId: 104,
    ageInMonths: 9,
    translations: [
      {
        id: 4,
        languageCode: "zh-TW",
        frontText: "牙牙學語",
        backText: "寶寶開始發出「媽媽」、「爸爸」等簡單音節，這是語言發展的重要階段。",
        imageUrl: "https://via.placeholder.com/300x200?text=牙牙學語"
      }
    ]
  },
  {
    id: 5,
    category: "social",
    milestoneId: 105,
    ageInMonths: 9,
    translations: [
      {
        id: 5,
        languageCode: "zh-TW",
        frontText: "會玩躲貓貓",
        backText: "寶寶開始理解物體恆存的概念，並享受社交互動遊戲，如躲貓貓。",
        imageUrl: "https://via.placeholder.com/300x200?text=躲貓貓"
      }
    ]
  },
  {
    id: 6,
    category: "motor",
    milestoneId: 106,
    ageInMonths: 12,
    translations: [
      {
        id: 6,
        languageCode: "zh-TW",
        frontText: "獨自站立",
        backText: "寶寶能夠不依靠支撐獨自站立幾秒鐘，這是邁向行走的重要一步。",
        imageUrl: "https://via.placeholder.com/300x200?text=獨自站立"
      }
    ]
  },
  {
    id: 7,
    category: "language",
    milestoneId: 107,
    ageInMonths: 12,
    translations: [
      {
        id: 7,
        languageCode: "zh-TW",
        frontText: "說第一個有意義的詞",
        backText: "寶寶開始有意識地使用詞語表達需求或命名物體，而不只是模仿聲音。",
        imageUrl: "https://via.placeholder.com/300x200?text=第一個詞"
      }
    ]
  },
  {
    id: 8,
    category: "cognitive",
    milestoneId: 108,
    ageInMonths: 18,
    translations: [
      {
        id: 8,
        languageCode: "zh-TW",
        frontText: "使用工具",
        backText: "寶寶開始使用湯匙自己進食，或用其他物品作為工具達到目的。這顯示問題解決能力的發展。",
        imageUrl: "https://via.placeholder.com/300x200?text=使用工具"
      }
    ]
  },
  {
    id: 9,
    category: "social",
    milestoneId: 109,
    ageInMonths: 18,
    translations: [
      {
        id: 9,
        languageCode: "zh-TW",
        frontText: "表現同理心",
        backText: "當看到他人悲傷時，寶寶會表現出關心，如拍拍或給予擁抱。這是社交情感發展的重要指標。",
        imageUrl: "https://via.placeholder.com/300x200?text=同理心"
      }
    ]
  },
  {
    id: 10,
    category: "motor",
    milestoneId: 110,
    ageInMonths: 24,
    translations: [
      {
        id: 10,
        languageCode: "zh-TW",
        frontText: "上下樓梯",
        backText: "寶寶能夠在有扶手或協助的情況下上下樓梯，展示平衡能力和大肌肉協調的進步。",
        imageUrl: "https://via.placeholder.com/300x200?text=上下樓梯"
      }
    ]
  }
]);

// 年齡分組定義
const ageGroups: AgeGroup[] = [
  { label: '全部', value: null },
  { label: '0-6 個月', value: [0, 6] },
  { label: '7-12 個月', value: [7, 12] },
  { label: '13-18 個月', value: [13, 18] },
  { label: '19-24 個月', value: [19, 24] },
  { label: '24+ 個月', value: [25, 100] }
];

// 翻牌效果相關
const flippedCards = ref<number[]>([]);
const achievedMilestones = ref<number[]>([]);
const selectedAgeGroup = ref<[number, number] | null>(null);
// 新增 activeCategory 來記錄當前分類 tab，預設為 'motor' 或可設定為第一個分類
const activeCategory = ref('motor');

// 翻轉卡片
function flipCard(id: number): void {
  if (isCardFlipped(id)) {
    flippedCards.value = flippedCards.value.filter(cardId => cardId !== id);
  } else {
    flippedCards.value.push(id);
  }
}

// 檢查卡片是否已翻轉
function isCardFlipped(id: number): boolean {
  return flippedCards.value.includes(id);
}

// 檢查里程碑是否已達成
function isAchieved(id: number): boolean {
  return achievedMilestones.value.includes(id);
}

// 依照年齡篩選里程碑
const filteredMilestones = computed((): Milestone[] => {
  if (!selectedAgeGroup.value) {
    return milestones.value;
  }

  const [min, max] = selectedAgeGroup.value;
  return milestones.value.filter(milestone =>
    milestone.ageInMonths >= min && milestone.ageInMonths <= max
  );
});

// 獲取所有類別
const categories = computed((): string[] => {
  const categorySet = new Set<string>();
  filteredMilestones.value.forEach(milestone => {
    categorySet.add(milestone.category);
  });
  return Array.from(categorySet);
});

// 根據當前 activeCategory 過濾里程碑
const filteredMilestonesByCategory = computed((): Milestone[] => {
  return filteredMilestones.value.filter(milestone => milestone.category === activeCategory.value);
});

// 清除篩選
function resetFilters() {
  selectedAgeGroup.value = null;
  // 可根據需要重設 activeCategory，或保留原本選擇
}


// 獲取類別的顯示名稱
function getCategoryTitle(category: string): string {
  const categoryMap: Record<string, string> = {
    'motor': '動作發展',
    'cognitive': '認知發展',
    'language': '語言發展',
    'social': '社交發展'
  };

  return categoryMap[category] || category;
}
</script>

<style scoped src="../css/MilestonePage.scss"></style>
