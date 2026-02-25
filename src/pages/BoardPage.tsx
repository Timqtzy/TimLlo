import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoard } from '../hooks/useBoard.js';
import { useDragAndDrop } from '../hooks/useDragAndDrop.js';
import { boardsApi } from '../api/boards.js';
import BoardHeader from '../components/board/BoardHeader.js';
import BoardCanvas from '../components/board/BoardCanvas.js';
import BoardBottomBar from '../components/board/BoardBottomBar.js';
import InboxPanel from '../components/board/InboxPanel.js';
import PlannerPanel from '../components/board/PlannerPanel.js';
import CalendarView from '../components/board/CalendarView.js';
import CardDetailModal from '../components/card/CardDetailModal.js';
import ConfirmDialog from '../components/shared/ConfirmDialog.js';
import type { Card } from '../types/index.js';
import type { BoardTab } from '../components/board/BoardBottomBar.js';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const {
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
  } = useBoard(boardId);

  const { onDragEnd } = useDragAndDrop({ lists, cardsByList, reorderLists, moveCards });
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showDeleteBoard, setShowDeleteBoard] = useState(false);
  const [activeTab, setActiveTab] = useState<BoardTab>('board');

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="alert alert-error max-w-md">{error || 'Board not found'}</div>
      </div>
    );
  }

  const selectedCardListName = selectedCard
    ? lists.find((l) => l._id === selectedCard.listId)?.title || ''
    : '';

  const handleDeleteBoard = async () => {
    if (!board) return;
    await boardsApi.remove(board._id);
    navigate('/');
  };

  const showInbox = activeTab === 'inbox';
  const showPlanner = activeTab === 'planner';
  const showCalendar = activeTab === 'calendar';

  const allCards = Object.values(cardsByList).flat();

  return (
    <div className="flex flex-1 relative overflow-hidden">
      {/* Side panels */}
      {showInbox && <InboxPanel />}
      {showPlanner && <PlannerPanel />}

      {/* Board area */}
      <div
        className="flex flex-col flex-1 min-w-0"
        style={!showCalendar ? { background: `linear-gradient(135deg, ${board.background}, ${board.background}88)` } : undefined}
      >
        <BoardHeader
          board={board}
          onUpdate={async (data) => {
            await updateBoard(data);
            // If title changed, the slug may have changed — update URL
            if (data.title) {
              const updated = await boardsApi.getById(board._id);
              if (updated.slug !== boardId) {
                navigate(`/board/${updated.slug}`, { replace: true });
              }
            }
          }}
          onDelete={() => setShowDeleteBoard(true)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {showCalendar ? (
          <CalendarView cards={allCards} lists={lists} onCardClick={setSelectedCard} />
        ) : (
          <BoardCanvas
            lists={lists}
            cardsByList={cardsByList}
            onDragEnd={onDragEnd}
            onAddList={addList}
            onUpdateList={updateList}
            onDeleteList={deleteList}
            onAddCard={addCard}
            onCardClick={setSelectedCard}
          />
        )}
      </div>

      {/* Bottom bar */}
      <BoardBottomBar activeTab={activeTab} onTabChange={setActiveTab} />

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          listName={selectedCardListName}
          onClose={() => setSelectedCard(null)}
          onUpdate={async (data) => {
            const updated = await updateCard(selectedCard._id, selectedCard.listId, data);
            setSelectedCard(updated);
          }}
          onDelete={async () => {
            await deleteCard(selectedCard._id, selectedCard.listId);
            setSelectedCard(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteBoard}
        title="Delete Board"
        message={`Are you sure you want to delete "${board.title}"? All lists and cards will be permanently deleted.`}
        onConfirm={handleDeleteBoard}
        onCancel={() => setShowDeleteBoard(false)}
      />
    </div>
  );
}
