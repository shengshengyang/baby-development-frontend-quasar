import { apiPost } from '../apiHelper';

// Progress Status 枚舉，對應後端的三種狀態
export enum ProgressStatus {
  NOT_STARTED = 'NOT_STARTED',  // 未開始
  IN_PROGRESS = 'IN_PROGRESS',  // 已開始
  COMPLETED = 'COMPLETED'       // 已完成
}

// Progress Status 顯示名稱對應
export const ProgressStatusDisplayNames = {
  [ProgressStatus.NOT_STARTED]: '未開始',
  [ProgressStatus.IN_PROGRESS]: '已開始',
  [ProgressStatus.COMPLETED]: '已完成'
} as const;

// Progress 更新請求體接口
export interface UpdateProgressRequest extends Record<string, unknown> {
  babyId: string;
  status: ProgressStatus;
  flashcardId?: string;
  milestoneId?: string;
  videoId?: string;
  date: string;
}

// Progress 更新響應接口
export interface UpdateProgressResponse {
  id: string;
  babyId: string;
  status: ProgressStatus;
  flashcardId?: string;
  milestoneId?: string;
  videoId?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 更新進度狀態
 * @param request 進度更新請求數據
 * @returns 更新後的進度數據
 */
export async function updateProgressStatus(request: UpdateProgressRequest): Promise<UpdateProgressResponse> {
  return await apiPost<UpdateProgressResponse>('/api/progress/update-status', request);
}

/**
 * 獲取進度狀態的顯示名稱
 * @param status 進度狀態
 * @returns 顯示名稱
 */
export function getProgressStatusDisplayName(status: ProgressStatus): string {
  return ProgressStatusDisplayNames[status];
}

/**
 * 檢查狀態是否為已完成
 * @param status 進度狀態
 * @returns 是否已完成
 */
export function isProgressCompleted(status: ProgressStatus): boolean {
  return status === ProgressStatus.COMPLETED;
}

/**
 * 檢查狀態是否為進行中
 * @param status 進度狀態
 * @returns 是否進行中
 */
export function isProgressInProgress(status: ProgressStatus): boolean {
  return status === ProgressStatus.IN_PROGRESS;
}

/**
 * 檢查狀態是否為未開始
 * @param status 進度狀態
 * @returns 是否未開始
 */
export function isProgressNotStarted(status: ProgressStatus): boolean {
  return status === ProgressStatus.NOT_STARTED;
}
