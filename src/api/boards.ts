import type { Board } from '../types/index.js';
import { api } from './client.js';

export const boardsApi = {
  getAll: () => api.get<Board[]>('/boards'),
  getById: (id: string) => api.get<Board>(`/boards/${id}`),
  create: (data: { title: string; background?: string }) => api.post<Board>('/boards', data),
  update: (id: string, data: Partial<Pick<Board, 'title' | 'background'>>) =>
    api.put<Board>(`/boards/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/boards/${id}`),
};
