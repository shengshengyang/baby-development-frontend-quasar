// 里程碑相關 API 服務（重構整合 age/category options 與篩選）
import apiClient from '../apiClient';
import { apiConfig } from '../config';
import type { Milestone, AgeOption, CategoryOption } from 'src/types/milestone';

interface RawOption {
  label?: unknown;
  value?: unknown;
  month?: number;
  startMonth?: number;
  endMonth?: number;
}
function isRawOption(o: unknown): o is RawOption {
  return typeof o === 'object' && o !== null && 'label' in o && 'value' in o;
}

export interface MilestoneQueryParams {
  ageId?: string | null;
  categoryId?: string | null;
  language?: string;
}

function buildQuery(params?: MilestoneQueryParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.ageId) search.append('ageId', params.ageId);
  if (params.categoryId) search.append('categoryId', params.categoryId);
  return search.toString();
}

export const milestoneService = {
  /** 取得里程碑列表 */
  async getMilestones(params?: MilestoneQueryParams): Promise<Milestone[]> {
    const language = params?.language || 'zh_TW';
    const query = buildQuery(params);
    const url = query
      ? `${apiConfig.endpoints.milestones}?${query}`
      : apiConfig.endpoints.milestones;
    try {
      const res = await apiClient.get<Milestone[]>(url, {
        headers: { 'Accept-Language': language, Accept: 'application/json' },
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      console.error('getMilestones error', e);
      return [];
    }
  },

  /** 取得年齡選項 */
  async getAgeOptions(language = 'zh_TW'): Promise<AgeOption[]> {
    try {
      const res = await apiClient.get(apiConfig.endpoints.ageOptions, {
        headers: { 'Accept-Language': language, Accept: 'application/json' },
      });
      const list: unknown[] = Array.isArray(res.data) ? res.data : [];
      return [
        { label: '全部', value: null },
        ...list
          .filter(isRawOption)
          .filter(o => typeof o.label === 'string' && (typeof o.value === 'string' || typeof o.value === 'number'))
          .map(o => ({
            label: o.label as string,
            value: String(o.value as string | number),
            month: o.month,
            startMonth: o.startMonth,
            endMonth: o.endMonth,
          })),
      ];
    } catch (e) {
      console.error('getAgeOptions error', e);
      return [{ label: '全部', value: null }];
    }
  },

  /** 取得分類選項 */
  async getCategoryOptions(language = 'zh_TW'): Promise<CategoryOption[]> {
    try {
      const res = await apiClient.get(apiConfig.endpoints.categoryOptions, {
        headers: { 'Accept-Language': language, Accept: 'application/json' },
      });
      const list: unknown[] = Array.isArray(res.data) ? res.data : [];
      return [
        { label: '全部', value: null },
        ...list
          .filter(isRawOption)
          .filter(o => typeof o.label === 'string' && typeof o.value === 'string')
          .map(o => ({ label: o.label as string, value: o.value as string })),
      ];
    } catch (e) {
      console.error('getCategoryOptions error', e);
      return [{ label: '全部', value: null }];
    }
  },
};
