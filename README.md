# Baby Development Frontend (baby-development)

基於 Quasar Framework 的嬰兒成長記錄前端專案，支援 PWA，提供成長里程碑、疫苗接種、用戶管理等功能。

## 專案簡介
本專案用於記錄與展示嬰兒成長過程中的各類資訊，包括成長里程碑、疫苗接種、用戶資料等。採用 Vue3 + Quasar 框架，支援多語言及漸進式網頁應用（PWA）。

## 技術棧
- [Quasar Framework](https://quasar.dev/) (Vue3)
- TypeScript
- Vuex/Pinia 狀態管理
- Axios 網路請求
- SCSS 樣式
- PWA 支援

## 目錄結構
```
├── public/                # 靜態資源
├── src/
│   ├── api/               # API 請求與服務
│   ├── assets/            # 圖片等靜態資源
│   ├── boot/              # Quasar 啟動檔（如 axios、i18n、主題）
│   ├── components/        # 通用元件
│   ├── css/               # 樣式檔案
│   ├── i18n/              # 國際化設定
│   ├── layouts/           # 頁面佈局
│   ├── pages/             # 業務頁面
│   ├── router/            # 路由設定
│   ├── stores/            # 狀態管理
│   ├── styles/            # 業務樣式
│   ├── types/             # 型別定義
│   └── utils/             # 工具函式
├── src-pwa/               # PWA 設定與 Service Worker
├── quasar.config.ts       # Quasar 設定
├── package.json           # 專案依賴
└── README.md              # 專案說明
```

## 主要功能模組
- 成長里程碑管理（src/pages/MilestonePage.vue）
- 疫苗接種記錄（src/pages/VaccinePage.vue）
- 用戶註冊、登入、資料編輯（src/pages/auth/、ProfileEditPage.vue）
- 首頁、閃卡、錯誤頁等（src/pages/IndexPage.vue、FlashCardPage.vue、ErrorNotFound.vue）
- 狀態管理（src/stores/）
- 國際化（src/i18n/）
- PWA 支援（src-pwa/manifest.json、custom-service-worker.ts）

## 安裝依賴
```bash
yarn
# 或
npm install
```

## 啟動開發環境
```bash
quasar dev
```

## 程式碼檢查與格式化
```bash
yarn lint
# 或
npm run lint

yarn format
# 或
npm run format
```

## 建置生產環境
```bash
quasar build
```

## PWA 設定
- PWA 相關檔案位於 src-pwa/ 目錄。
- manifest.json 設定應用資訊。
- custom-service-worker.ts 可自訂 Service Worker 行為。

## 設定說明
更多 Quasar 設定請參考 [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js)。

## 貢獻
歡迎提交 Issue 或 PR 參與專案改進。

## 聯絡方式
如有問題或建議，請透過 GitHub Issue 聯絡。

---

# Baby Development Frontend (baby-development)

A baby development record frontend project based on Quasar Framework, supporting PWA, providing milestone management, vaccine records, and user management features.

## Project Introduction
This project is for recording and displaying various information about baby development, including milestones, vaccine records, and user profiles. Built with Vue3 + Quasar, supporting multilingual and Progressive Web App (PWA).

## Tech Stack
- [Quasar Framework](https://quasar.dev/) (Vue3)
- TypeScript
- Vuex/Pinia state management
- Axios for HTTP requests
- SCSS styles
- PWA support

## Directory Structure
```
├── public/                # Static resources
├── src/
│   ├── api/               # API requests and services
│   ├── assets/            # Images and static assets
│   ├── boot/              # Quasar boot files (axios, i18n, theme)
│   ├── components/        # Common components
│   ├── css/               # Style files
│   ├── i18n/              # Internationalization
│   ├── layouts/           # Page layouts
│   ├── pages/             # Business pages
│   ├── router/            # Router configuration
│   ├── stores/            # State management
│   ├── styles/            # Business styles
│   ├── types/             # Type definitions
│   └── utils/             # Utility functions
├── src-pwa/               # PWA config and Service Worker
├── quasar.config.ts       # Quasar config
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## Main Features
- Milestone management (src/pages/MilestonePage.vue)
- Vaccine record (src/pages/VaccinePage.vue)
- User registration, login, profile edit (src/pages/auth/, ProfileEditPage.vue)
- Home, flash card, error page (src/pages/IndexPage.vue, FlashCardPage.vue, ErrorNotFound.vue)
- State management (src/stores/)
- Internationalization (src/i18n/)
- PWA support (src-pwa/manifest.json, custom-service-worker.ts)

## Install dependencies
```bash
yarn
# or
npm install
```

## Start development
```bash
quasar dev
```

## Code lint & format
```bash
yarn lint
# or
npm run lint

yarn format
# or
npm run format
```

## Build for production
```bash
quasar build
```

## PWA Configuration
- PWA files are in src-pwa/ directory.
- manifest.json configures app info.
- custom-service-worker.ts for custom Service Worker logic.

## Configuration
For more Quasar config, see [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

## Contribution
Feel free to submit Issue or PR to help improve the project.

## Contact
For questions or suggestions, please use GitHub Issue.
