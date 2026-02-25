import { Link } from 'react-router-dom';

export type BoardTab = 'board' | 'inbox' | 'planner' | 'calendar';

interface BoardBottomBarProps {
  activeTab: BoardTab;
  onTabChange: (tab: BoardTab) => void;
}

export default function BoardBottomBar({ activeTab, onTabChange }: BoardBottomBarProps) {
  const tabClass = (tab: BoardTab) =>
    activeTab === tab
      ? 'btn btn-ghost btn-sm gap-1.5 text-primary border-b-2 border-primary rounded-b-none'
      : 'btn btn-ghost btn-sm gap-1.5 text-base-content/60 hover:text-base-content';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center bg-base-300/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 px-2 py-1.5 gap-1">
        <button className={tabClass('inbox')} onClick={() => onTabChange(activeTab === 'inbox' ? 'board' : 'inbox')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          Inbox
        </button>
        <button className={tabClass('planner')} onClick={() => onTabChange(activeTab === 'planner' ? 'board' : 'planner')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Planner
        </button>
        <button className={tabClass('calendar')} onClick={() => onTabChange(activeTab === 'calendar' ? 'board' : 'calendar')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendar
        </button>
        <button className={tabClass('board')} onClick={() => onTabChange('board')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Board
        </button>
        <Link to="/" className="btn btn-ghost btn-sm gap-1.5 text-base-content/60 hover:text-base-content">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Switch boards
        </Link>
      </div>
    </div>
  );
}
