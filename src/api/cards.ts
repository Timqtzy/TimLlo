import type { Card } from '../types/index.js';
import { api } from './client.js';

export const cardsApi = {
  getByBoard: (boardId: string) => api.get<Card[]>(`/boards/${boardId}/cards`),
  getById: (id: string) => api.get<Card>(`/cards/${id}`),
  create: (listId: string, data: { title: string }) =>
    api.post<Card>(`/lists/${listId}/cards`, data),
  update: (id: string, data: Partial<Card>) => api.put<Card>(`/cards/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/cards/${id}`),
  reorder: (data: {
    sourceListId: string;
    destListId: string;
    sourceCardIds: string[];
    destCardIds: string[];
  }) => api.put<{ message: string }>('/card-reorder', data),
};
