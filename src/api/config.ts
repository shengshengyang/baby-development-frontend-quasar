// API 相關配置

// 基本 API URL, 可透過環境變數設定
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://deanyang.it.com';

export const apiConfig = {
  baseUrl: apiBaseUrl,
  endpoints: {
    milestones: '/api/milestone',
    // 新增：flashcard 相關
    flashcard: '/api/flashcard',
    // 新增：年齡選項
    ageOptions: '/api/options/ages',
    // 新增：分類選項
    categoryOptions: '/api/options/categories',
    // 認證相關
    login: '/auth/login',
    // 寶寶相關
    createBaby: '/baby',
    // 進度相關
    progressByBaby: '/api/progress/baby/{babyId}',
    // 疫苗相關
    vaccineSchedules: '/baby/{babyId}/schedules',
    updateVaccineSchedule: '/baby/{babyId}/schedules/{scheduleId}',
    completeVaccineSchedule: '/baby/complete-schedule', // 新增完成疫苗接種的端點
    // 將來可以添加更多 endpoints
  },
};
