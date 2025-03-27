// src/api/apiClient.ts
import axios from 'axios';
import { useUserStore } from 'src/stores/user'
import type { AxiosRequestHeaders } from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

// 請求攔截器，每次請求前自動加上 Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    console.log(userStore.userData)
    if (userStore.userData && userStore.userData.token) {
      config.headers = {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
        // 如果 token 存在則加入 Authorization，否則為 undefined
        Authorization: userStore.userData.token ? `Bearer ${userStore.userData.token}` : undefined,
      } as AxiosRequestHeaders
    }
    return config
  },
  (error) =>  Promise.reject(
    error instanceof Error ? error : new Error(String(error))
  )
)

export default apiClient;
