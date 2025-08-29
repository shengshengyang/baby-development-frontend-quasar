import type { ProgressStatus } from '../api/services/progressService';

export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

// Progress 進度記錄接口
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

// Baby 寶寶接口
export interface Baby {
  id: string;
  name: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  progresses: Progress[];
  createdAt: string;
  updatedAt: string;
}

// Milestone 里程碑接口
export interface Milestone {
  id: string;
  title: string;
  description: string;
  ageInMonths: number;
  category: string;
  flashcardId?: string;
}
