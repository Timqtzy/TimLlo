import { useState, useMemo } from 'react';
import type { Card, List } from '../../types/index.js';

interface CalendarViewProps {
  cards: Card[];
  lists: List[];
  onCardClick: (card: Card) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; currentMonth: boolean; date: Date }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ day, currentMonth: false, date: new Date(year, month - 1, day) });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
  }

  // Next month leading days
  const remaining = 42 - cells.length; // 6 rows × 7
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) });
  }

  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const LABEL_COLORS: Record<string, string> = {
  green: '#4bce97',
  yellow: '#f5cd47',
  orange: '#fea362',
  red: '#f87168',
  purple: '#9f8fef',
  blue: '#579dff',
};

export default function CalendarView({ cards, lists, onCardClick }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const cells = useMemo(() => getMonthData(viewYear, viewMonth), [viewYear, viewMonth]);

  // Group cards with due dates by date string
  const cardsByDate = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const card of cards) {
      if (!card.dueDate) continue;
      const d = new Date(card.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(card);
    }
    return map;
  }, [cards]);

  const listNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of lists) map.set(l._id, l.title);
    return map;
  }, [lists]);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Trim to 5 rows if the 6th row is entirely next month
  const rowCount = cells.slice(35).every((c) => !c.currentMonth) ? 5 : 6;
  const visibleCells = cells.slice(0, rowCount * 7);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-base-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-bold">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <button className="btn btn-ghost btn-sm btn-square" onClick={goPrev}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-sm btn-square" onClick={goNext}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={goToday}>
          Today
        </button>
        <div className="flex-1" />
        <span className="badge badge-sm badge-ghost">Month</span>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-white/10">
        {DAYS.map((d) => (
          <div key={d} className="px-2 py-1.5 text-xs font-semibold text-base-content/50 text-center">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-0 overflow-y-auto">
        {visibleCells.map((cell, i) => {
          const dateKey = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
          const dayCards = cardsByDate.get(dateKey) || [];
          const isToday = isSameDay(cell.date, today);

          return (
            <div
              key={i}
              className={`border-b border-r border-white/5 p-1 flex flex-col min-h-24 ${
                !cell.currentMonth ? 'bg-base-200/30' : ''
              }`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between px-1">
                <span
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-primary text-primary-content'
                      : cell.currentMonth
                        ? 'text-base-content/70'
                        : 'text-base-content/30'
                  }`}
                >
                  {cell.day}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-0.5 mt-0.5 overflow-y-auto flex-1">
                {dayCards.slice(0, 3).map((card) => (
                  <button
                    key={card._id}
                    className="text-left w-full px-1.5 py-0.5 rounded text-xs bg-base-300 hover:bg-base-300/80 transition-colors cursor-pointer"
                    onClick={() => onCardClick(card)}
                  >
                    <div className="flex items-center gap-1">
                      {card.labels.length > 0 && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: LABEL_COLORS[card.labels[0]] || card.labels[0] }}
                        />
                      )}
                      <span className="truncate">{card.title}</span>
                    </div>
                    <div className="text-[10px] text-base-content/40 truncate">
                      {listNameMap.get(card.listId) || ''}
                    </div>
                  </button>
                ))}
                {dayCards.length > 3 && (
                  <span className="text-[10px] text-base-content/40 px-1.5">+{dayCards.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
