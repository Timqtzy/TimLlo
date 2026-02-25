import { useState } from 'react';
import { useBoards } from '../hooks/useBoards.js';
import BoardCard from '../components/boards/BoardCard.js';
import CreateBoardModal from '../components/boards/CreateBoardModal.js';

export default function HomePage() {
  const { boards, loading, error, createBoard } = useBoards();
  const [showModal, setShowModal] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const ownedBoards = boards.filter((b) => !b.role || b.role === 'owner');
  const sharedBoards = boards.filter((b) => b.role && b.role !== 'owner');

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* YOUR BOARDS section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-4">
            Your Boards
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ownedBoards.map((board) => (
              <BoardCard key={board._id} board={board} />
            ))}
            {/* Create new board tile */}
            <button
              className="rounded-lg overflow-hidden bg-base-300 hover:bg-base-content/20 transition-colors cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              <div className="h-24 w-full bg-base-content/5 flex items-center justify-center" />
              <div className="p-3">
                <span className="text-sm text-base-content/50">Create new board</span>
              </div>
            </button>
          </div>
        </div>

        {/* SHARED WITH YOU section */}
        {sharedBoards.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-4">
              Shared with you
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sharedBoards.map((board) => (
                <BoardCard key={board._id} board={board} />
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateBoardModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={createBoard}
      />
    </div>
  );
}
