// flashCard 相關 API 服務
import apiClient from '../apiClient';
import { apiConfig } from '../config';

// 定義 flashCard 數據結構
export interface FlashCard {
  id: string;
  categoryId: string;
  milestone: {
    id: string;
    description: string;
  };
  ageInMonths: number;
  subject: {
    tw: string;
    en: string;
    vi: string;
    ko: string;
    cn: string;
    ja: string;
  };
  subjectString: string;
  imageUrl: string;
  translations: Array<{
    id: string;
    languageCode: string;
    description: string;
  }>;
}

// 定義 API 查詢參數
export interface FlashCardQueryParams {
  ageId?: string | undefined;
  categoryId?: string | undefined;
}

// 定義年齡選項
export interface AgeOption {
  label: string;
  value: string | null;
  month?: number;
  startMonth?: number;
  endMonth?: number;
}

// 定義分類選項
export interface CategoryOption {
  label: string;
  value: string | null;
}

// 定義後端回應的選項格式
interface ApiOptionResponse {
  label: string;
  value: string | number;
  month?: number;
  startMonth?: number;
  endMonth?: number;
}

export const flashcardService = {
  /**
   * 獲取 flashCard 列表
   * @param params 查詢參數 (ageId, categoryId)
   * @returns Promise<FlashCard[]>
   */
  async getFlashCards(params?: FlashCardQueryParams): Promise<FlashCard[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.ageId) {
        queryParams.append('ageId', params.ageId);
      }

      if (params?.categoryId) {
        queryParams.append('categoryId', params.categoryId);
      }

      const url = queryParams.toString()
        ? `${apiConfig.endpoints.flashcard}?${queryParams.toString()}`
        : apiConfig.endpoints.flashcard;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching flashcard data:', error);
      throw error;
    }
  },

  /**
   * 獲取年齡選項
   * @returns Promise<AgeOption[]>
   */
  async getAgeOptions(): Promise<AgeOption[]> {
    try {
      const response = await apiClient.get(`${apiConfig.endpoints.flashcard}/age-options`);
      return [
        { label: '全部', value: null },
        ...response.data.map((option: ApiOptionResponse) => ({
          label: option.label,
          value: String(option.value),
          month: option.month,
          startMonth: option.startMonth,
          endMonth: option.endMonth,
        }))
      ];
    } catch (error) {
      console.error('Error fetching age options:', error);
      // 返回默認選項
      return [{ label: '全部', value: null }];
    }
  },

  /**
   * 獲取分類選項
   * @returns Promise<CategoryOption[]>
   */
  async getCategoryOptions(): Promise<CategoryOption[]> {
    try {
      const response = await apiClient.get(`${apiConfig.endpoints.flashcard}/category-options`);
      return [
        { label: '全部', value: null },
        ...response.data.map((option: ApiOptionResponse) => ({
          label: option.label,
          value: String(option.value),
        }))
      ];
    } catch (error) {
      console.error('Error fetching category options:', error);
      // 返回默認選項
      return [{ label: '全部', value: null }];
    }
  }
};
