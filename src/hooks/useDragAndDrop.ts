import { useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { List, Card } from '../types/index.js';

interface UseDragAndDropParams {
  lists: List[];
  cardsByList: Record<string, Card[]>;
  reorderLists: (newLists: List[]) => Promise<void>;
  moveCards: (
    sourceListId: string,
    destListId: string,
    newSourceCards: Card[],
    newDestCards: Card[],
  ) => Promise<void>;
}

export function useDragAndDrop({
  lists,
  cardsByList,
  reorderLists,
  moveCards,
}: UseDragAndDropParams) {
  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, type } = result;
      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index)
        return;

      if (type === 'LIST') {
        const reordered = Array.from(lists);
        const [removed] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, removed);
        reorderLists(reordered);
        return;
      }

      if (type === 'CARD') {
        const sourceListId = source.droppableId;
        const destListId = destination.droppableId;
        const sourceCards = Array.from(cardsByList[sourceListId] || []);

        if (sourceListId === destListId) {
          const [moved] = sourceCards.splice(source.index, 1);
          sourceCards.splice(destination.index, 0, moved);
          moveCards(sourceListId, destListId, sourceCards, sourceCards);
        } else {
          const destCards = Array.from(cardsByList[destListId] || []);
          const [moved] = sourceCards.splice(source.index, 1);
          destCards.splice(destination.index, 0, moved);
          moveCards(sourceListId, destListId, sourceCards, destCards);
        }
      }
    },
    [lists, cardsByList, reorderLists, moveCards],
  );

  return { onDragEnd };
}
