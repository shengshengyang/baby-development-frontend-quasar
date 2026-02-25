export default {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',
    loading: 'Loading...',
    all: 'All',
    viewAll: 'View All',
    noData: 'No Data',
  },

  // Navigation
  nav: {
    home: 'Home',
    milestone: 'Milestone',
    flashcard: 'Flashcard',
    vaccine: 'Vaccine',
    profile: 'Profile',
    login: 'Login',
    logout: 'Logout',
  },

  // Locale Switch
  locale: {
    switchToEn: 'Switch to English',
    switchToZh: 'Switch to Chinese',
  },

  // Theme Switch
  theme: {
    switchToLight: 'Switch to Light Mode',
    switchToDark: 'Switch to Dark Mode',
  },

  // Login Page
  login: {
    title: 'Login',
    email: 'Email',
    password: 'Password',
    loginBtn: 'Login',
    forgotPassword: 'Forgot Password',
    register: 'Register',
    loginFailed: 'Login failed, please check your credentials',
  },

  // Register Page
  register: {
    title: 'Register',
    password: 'Password',
    sendCode: 'Send Code',
    hasAccount: 'Already have an account?',
    login: 'Login',
  },

  // Verify Page
  verify: {
    title: 'Verify Your Email',
    code: 'Verification Code',
    confirmBtn: 'Confirm Code',
  },

  // Profile Page
  profile: {
    name: 'Name',
    email: 'Email',
    noName: 'No name provided',
    noEmail: 'No email provided',
    role: 'Role',
    noRole: 'None',
    babyInfo: 'Baby Information',
    birthDate: 'Birth Date: ',
    defaultBaby: 'Default Baby',
    noBaby: 'No baby added yet',
    addBaby: 'Add Baby',
  },

  // Add Baby Page
  addBaby: {
    title: 'Add Baby',
    name: 'Baby Name',
    birthDate: 'Birth Date',
    pleaseFillAll: 'Please fill in all information',
    addSuccess: 'Baby added successfully',
    addFailed: 'Failed to add baby',
  },

  // Baby Selector
  babySelector: {
    title: 'Select Baby',
    addBaby: 'Add Baby',
    close: 'Close',
    days: '{days} days',
    months: '{months} months',
    yearsMonths: '{years} years {months} months',
    years: '{years} years',
  },

  // Home/Intro Page
  home: {
    welcome: 'Welcome to GOAT Baby',
    description: 'Track your baby\'s milestones, vaccine schedules, and practice flashcards for a more reassuring and fun parenting experience.',
    milestone: {
      title: 'Growth Milestones',
      description: 'Understand developmental highlights at each stage and track progress',
      goBtn: 'Go',
    },
    flashcard: {
      title: 'Practice Flashcards',
      description: 'Learn and interact with Q&A flashcards',
    },
    vaccine: {
      title: 'Vaccine Schedule',
      description: 'Keep track of vaccination schedules to protect health',
    },
    startBtn: 'Get Started',
    pwa: {
      title: 'Install to Home Screen for Better Experience',
      description: 'Quick access even offline, faster loading',
      installBtn: 'Install to Home Screen',
      installed: 'Already installed. Open directly from your home screen.',
      iphoneGuide: 'iPhone: Tap the "Share" button in Safari, then select "Add to Home Screen".',
      promptTitle: 'Install GOAT Baby to Home Screen?',
      promptDesc: 'Faster launch, fullscreen experience, and offline use',
      later: 'Later',
      install: 'Install',
    },
  },

  // Milestone Page
  milestone: {
    title: 'Baby Development Milestones',
    subtitle: 'Track your baby\'s growth and developmental stages',
    ageFilter: 'Age Filter',
    completed: 'Completed',
    noData: 'No milestones found for this category and age range',
    updatingProgress: 'Updating progress...',
    updateStatusTitle: 'Update Progress Status',
    detailTitle: 'Milestone',
    noImage: 'No image',
    noVideo: 'No video',
    description: 'Description',
    relatedFlashcards: 'Related FlashCards',
    statusHint: '(Login to toggle status)',
    noFlashcards: 'No related FlashCards',
    loadFailed: 'Failed to load milestone data',
    syncProgressFailed: 'Failed to sync baby progress',
    pleaseLogin: 'Please login and select a baby',
    statusUpdated: 'Milestone status updated to: {status}',
    updateFailed: 'Failed to update milestone status',
    flashcardStatusFailed: 'Failed to update FlashCard status',
  },

  // Flashcard Page
  flashcard: {
    title: 'Learning Flashcards',
    subtitle: 'Learn baby development knowledge through interactive cards',
    ageFilter: 'Age Filter',
    ageInMonths: '{months} months',
    startedAt: 'Started: ',
    achievedAt: 'Achieved: ',
    detailTitle: 'Details',
    noData: 'No flashcards found for this category and age range',
    updatingProgress: 'Updating progress...',
    updateStatusTitle: 'Update Progress Status',
    loadFailed: 'Failed to load flashcards',
    syncProgressFailed: 'Failed to sync baby progress',
    pleaseLogin: 'Please login and select a baby',
    statusUpdated: 'Flashcard status updated to: {status}',
    updateFailed: 'Failed to update flashcard status',
  },

  // Progress Status
  progress: {
    notStarted: 'Not Started',
    inProgress: 'In Progress',
    completed: 'Completed',
  },

  // Vaccine Page
  vaccine: {
    title: 'Baby Vaccination',
    subtitle: 'Track your baby\'s vaccination schedule',
    schedule: 'Schedule',
    list: 'List',
    loading: 'Loading vaccine data...',
    loadFailed: 'Failed to load vaccine data, please try again',
    reload: 'Reload',
    progress: 'Vaccination Progress',
    recordDose: 'Record Dose {n}',
    dose: 'Dose {n}',
    expected: 'Expected: ',
    actual: 'Actual: ',
    record: 'Record',
    recordTitle: 'Record Vaccination',
    vaccinationDate: 'Vaccination Date',
    notes: 'Notes',
    status: {
      completed: 'Completed',
      pending: 'Pending',
      missed: 'Missed',
      unknown: 'Unknown',
    },
    ageGroup: {
      birth: 'Birth',
      months: '{n} months',
      years: '{n} years',
    },
  },

  // App Title
  app: {
    title: 'GOAT Baby',
    subtitle: 'Baby Development Tracker',
  },
};
