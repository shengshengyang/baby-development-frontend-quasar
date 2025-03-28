// API 相關配置

// 基本 API URL, 可透過環境變數設定
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiConfig = {
  baseUrl: apiBaseUrl,
  endpoints: {
    milestones: '/open/flash-card',
    // 認證相關
    login: '/auth/login',
    // 寶寶相關
    createBaby: '/baby',
    // 將來可以添加更多 endpoints
  },
};
