interface InboxPanelProps {
  onAddCard?: (title: string) => void;
}

export default function InboxPanel({ onAddCard: _onAddCard }: InboxPanelProps) {
  return (
    <div className="w-56 shrink-0 bg-base-300 border-r border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 pb-2">
        <h2 className="font-bold text-base">Inbox</h2>
      </div>

      {/* Add a card input */}
      <div className="px-4 pb-3">
        <input
          type="text"
          placeholder="Add a card"
          className="input input-sm input-bordered w-full bg-base-200/50 border-white/10"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-12 h-12 text-base-content/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="font-semibold text-sm">Consolidate your to-dos</h3>
          <p className="text-xs text-base-content/50">
            Capture ideas and tasks here, then organize them into your board lists.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-2 border-t border-white/5">
        <p className="text-xs text-base-content/40 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Inbox is only visible to you
        </p>
      </div>
    </div>
  );
}
