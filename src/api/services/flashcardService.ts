// flashCard 相關 API 服務
import apiClient from '../apiClient';
import { apiConfig } from '../config';
import { useLocaleStore, type LocaleCode } from 'src/stores/locale';

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

// 將 locale 格式轉換為後端接受的格式
function getAcceptLanguage(locale: LocaleCode): string {
  return locale === 'zh-TW' ? 'zh_TW' : 'en_US';
}

// 取得翻譯後的「全部」標籤
function getAllLabel(): string {
  const localeStore = useLocaleStore();
  return localeStore.currentLocale === 'zh-TW' ? '全部' : 'All';
}

export const flashcardService = {
  /**
   * 獲取 flashCard 列表
   * @param params 查詢參數 (ageId, categoryId)
   * @returns Promise<FlashCard[]>
   */
  async getFlashCards(params?: FlashCardQueryParams): Promise<FlashCard[]> {
    const localeStore = useLocaleStore();
    const language = getAcceptLanguage(localeStore.currentLocale);

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

      const response = await apiClient.get(url, {
        headers: { 'Accept-Language': language },
      });
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
    const localeStore = useLocaleStore();
    const language = getAcceptLanguage(localeStore.currentLocale);

    try {
      const response = await apiClient.get(`${apiConfig.endpoints.ageOptions}`, {
        headers: { 'Accept-Language': language },
      });
      console.log('FlashCard age options response:', response.data);
      const options = [
        { label: getAllLabel(), value: null },
        ...response.data.map((option: ApiOptionResponse) => ({
          label: option.label,
          value: String(option.value),
          month: option.month,
          startMonth: option.startMonth,
          endMonth: option.endMonth,
        }))
      ];
      console.log('Processed age options:', options);
      return options;
    } catch (error) {
      console.error('Error fetching age options:', error);
      return [{ label: getAllLabel(), value: null }];
    }
  },

  /**
   * 獲取分類選項
   * @returns Promise<CategoryOption[]>
   */
  async getCategoryOptions(): Promise<CategoryOption[]> {
    const localeStore = useLocaleStore();
    const language = getAcceptLanguage(localeStore.currentLocale);

    try {
      const response = await apiClient.get(`${apiConfig.endpoints.categoryOptions}`, {
        headers: { 'Accept-Language': language },
      });
      console.log('FlashCard category options response:', response.data);
      const options = [
        { label: getAllLabel(), value: null },
        ...response.data.map((option: ApiOptionResponse) => ({
          label: option.label,
          value: String(option.value),
        }))
      ];
      console.log('Processed category options:', options);
      return options;
    } catch (error) {
      console.error('Error fetching category options:', error);
      return [{ label: getAllLabel(), value: null }];
    }
  }
};
