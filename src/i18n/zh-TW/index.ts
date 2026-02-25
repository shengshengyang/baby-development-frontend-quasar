export default {
  // 通用
  common: {
    save: '儲存',
    cancel: '取消',
    close: '關閉',
    confirm: '確認',
    delete: '刪除',
    edit: '編輯',
    add: '新增',
    back: '返回',
    loading: '載入中...',
    all: '全部',
    viewAll: '查看全部',
    noData: '無資料',
  },

  // 導航
  nav: {
    home: '首頁',
    milestone: '里程碑',
    flashcard: '小卡',
    vaccine: '疫苗',
    profile: '個人資料',
    login: '登入',
    logout: '登出',
  },

  // 語言切換
  locale: {
    switchToEn: '切換到英文',
    switchToZh: '切換到中文',
  },

  // 主題切換
  theme: {
    switchToLight: '切換到日間模式',
    switchToDark: '切換到夜間模式',
  },

  // 登入頁面
  login: {
    title: '會員登入',
    email: '電子信箱',
    password: '密碼',
    loginBtn: '登入',
    forgotPassword: '忘記密碼',
    register: '註冊',
    loginFailed: '登入失敗，請確認帳號或密碼',
  },

  // 註冊頁面
  register: {
    title: '註冊',
    password: '密碼',
    sendCode: '發送驗證碼',
    hasAccount: '已有帳號？',
    login: '登入',
  },

  // 驗證頁面
  verify: {
    title: '驗證您的信箱',
    code: '驗證碼',
    confirmBtn: '確認驗證碼',
  },

  // 個人資料頁面
  profile: {
    name: '姓名',
    email: '電子信箱',
    noName: '未提供姓名',
    noEmail: '未提供電子信箱',
    role: '角色',
    noRole: '無',
    babyInfo: '寶寶資訊',
    birthDate: '出生日期：',
    defaultBaby: '預設寶寶',
    noBaby: '尚未新增任何寶寶',
    addBaby: '新增寶寶',
  },

  // 新增寶寶頁面
  addBaby: {
    title: '新增寶寶',
    name: '寶寶姓名',
    birthDate: '出生日期',
    pleaseFillAll: '請輸入完整資訊',
    addSuccess: '新增寶寶成功',
    addFailed: '新增寶寶失敗',
  },

  // 寶寶選擇器
  babySelector: {
    title: '選擇寶寶',
    addBaby: '新增寶寶',
    close: '關閉',
    days: '{days} 天',
    months: '{months} 個月',
    yearsMonths: '{years} 歲 {months} 個月',
    years: '{years} 歲',
  },

  // 首頁/介紹頁
  home: {
    welcome: '歡迎使用 GOAT Baby',
    description: '追蹤寶寶的成長里程碑、疫苗時程與練習小卡，讓育兒更安心、更有趣。',
    milestone: {
      title: '成長里程碑',
      description: '了解每個階段的發展重點，並標記完成狀態',
      goBtn: '前往',
    },
    flashcard: {
      title: '練習小卡',
      description: '以問答小卡陪伴學習與互動',
    },
    vaccine: {
      title: '疫苗時程',
      description: '掌握接種時程，守護健康',
    },
    startBtn: '開始使用',
    pwa: {
      title: '安裝到主畫面，體驗更流暢',
      description: '離線也能快速開啟，節省載入時間',
      installBtn: '安裝到主畫面',
      installed: '已安裝到主畫面，可直接從桌面開啟。',
      iphoneGuide: 'iPhone：請點擊 Safari 底部「分享」按鈕，選擇「加入主畫面」完成安裝。',
      promptTitle: '安裝 GOAT Baby 到主畫面？',
      promptDesc: '更快啟動、全螢幕體驗與離線使用',
      later: '稍後',
      install: '安裝',
    },
  },

  // 里程碑頁面
  milestone: {
    title: '寶寶發展里程碑',
    subtitle: '追蹤您寶寶的成長與發展階段',
    ageFilter: '年齡篩選',
    completed: '已完成',
    noData: '沒有找到符合此分類與年齡階段的里程碑',
    updatingProgress: '更新進度中...',
    updateStatusTitle: '更新進度狀態',
    detailTitle: '里程碑',
    noImage: '無圖片',
    noVideo: '無影片',
    description: '描述',
    relatedFlashcards: '相關 FlashCards',
    statusHint: '（登入可點擊狀態按鈕切換）',
    noFlashcards: '無相關 FlashCards',
    loadFailed: '載入里程碑資料時發生錯誤',
    syncProgressFailed: '同步寶寶進度失敗',
    pleaseLogin: '請先登入並選擇寶寶',
    statusUpdated: '里程碑狀態已更新為：{status}',
    updateFailed: '更新里程碑狀態時發生錯誤',
    flashcardStatusFailed: '更新 FlashCard 狀態失敗',
  },

  // 閃卡頁面
  flashcard: {
    title: '學習閃卡',
    subtitle: '透過互動卡片學習寶寶發展知識',
    ageFilter: '年齡篩選',
    ageInMonths: '{months}個月',
    startedAt: '開始於：',
    achievedAt: '達成於：',
    detailTitle: '詳細資訊',
    noData: '沒有找到符合此分類與年齡階段的學習卡片',
    updatingProgress: '更新進度中...',
    updateStatusTitle: '更新進度狀態',
    loadFailed: '載入學習卡片失敗',
    syncProgressFailed: '同步寶寶進度失敗',
    pleaseLogin: '請先登入並選擇寶寶',
    statusUpdated: '學習卡片狀態已更新為：{status}',
    updateFailed: '更新學習卡片狀態時發生錯誤',
  },

  // 進度狀態
  progress: {
    notStarted: '未開始',
    inProgress: '已開始',
    completed: '已完成',
  },

  // 疫苗頁面
  vaccine: {
    title: '寶寶預防接種',
    subtitle: '追蹤您寶寶的疫苗接種時程',
    schedule: '日程表',
    list: '列表',
    loading: '載入疫苗資料中...',
    loadFailed: '無法載入疫苗資料，請稍後再試',
    reload: '重新載入',
    progress: '接種進度',
    recordDose: '記錄第{n}劑',
    dose: '第{n}劑',
    expected: '預計：',
    actual: '實際：',
    record: '記錄',
    recordTitle: '記錄疫苗接種',
    vaccinationDate: '接種日期',
    notes: '備註',
    status: {
      completed: '已完成',
      pending: '待接種',
      missed: '已錯過',
      unknown: '未知狀態',
    },
    ageGroup: {
      birth: '出生',
      months: '{n}個月',
      years: '{n}歲',
    },
  },

  // 應用標題
  app: {
    title: 'GOAT Baby',
    subtitle: '寶寶發展追蹤',
  },
};
