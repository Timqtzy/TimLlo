import { useState, useRef, useEffect } from 'react';
import type { Card } from '../../types/index.js';
import CardDescription from './CardDescription.js';
import { getLabelInfo } from './CardLabels.js';
import CardLabels from './CardLabels.js';
import CardDueDate from './CardDueDate.js';
import CardChecklist from './CardChecklist.js';
import ConfirmDialog from '../shared/ConfirmDialog.js';

interface CardDetailModalProps {
  card: Card;
  listName: string;
  onClose: () => void;
  onUpdate: (data: Partial<Card>) => Promise<void>;
  onDelete: () => Promise<void>;
}

type Popover = 'add' | 'labels' | 'dates' | 'checklist' | null;

export default function CardDetailModal({
  card,
  listName,
  onClose,
  onUpdate,
  onDelete,
}: CardDetailModalProps) {
  const [title, setTitle] = useState(card.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [popover, setPopover] = useState<Popover>(null);
  const [commentText, setCommentText] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Close more menu when clicking outside
  useEffect(() => {
    if (!showMoreMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMoreMenu]);

  const handleTitleSave = () => {
    if (title.trim() && title.trim() !== card.title) {
      onUpdate({ title: title.trim() });
    } else {
      setTitle(card.title);
    }
  };

  const togglePopover = (p: Popover) => {
    setPopover((prev) => (prev === p ? null : p));
  };

  const hasLabels = card.labels.length > 0;
  const hasDueDate = !!card.dueDate;

  return (
    <>
      <dialog ref={dialogRef} className="modal" onClose={onClose}>
        <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] p-0 flex flex-col !overflow-visible">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-2">
            <span className="badge badge-sm bg-base-300 border-base-content/10 text-base-content/70 gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              {listName}
            </span>
            <div className="flex-1" />
            <div className="relative" ref={moreMenuRef}>
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowMoreMenu((v) => !v)}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              {showMoreMenu && (
                <ul className="absolute right-0 top-full mt-1 menu bg-base-300 rounded-box w-44 p-2 shadow-xl z-50">
                  <li>
                    <button
                      className="text-error"
                      onClick={() => {
                        setShowMoreMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      Delete card
                    </button>
                  </li>
                </ul>
              )}
            </div>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm btn-circle" type="submit">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>

          {/* Title */}
          <div className="px-5 pb-2">
            <input
              className="input input-ghost w-full text-xl font-bold px-1 focus:bg-base-200 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            />
          </div>

          {/* Action chips row */}
          <div className="flex flex-wrap gap-2 px-5 pb-3 relative">
            {/* + Add */}
            <div className="relative">
              <button
                className={`btn btn-sm gap-1.5 ${popover === 'add' ? 'btn-primary' : 'btn-ghost bg-base-300'}`}
                onClick={() => togglePopover('add')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
              {popover === 'add' && (
                <div
                  className="absolute top-full left-0 mt-2 bg-base-300 rounded-xl shadow-xl w-64 p-3 z-[60]"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center mb-3">
                    <div className="flex-1" />
                    <h3 className="font-semibold text-sm">Add to card</h3>
                    <div className="flex-1 flex justify-end">
                      <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setPopover(null)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <ul className="space-y-0.5">
                    <li>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-content/5 transition-colors text-left"
                        onClick={() => setPopover('labels')}
                      >
                        <svg className="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">Labels</p>
                          <p className="text-xs text-base-content/40">Organize, categorize, and prioritize</p>
                        </div>
                      </button>
                    </li>
                    <li>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-content/5 transition-colors text-left"
                        onClick={() => setPopover('dates')}
                      >
                        <svg className="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">Dates</p>
                          <p className="text-xs text-base-content/40">Start dates, due dates, and reminders</p>
                        </div>
                      </button>
                    </li>
                    <li>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-content/5 transition-colors text-left"
                        onClick={() => setPopover('checklist')}
                      >
                        <svg className="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">Checklist</p>
                          <p className="text-xs text-base-content/40">Add subtasks</p>
                        </div>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Dates chip */}
            <div className="relative">
              <button
                className={`btn btn-sm gap-1.5 ${popover === 'dates' ? 'btn-primary' : 'btn-ghost bg-base-300'}`}
                onClick={() => togglePopover('dates')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Dates
              </button>
              {popover === 'dates' && (
                <div className="absolute top-full left-0 mt-2">
                  <CardDueDate
                    dueDate={card.dueDate}
                    onChange={(dueDate) => onUpdate({ dueDate })}
                    onClose={() => setPopover(null)}
                  />
                </div>
              )}
            </div>

            {/* Checklist chip */}
            <div className="relative">
              <button
                className={`btn btn-sm gap-1.5 ${popover === 'checklist' ? 'btn-primary' : 'btn-ghost bg-base-300'}`}
                onClick={() => togglePopover('checklist')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Checklist
              </button>
            </div>

            {/* Labels popover (rendered when triggered from + Add) */}
            {popover === 'labels' && (
              <div className="absolute top-full left-0 mt-2 z-[60]">
                <CardLabels
                  labels={card.labels}
                  onChange={(labels) => onUpdate({ labels })}
                  onClose={() => setPopover(null)}
                />
              </div>
            )}
          </div>

          {/* Labels + Due date display */}
          {(hasLabels || hasDueDate) && (
            <div className="flex flex-wrap items-start gap-x-8 gap-y-2 px-5 pb-3">
              {hasLabels && (
                <div>
                  <p className="text-xs text-base-content/40 mb-1.5">Labels</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {card.labels.map((color) => {
                      const info = getLabelInfo(color);
                      return (
                        <button
                          key={color}
                          className="h-7 min-w-14 rounded px-2.5 text-xs font-medium text-white cursor-pointer hover:brightness-110 transition-all flex items-center"
                          style={{ backgroundColor: color }}
                          onClick={() => setPopover('labels')}
                        >
                          {info.name || ''}
                        </button>
                      );
                    })}
                    <button
                      className="w-7 h-7 rounded bg-base-content/10 hover:bg-base-content/20 flex items-center justify-center transition-colors"
                      onClick={() => setPopover('labels')}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              {hasDueDate && (
                <div>
                  <p className="text-xs text-base-content/40 mb-1.5">Due date</p>
                  <button
                    className={`badge gap-1.5 cursor-pointer ${
                      new Date(card.dueDate!) < new Date() ? 'badge-error' : 'badge-ghost'
                    }`}
                    onClick={() => setPopover('dates')}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(card.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto border-t border-base-content/5">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] min-h-0">
              {/* Left: Description + Checklist */}
              <div className="p-5 space-y-6">
                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <h3 className="font-semibold">Description</h3>
                  </div>
                  <CardDescription
                    description={card.description}
                    onSave={(description) => onUpdate({ description })}
                  />
                </div>

                {/* Checklist (always visible if has items, or when popover=checklist) */}
                {(card.checklist.length > 0 || popover === 'checklist') && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <h3 className="font-semibold">Checklist</h3>
                    </div>
                    <CardChecklist
                      checklist={card.checklist}
                      onChange={(checklist) => onUpdate({ checklist })}
                    />
                  </div>
                )}
              </div>

              {/* Right: Activity */}
              <div className="border-l border-base-content/5 p-5 bg-base-200/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="font-semibold text-sm">Comments and activity</h3>
                  </div>
                </div>

                {/* Comment input */}
                <div className="mb-4">
                  <textarea
                    className="textarea textarea-bordered w-full textarea-sm bg-base-200/50 border-base-content/10"
                    placeholder="Write a comment..."
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (commentText.trim()) {
                          onUpdate({ comments: [...(card.comments || []), { text: commentText.trim() }] } as Partial<Card>);
                          setCommentText('');
                        }
                      }
                    }}
                  />
                  {commentText.trim() && (
                    <button
                      className="btn btn-primary btn-xs mt-1.5"
                      onClick={() => {
                        onUpdate({ comments: [...(card.comments || []), { text: commentText.trim() }] } as Partial<Card>);
                        setCommentText('');
                      }}
                    >
                      Save
                    </button>
                  )}
                </div>

                {/* Comments + activity log */}
                <div className="space-y-3">
                  {[...(card.comments || [])]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((comment) => (
                      <div key={comment._id} className="flex gap-2 group">
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          U
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-base-content/70">You</span>
                            <span className="text-[10px] text-base-content/30">
                              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                            <button
                              className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-base-content/30 hover:text-error"
                              onClick={() => setDeleteCommentId(comment._id)}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-sm text-base-content/80 mt-0.5 whitespace-pre-wrap break-words">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))}

                  {/* Card created entry */}
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-base-content/10 text-base-content/40 text-xs font-bold flex items-center justify-center shrink-0">
                      U
                    </div>
                    <div className="text-xs text-base-content/50">
                      <p>
                        <span className="font-semibold text-base-content/70">You</span> added this card
                      </p>
                      <p className="text-base-content/30 mt-0.5">
                        {new Date(card.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Card"
        message={`Are you sure you want to delete "${card.title}"? This action cannot be undone.`}
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          await onDelete();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        isOpen={!!deleteCommentId}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={async () => {
          const updated = (card.comments || []).filter((c) => c._id !== deleteCommentId);
          setDeleteCommentId(null);
          await onUpdate({ comments: updated } as Partial<Card>);
        }}
        onCancel={() => setDeleteCommentId(null)}
      />
    </>
  );
}
