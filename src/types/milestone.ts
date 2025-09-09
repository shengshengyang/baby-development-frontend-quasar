// 里程碑與相關選項集中型別定義
// 若後端結構調整，僅需在此更新

export interface LocalizedText {
  en: string;
  tw: string;
  ja: string;
  cn: string;
  vi: string;
  ko: string;
}

export interface AgeInfo {
  id: string;
  month: number; // 起始月齡（後端若提供 startMonth 可再擴展）
  displayName: string;
  displayNameObject: LocalizedText;
}

export interface CategoryInfo {
  id: string;
  name: string; // 後端新結構僅提供純文字名稱
  // nameObject: LocalizedText; // 移除：後端不再提供
}

// 新增：里程碑內含的 flashcard 簡化結構
export interface MilestoneFlashcardCategory {
  id: string;
  name: string;
}

export interface MilestoneFlashcard {
  id: string;
  category: MilestoneFlashcardCategory;
  subject: string; // 正面顯示主題
  imageUrl: string;
  description: string; // 詳細描述
}

// 後端目前（MilestonePage 使用）對應的里程碑資料（更新後）
export interface Milestone {
  id: string;
  age: AgeInfo;
  category: CategoryInfo;
  subject?: string; // 新增：前端卡片僅顯示 subject（若後端暫未提供則回退 description）
  description: string;
  descriptionObject: LocalizedText; // 明確指定型別
  videoUrl: string | null;
  imageBase64: string | null;
  flashcards?: MilestoneFlashcard[]; // 新增：可用於達成此里程碑的 flashcards
}

// 年齡下拉選單統一型別（value=null 代表『全部』）
export interface AgeOption {
  label: string;
  value: string | null;
  month?: number;
  startMonth?: number;
  endMonth?: number;
}

// 後端原始年齡選項（value 可能是 number）
export interface ApiAgeOption {
  label: string;
  value: string | number;
  month?: number;
  startMonth?: number;
  endMonth?: number;
}

export function isApiAgeOption(o: unknown): o is ApiAgeOption {
  if (typeof o !== 'object' || o === null) return false;
  return 'label' in o && 'value' in o;
}

export interface CategoryOption {
  label: string;
  value: string | null; // null 代表『全部』
}
