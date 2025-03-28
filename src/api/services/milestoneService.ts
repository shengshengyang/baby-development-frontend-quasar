// 里程碑相關 API 服務
import apiClient from '../apiClient';
import { apiConfig } from '../config';

export interface Milestone {
  id: number;
  category: string;
  milestoneId: number;
  ageInMonths: number;
  languageCode: string;
  frontText: string;
  backText: string;
  imageUrl: string;
}

export const milestoneService = {
  /**
   * 獲取所有里程碑資料
   * @param language 語言代碼，預設為 zh_TW
   * @returns Promise<Milestone[]>
   */
  async getMilestones(language = 'zh_TW'): Promise<Milestone[]> {
    try {
      const response = await apiClient.get(apiConfig.endpoints.milestones, {
        headers: {
          'Accept-Language': language,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching milestone data:', error);
      throw error;
    }
  },
};
