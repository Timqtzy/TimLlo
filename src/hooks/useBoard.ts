import { useState, useEffect, useCallback } from 'react';
import type { Board, List, Card } from '../types/index.js';
import { boardsApi } from '../api/boards.js';
import { listsApi } from '../api/lists.js';
import { cardsApi } from '../api/cards.js';

function groupCardsByList(cards: Card[]): Record<string, Card[]> {
  const grouped: Record<string, Card[]> = {};
  for (const card of cards) {
    if (!grouped[card.listId]) grouped[card.listId] = [];
    grouped[card.listId].push(card);
  }
  // Sort each group by position
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.position - b.position);
  }
  return grouped;
}

export function useBoard(idOrSlug: string | undefined) {
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cardsByList, setCardsByList] = useState<Record<string, Card[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) return;
    setLoading(true);
    // First fetch the board to get the real _id, then fetch lists/cards by _id
    boardsApi.getById(idOrSlug)
      .then((boardData) => {
        setBoard(boardData);
        return Promise.all([
          listsApi.getByBoard(boardData._id),
          cardsApi.getByBoard(boardData._id),
        ]).then(([listsData, cardsData]) => {
          setLists(listsData.sort((a, b) => a.position - b.position));
          setCardsByList(groupCardsByList(cardsData));
          setError(null);
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  const updateBoard = useCallback(
    async (data: Partial<Pick<Board, 'title' | 'background'>>) => {
      if (!board) return;
      const updated = await boardsApi.update(board._id, data);
      setBoard(updated);
    },
    [board],
  );

  const addList = useCallback(
    async (title: string) => {
      if (!board) return;
      const list = await listsApi.create(board._id, { title });
      setLists((prev) => [...prev, list]);
    },
    [board],
  );

  const updateList = useCallback(async (listId: string, title: string) => {
    const updated = await listsApi.update(listId, { title });
    setLists((prev) => prev.map((l) => (l._id === listId ? updated : l)));
  }, []);

  const deleteList = useCallback(async (listId: string) => {
    await listsApi.remove(listId);
    setLists((prev) => prev.filter((l) => l._id !== listId));
    setCardsByList((prev) => {
      const next = { ...prev };
      delete next[listId];
      return next;
    });
  }, []);

  const reorderLists = useCallback(
    async (newLists: List[]) => {
      const previousLists = lists;
      setLists(newLists);
      try {
        await listsApi.reorder({ listIds: newLists.map((l) => l._id) });
      } catch {
        setLists(previousLists);
      }
    },
    [lists],
  );

  const addCard = useCallback(async (listId: string, title: string) => {
    const card = await cardsApi.create(listId, { title });
    setCardsByList((prev) => ({
      ...prev,
      [listId]: [...(prev[listId] || []), card],
    }));
  }, []);

  const updateCard = useCallback(async (cardId: string, listId: string, data: Partial<Card>): Promise<Card> => {
    const updated = await cardsApi.update(cardId, data);
    setCardsByList((prev) => ({
      ...prev,
      [listId]: (prev[listId] || []).map((c) => (c._id === cardId ? updated : c)),
    }));
    return updated;
  }, []);

  const deleteCard = useCallback(async (cardId: string, listId: string) => {
    await cardsApi.remove(cardId);
    setCardsByList((prev) => ({
      ...prev,
      [listId]: (prev[listId] || []).filter((c) => c._id !== cardId),
    }));
  }, []);

  const moveCards = useCallback(
    async (
      sourceListId: string,
      destListId: string,
      newSourceCards: Card[],
      newDestCards: Card[],
    ) => {
      const prevCards = { ...cardsByList };

      // Optimistic update
      const updated: Record<string, Card[]> = { ...cardsByList };
      if (sourceListId === destListId) {
        updated[destListId] = newDestCards;
      } else {
        updated[sourceListId] = newSourceCards;
        updated[destListId] = newDestCards.map((c) =>
          c.listId !== destListId ? { ...c, listId: destListId } : c,
        );
      }
      setCardsByList(updated);

      try {
        await cardsApi.reorder({
          sourceListId,
          destListId,
          sourceCardIds: newSourceCards.map((c) => c._id),
          destCardIds: newDestCards.map((c) => c._id),
        });
      } catch {
        setCardsByList(prevCards);
      }
    },
    [cardsByList],
  );

  return {
    board,
    lists,
    cardsByList,
    loading,
    error,
    updateBoard,
    addList,
    updateList,
    deleteList,
    reorderLists,
    addCard,
    updateCard,
    deleteCard,
    moveCards,
  };
}
