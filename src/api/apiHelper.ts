// src/api/apiHelper.ts
import apiClient from './apiClient';
import { apiConfig } from './config';
import type { VaccineSchedule, VaccineScheduleUpdateData } from 'src/types/vaccine';

// Reordered type parameters to be more intuitive (TResponse first, then TRequest)
export async function apiPost<TResponse = unknown, TRequest = Record<string, unknown>>(
  url: string,
  data: TRequest,
): Promise<TResponse> {
  try {
    const response = await apiClient.post<TResponse>(url, data);
    return response.data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// 獲取疫苗接種時程表
export async function getVaccineSchedules(babyId: string | number): Promise<VaccineSchedule[]> {
  console.log('Fetching vaccine schedules for babyId:', babyId);
  try {
    const url = apiConfig.endpoints.vaccineSchedules.replace('{babyId}', String(babyId));
    const response = await apiClient.get<VaccineSchedule[]>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching vaccine schedules:', error);
    throw error;
  }
}

// 更新疫苗接種記錄
export async function updateVaccineSchedule(
  babyId: string | number,
  scheduleId: number,
  data: VaccineScheduleUpdateData,
): Promise<VaccineSchedule> {
  try {
    const url = apiConfig.endpoints.updateVaccineSchedule
      .replace('{babyId}', String(babyId))
      .replace('{scheduleId}', String(scheduleId));
    const response = await apiClient.put<VaccineSchedule>(url, data);
    return response.data;
  } catch (error) {
    console.error('Error updating vaccine schedule:', error);
    throw error;
  }
}

// 完成疫苗接種記錄
export async function completeVaccineSchedule(
  scheduleId: number,
  actualDate: string,
  note?: string,
): Promise<VaccineSchedule> {
  try {
    const url = apiConfig.endpoints.completeVaccineSchedule;
    const data = {
      scheduleId,
      actualDate,
      ...(note ? { note } : {}),
    };
    const response = await apiClient.post<VaccineSchedule>(url, data);
    return response.data;
  } catch (error) {
    console.error('Error completing vaccine schedule:', error);
    throw error;
  }
}
