// 疫苗相關類型定義

export interface Vaccine {
  id: number;
  name: string;
  recommendedAgeStart: number;
  doseIntervalsJson: string;
  description: string;
}

export interface VaccineSchedule {
  id: number;
  vaccine: Vaccine;
  doseNumber: number;
  scheduledDate: string;
  actualDate: string | null;
  status: string; // "SCHEDULED", "COMPLETED", etc.
  rescheduledDate: string | null;
  reminderDate: string | null;
  note: string;
}

export interface VaccineScheduleUpdateData {
  actualDate: string;
  status: string;
  note?: string;
}

export type VaccineStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED';
