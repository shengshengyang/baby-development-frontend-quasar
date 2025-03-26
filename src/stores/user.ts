// src/stores/user.ts
import { defineStore } from 'pinia'

export interface Progress {
  babyId: number
  flashcardId: number
  ageInMonths: number
  category: string
  achieved: boolean
  dateAchieved: string
}

export interface Baby {
  name: string
  birthDate: string
  progresses: Progress[]
}

export interface UserData {
  username: string
  email: string
  role: string[]
  token: string
  babies: Baby[]
}

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userData: null as UserData | null
  }),
  actions: {
    setUser(data: UserData) {
      this.userData = data
      this.isLoggedIn = true
    },
    logout() {
      this.userData = null
      this.isLoggedIn = false
    }
  }
})
