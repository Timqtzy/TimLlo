import { useState } from 'react';
import type { Board } from '../../types/index.js';
import type { BoardTab } from './BoardBottomBar.js';
import ShareBoardModal from './ShareBoardModal.js';

const BG_COLORS = [
  '#0079BF', '#D29034', '#519839', '#B04632',
  '#89609E', '#CD5A91', '#4BBF6B', '#00AECC',
  '#838C91', '#1D2125', '#5243AA', '#026AA7',
];

interface BoardHeaderProps {
  board: Board;
  onUpdate: (data: Partial<Pick<Board, 'title' | 'background'>>) => Promise<void>;
  onDelete: () => void;
  activeTab: BoardTab;
  onTabChange: (tab: BoardTab) => void;
}

export default function BoardHeader({ board, onUpdate, onDelete, activeTab, onTabChange }: BoardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [showShare, setShowShare] = useState(false);

  const canEdit = board.role === 'owner' || board.role === 'admin';
  const isOwner = board.role === 'owner';

  const handleSave = () => {
    setIsEditing(false);
    if (title.trim() && title.trim() !== board.title) {
      onUpdate({ title: title.trim() });
    } else {
      setTitle(board.title);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-black/30">
      {/* Left: Title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isEditing && canEdit ? (
          <input
            className="input input-sm bg-white/20 text-white text-base font-bold border-none focus:outline-none placeholder:text-white/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        ) : (
          <h1
            className={`text-base font-bold text-white px-2 py-1 rounded transition-colors truncate ${canEdit ? 'cursor-pointer hover:bg-white/20' : ''}`}
            onClick={() => canEdit && setIsEditing(true)}
          >
            {board.title}
          </h1>
        )}
      </div>

      {/* Center: View toggles */}
      <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5">
        <button
          className={`btn btn-xs gap-1 ${activeTab === 'board' ? 'btn-ghost bg-white/20 text-white' : 'btn-ghost text-white/60 hover:text-white'}`}
          onClick={() => onTabChange('board')}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Board
        </button>
        <button
          className={`btn btn-xs gap-1 ${activeTab === 'calendar' ? 'btn-ghost bg-white/20 text-white' : 'btn-ghost text-white/60 hover:text-white'}`}
          onClick={() => onTabChange('calendar')}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendar
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Share button */}
        <button
          className="btn btn-ghost btn-sm gap-1 text-white/70 hover:bg-white/20"
          onClick={() => setShowShare(true)}
          title="Share board"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Share
        </button>

        {/* Background color picker — owner/admin only */}
        {canEdit && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle text-white/70 hover:bg-white/20" title="Change background">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div tabIndex={0} className="dropdown-content bg-base-300 rounded-xl p-3 shadow-xl z-50 w-52">
              <p className="text-xs font-semibold text-base-content/60 mb-2">Background</p>
              <div className="grid grid-cols-4 gap-2">
                {BG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-8 rounded-lg cursor-pointer transition-all ${
                      board.background === color ? 'ring-2 ring-offset-2 ring-offset-base-300 ring-primary' : 'hover:brightness-110'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onUpdate({ background: color })}
                  />
                ))}
              </div>
              {/* Custom color */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className={`w-10 h-8 rounded-lg shrink-0 relative overflow-hidden ${
                      !BG_COLORS.includes(board.background) ? 'ring-2 ring-offset-2 ring-offset-base-300 ring-primary' : ''
                    }`}
                    style={{
                      background: !BG_COLORS.includes(board.background)
                        ? board.background
                        : 'conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                    }}
                  >
                    <input
                      type="color"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      value={board.background}
                      onChange={(e) => onUpdate({ background: e.target.value })}
                    />
                  </div>
                  <span className="text-xs text-base-content/50 group-hover:text-base-content/80 transition-colors">Custom color</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Star / Bookmark */}
        <button className="btn btn-ghost btn-sm btn-circle text-white/70 hover:bg-white/20" title="Star">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        {/* More menu — owner only for delete */}
        {isOwner && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle text-white/70 hover:bg-white/20" title="More">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-300 rounded-box w-48 p-2 shadow-xl z-50">
              <li>
                <button className="text-error" onClick={onDelete}>
                  Delete board
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <ShareBoardModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        board={board}
      />
    </div>
  );
}
