// API 相關配置

// 基本 API URL, 可透過環境變數設定
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiConfig = {
  baseUrl: apiBaseUrl,
  endpoints: {
    milestones: '/open/flash-card',
    // 新增：年齡選項
    ageOptions: 'api/options/ages',
    // 認證相關
    login: '/auth/login',
    // 寶寶相關
    createBaby: '/baby',
    // 疫苗相關
    vaccineSchedules: '/baby/{babyId}/schedules',
    updateVaccineSchedule: '/baby/{babyId}/schedules/{scheduleId}',
    completeVaccineSchedule: '/baby/complete-schedule', // 新增完成疫苗接種的端點
    // 將來可以添加更多 endpoints
  },
};
