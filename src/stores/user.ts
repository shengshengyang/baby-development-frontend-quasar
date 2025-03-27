// src/stores/user.ts
import { defineStore } from 'pinia';

export interface Progress {
  babyId: number;
  flashcardId: number;
  ageInMonths: number;
  category: string;
  achieved: boolean;
  dateAchieved: string;
}

export interface Baby {
  name: string;
  birthDate: string;
  progresses: Progress[];
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
      if (!this.userData || !this.userData.babies || this.userData.babies.length === 0) {
        return null;
      }

      // If no baby is selected but babies exist, default to the first one
      if (this.selectedBabyIndex === -1 && this.userData.babies.length > 0) {
        return this.userData.babies[0] as Baby;
      }

      // Return the selected baby if the index is valid
      if (this.selectedBabyIndex >= 0 && this.selectedBabyIndex < this.userData.babies.length) {
        return this.userData.babies[this.selectedBabyIndex] as Baby;
      }

      return null;
    },
  },

  actions: {
    setUser(userData: UserData) {
      this.userData = userData;
      // Initialize selected baby to the first one if available
      if (userData && userData.babies && userData.babies.length > 0) {
        this.selectedBabyIndex = 0;
      }
    },

    selectBaby(index: number) {
      if (
        this.userData &&
        this.userData.babies &&
        index >= 0 &&
        index < this.userData.babies.length
      ) {
        this.selectedBabyIndex = index;
        // Store selection in localStorage for persistence
        localStorage.setItem('selectedBabyIndex', index.toString());
      }
    },

    // Load the previously selected baby from localStorage on app initialization
    initSelectedBaby() {
      const savedIndex = localStorage.getItem('selectedBabyIndex');
      if (savedIndex !== null && this.userData && this.userData.babies) {
        const index = parseInt(savedIndex);
        if (index >= 0 && index < this.userData.babies.length) {
          this.selectedBabyIndex = index;
        }
      }
    },

    logout() {
      this.userData = null;
      this.selectedBabyIndex = -1;
      localStorage.removeItem('selectedBabyIndex');
    },
  },
});
