import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Baby {
  id: number;
  name: string;
  birthDate: string;
  gender: string;
  // 可以根據需要添加更多屬性
}

export const useBabyStore = defineStore('baby', () => {
  const babies = ref<Baby[]>([]);
  const currentBaby = ref<Baby | null>(null);

  // 設置當前選中的寶寶
  function setCurrentBaby(baby: Baby) {
    currentBaby.value = baby;
  }

  // 安全地設置當前寶寶，處理可能的undefined值
  function setCurrentBabyById(id: number) {
    const baby = babies.value.find((b) => b.id === id) || null;
    currentBaby.value = baby;
  }

  // 設置寶寶列表
  function setBabies(newBabies: Baby[]) {
    babies.value = newBabies;

    // 如果有寶寶數據但尚未選擇當前寶寶，則自動選擇第一個
    if (babies.value.length > 0 && !currentBaby.value) {
      currentBaby.value = babies.value[0] || null;
    }
  }

  return {
    babies,
    currentBaby,
    setCurrentBaby,
    setBabies,
    setCurrentBabyById,
  };
});
