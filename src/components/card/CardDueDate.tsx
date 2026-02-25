import { useState, useMemo } from 'react';

interface CardDueDateProps {
  dueDate: string | null;
  onChange: (dueDate: string | null) => void;
  onClose: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; currentMonth: boolean; date: Date }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({ day: d, currentMonth: false, date: new Date(year, month - 1, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
  }
  const remaining = Math.ceil(cells.length / 7) * 7 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) });
  }
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CardDueDate({ dueDate, onChange, onClose }: CardDueDateProps) {
  const today = new Date();
  const dueDateObj = dueDate ? new Date(dueDate) : null;

  const [viewYear, setViewYear] = useState(dueDateObj?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(dueDateObj?.getMonth() ?? today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(dueDateObj);
  const [enabled, setEnabled] = useState(!!dueDate);

  const cells = useMemo(() => getMonthData(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const goPrev = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };
  const goPrevYear = () => setViewYear((y) => y - 1);
  const goNextYear = () => setViewYear((y) => y + 1);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEnabled(true);
  };

  const handleSave = () => {
    if (enabled && selectedDate) {
      onChange(selectedDate.toISOString());
    } else {
      onChange(null);
    }
    onClose();
  };

  const handleRemove = () => {
    onChange(null);
    onClose();
  };

  const formattedDate = selectedDate
    ? `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}/${selectedDate.getFullYear()}`
    : '';

  return (
    <div
      className="bg-base-300 rounded-xl shadow-xl w-72 p-3 z-[60]"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center mb-3">
        <div className="flex-1" />
        <h3 className="font-semibold text-sm">Dates</h3>
        <div className="flex-1 flex justify-end">
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-0.5">
          <button className="btn btn-ghost btn-xs btn-square" onClick={goPrevYear}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-xs btn-square" onClick={goPrev}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <div className="flex gap-0.5">
          <button className="btn btn-ghost btn-xs btn-square" onClick={goNext}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-xs btn-square" onClick={goNextYear}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-base-content/40 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 mb-3">
        {cells.map((cell, i) => {
          const isToday = isSameDay(cell.date, today);
          const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
          return (
            <button
              key={i}
              className={`w-full aspect-square rounded-full text-xs flex items-center justify-center transition-all
                ${!cell.currentMonth ? 'text-base-content/20' : 'text-base-content/70 hover:bg-base-content/10'}
                ${isToday && !isSelected ? 'ring-1 ring-primary text-primary font-bold' : ''}
                ${isSelected ? 'bg-primary text-primary-content font-bold' : ''}
              `}
              onClick={() => handleDateClick(cell.date)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Due date field */}
      <div className="space-y-2 mb-3">
        <p className="text-xs font-semibold text-base-content/50">Due date</p>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <input
            className="input input-sm input-bordered flex-1 bg-base-200 border-base-content/10"
            value={formattedDate}
            readOnly
            placeholder="M/D/YYYY"
          />
        </div>
      </div>

      {/* Actions */}
      <button className="btn btn-primary btn-sm w-full mb-2" onClick={handleSave}>
        Save
      </button>
      {dueDate && (
        <button className="btn btn-ghost btn-sm w-full text-base-content/60" onClick={handleRemove}>
          Remove
        </button>
      )}
    </div>
  );
}
