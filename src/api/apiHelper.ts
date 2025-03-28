// src/api/apiHelper.ts
import apiClient from './apiClient';

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
