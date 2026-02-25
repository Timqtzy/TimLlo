import type { BoardMember, User } from '../types/index.js';
import { api } from './client.js';

export const boardMembersApi = {
  getMembers: (boardId: string) =>
    api.get<{ owner: User; members: BoardMember[] }>(`/boards/${boardId}/members`),

  invite: (boardId: string, data: { email: string; role?: 'admin' | 'member' }) =>
    api.post<BoardMember>(`/boards/${boardId}/members`, data),

  updateRole: (boardId: string, memberId: string, data: { role: 'admin' | 'member' }) =>
    api.put<BoardMember>(`/boards/${boardId}/members/${memberId}`, data),

  remove: (boardId: string, memberId: string) =>
    api.delete<{ message: string }>(`/boards/${boardId}/members/${memberId}`),
};
