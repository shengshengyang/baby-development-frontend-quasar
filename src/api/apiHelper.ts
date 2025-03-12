// src/api/apiHelper.ts
import apiClient from './apiClient';

export async function apiPost<T>(url: string, data: Record<string, unknown>): Promise<T> {
  try {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}
