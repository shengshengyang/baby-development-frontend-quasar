// src/stores/user.ts
import { defineStore } from 'pinia';
import type { ProgressStatus } from 'src/api/services/progressService';

export interface Progress {
  id: string;
  babyId: string;
  status: ProgressStatus;
  flashcardId?: string;
  milestoneId?: string;
  videoId?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Baby {
  id: string;
  name: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  progresses: Progress[];
  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  username: string;
  email: string;
  role: string[];
  token: string;
  babies: Baby[];
}

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userData: null as UserData | null,
    selectedBabyIndex: -1, // Track the index of the selected baby
  }),

  getters: {
    isLoggedIn(): boolean {
      return !!this.userData;
    },

    // Get the currently selected baby
    selectedBaby(): Baby | null {
      const babies = this.userData?.babies ?? [];
      if (babies.length === 0) {
        return null;
      }

      // If no baby is selected but babies exist, default to the first one
      if (this.selectedBabyIndex === -1) {
        return babies[0] as Baby;
      }

      // Return the selected baby if the index is valid
      if (this.selectedBabyIndex >= 0 && this.selectedBabyIndex < babies.length) {
        return babies[this.selectedBabyIndex] as Baby;
      }

      return null;
    },
  },

  actions: {
    setUser(userData: UserData) {
      this.userData = userData;
      // Initialize selected baby to the first one if available
      if (userData?.babies?.length) {
        this.selectedBabyIndex = 0;
      }
    },

    selectBaby(index: number) {
      const babies = this.userData?.babies;
      if (babies && index >= 0 && index < babies.length) {
        this.selectedBabyIndex = index;
        // Store selection in localStorage for persistence
        localStorage.setItem('selectedBabyIndex', index.toString());
      }
    },

    // Load the previously selected baby from localStorage on app initialization
    initSelectedBaby() {
      const savedIndex = localStorage.getItem('selectedBabyIndex');
      const babies = this.userData?.babies;
      if (savedIndex !== null && babies) {
        const index = parseInt(savedIndex);
        if (index >= 0 && index < babies.length) {
          this.selectedBabyIndex = index;
        }
      }
    },

    logout() {
      this.userData = null;
      this.selectedBabyIndex = -1;
      localStorage.removeItem('selectedBabyIndex');
    },

    // 新增更新選定寶寶的方法
    updateSelectedBaby(babyData: Baby): void {
      if (this.selectedBaby?.id === babyData.id) {
        const babies = this.userData?.babies;
        if (babies) {
          const index = babies.findIndex((baby) => baby.id === babyData.id);
          if (index !== -1) {
            babies[index] = babyData;
          }
        }
      }
    },
  },
});
