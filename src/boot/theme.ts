import { boot } from 'quasar/wrappers';
import { Dark } from 'quasar';

// 根據用戶的主題偏好設置 Quasar 主題
export default boot(() => {
  // 檢查本地存儲中的主題偏好
  const savedDarkMode = localStorage.getItem('darkMode');

  if (savedDarkMode) {
    // 如果有保存的偏好，優先使用
    Dark.set(savedDarkMode === 'true');
  } else {
    // 否則根據系統偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    Dark.set(prefersDark);
    // 保存到本地存儲
    localStorage.setItem('darkMode', prefersDark ? 'true' : 'false');
  }

  // 監聽系統主題變化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // 只有當用戶沒有明確設置偏好時才自動切換
    if (!localStorage.getItem('darkMode')) {
      Dark.set(e.matches);
    }
  });
});
