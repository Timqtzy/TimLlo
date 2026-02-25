import { useState, useEffect, useCallback } from 'react';
import type { Board } from '../types/index.js';
import { boardsApi } from '../api/boards.js';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    boardsApi
      .getAll()
      .then(setBoards)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const createBoard = useCallback(async (data: { title: string; background?: string }) => {
    const board = await boardsApi.create(data);
    setBoards((prev) => [board, ...prev]);
    return board;
  }, []);

  const deleteBoard = useCallback(async (id: string) => {
    await boardsApi.remove(id);
    setBoards((prev) => prev.filter((b) => b._id !== id));
  }, []);

  return { boards, loading, error, createBoard, deleteBoard };
}
