export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Board {
  _id: string;
  title: string;
  slug: string;
  background: string;
  userId?: string;
  role?: 'owner' | 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  _id: string;
  boardId: string;
  userId: User;
  role: 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  title: string;
  boardId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  _id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  _id: string;
  text: string;
  createdAt: string;
}

export interface Card {
  _id: string;
  title: string;
  description: string;
  listId: string;
  boardId: string;
  position: number;
  labels: string[];
  dueDate: string | null;
  checklist: ChecklistItem[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}
