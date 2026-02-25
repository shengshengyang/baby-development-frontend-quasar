// src/api/apiClient.ts
import axios from 'axios';
import { useUserStore } from 'src/stores/user';
import { useLocaleStore } from 'src/stores/locale';
import { apiConfig } from './config';

const apiClient = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: 10000,
});

// 請求攔截器，每次請求前自動加上 Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const localeStore = useLocaleStore();
    console.log(userStore.userData);

    // 設定 Accept-Language header
    config.headers.set('Accept-Language', localeStore.currentLocale);

    if (userStore.userData && userStore.userData.token) {
      config.headers.set('Content-Type', 'application/json');
      config.headers.set('Authorization', `Bearer ${userStore.userData.token}`);
    }
    return config;
  },
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

export default apiClient;
