import type { List } from '../types/index.js';
import { api } from './client.js';

export const listsApi = {
  getByBoard: (boardId: string) => api.get<List[]>(`/boards/${boardId}/lists`),
  create: (boardId: string, data: { title: string }) =>
    api.post<List>(`/boards/${boardId}/lists`, data),
  update: (id: string, data: { title: string }) => api.put<List>(`/lists/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/lists/${id}`),
  reorder: (data: { listIds: string[] }) =>
    api.put<{ message: string }>('/list-reorder', data),
};
