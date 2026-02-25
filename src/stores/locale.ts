// src/stores/locale.ts
import { defineStore } from 'pinia';
import { i18n } from 'boot/i18n';

export type LocaleCode = 'zh-TW' | 'en-US';

export interface LocaleOption {
  label: string;
  value: LocaleCode;
}

export const availableLocales: LocaleOption[] = [
  { label: '中文', value: 'zh-TW' },
  { label: 'English', value: 'en-US' },
];

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    currentLocale: 'zh-TW' as LocaleCode,
  }),

  getters: {
    localeOptions(): LocaleOption[] {
      return availableLocales;
    },
    currentLocaleOption(): LocaleOption {
      return availableLocales.find(l => l.value === this.currentLocale) || availableLocales[0]!;
    },
  },

  actions: {
    setLocale(locale: LocaleCode) {
      this.currentLocale = locale;
      localStorage.setItem('locale', locale);
      // Sync with i18n
      if (i18n.mode === 'legacy') {
        i18n.global.locale = locale;
      } else {
        (i18n.global.locale as unknown as { value: string }).value = locale;
      }
    },

    initLocale() {
      const savedLocale = localStorage.getItem('locale') as LocaleCode | null;
      if (savedLocale && availableLocales.some(l => l.value === savedLocale)) {
        this.currentLocale = savedLocale;
        // Sync with i18n
        if (i18n.mode === 'legacy') {
          i18n.global.locale = savedLocale;
        } else {
          (i18n.global.locale as unknown as { value: string }).value = savedLocale;
        }
      }
    },

    toggleLocale() {
      const newLocale = this.currentLocale === 'zh-TW' ? 'en-US' : 'zh-TW';
      this.setLocale(newLocale);
    },
  },
});
