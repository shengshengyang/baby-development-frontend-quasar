// 里程碑相關 API 服務（重構整合 age/category options 與篩選）
import apiClient from '../apiClient';
import { apiConfig } from '../config';
import { useLocaleStore, type LocaleCode } from 'src/stores/locale';
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
}

function buildQuery(params?: MilestoneQueryParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.ageId) search.append('ageId', params.ageId);
  if (params.categoryId) search.append('categoryId', params.categoryId);
  return search.toString();
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

export const milestoneService = {
  /** 取得里程碑列表 */
  async getMilestones(params?: MilestoneQueryParams): Promise<Milestone[]> {
    const localeStore = useLocaleStore();
    const language = getAcceptLanguage(localeStore.currentLocale);
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
  async getAgeOptions(): Promise<AgeOption[]> {
    const localeStore = useLocaleStore();
    const language = getAcceptLanguage(localeStore.currentLocale);
    try {
      const res = await apiClient.get(apiConfig.endpoints.ageOptions, {
        headers: { 'Accept-Language': language, Accept: 'application/json' },
      });
      const list: unknown[] = Array.isArray(res.data) ? res.data : [];
      return [
        { label: getAllLabel(), value: null },
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
      return [{ label: getAllLabel(), value: null }];
    }
  },

  /** 取得分類選項 */
  async getCategoryOptions(): Promise<CategoryOption[]> {
    const localeStore = useLocaleStore();
    const language = getAcceptLanguage(localeStore.currentLocale);
    try {
      const res = await apiClient.get(apiConfig.endpoints.categoryOptions, {
        headers: { 'Accept-Language': language, Accept: 'application/json' },
      });
      const list: unknown[] = Array.isArray(res.data) ? res.data : [];
      return [
        { label: getAllLabel(), value: null },
        ...list
          .filter(isRawOption)
          .filter(o => typeof o.label === 'string' && typeof o.value === 'string')
          .map(o => ({ label: o.label as string, value: o.value as string })),
      ];
    } catch (e) {
      console.error('getCategoryOptions error', e);
      return [{ label: getAllLabel(), value: null }];
    }
  },
};
