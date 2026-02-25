import { useState } from 'react';
import type { ChecklistItem } from '../../types/index.js';

interface CardChecklistProps {
  checklist: ChecklistItem[];
  onChange: (checklist: ChecklistItem[]) => void;
}

export default function CardChecklist({ checklist, onChange }: CardChecklistProps) {
  const [newItem, setNewItem] = useState('');
  const completedCount = checklist.filter((i) => i.completed).length;

  const handleAdd = () => {
    if (!newItem.trim()) return;
    const item: ChecklistItem = {
      _id: crypto.randomUUID(),
      text: newItem.trim(),
      completed: false,
    };
    onChange([...checklist, item]);
    setNewItem('');
  };

  const toggleItem = (id: string) => {
    onChange(checklist.map((i) => (i._id === id ? { ...i, completed: !i.completed } : i)));
  };

  const removeItem = (id: string) => {
    onChange(checklist.filter((i) => i._id !== id));
  };

  return (
    <div>
      <h4 className="font-semibold text-sm mb-2">Checklist</h4>

      {checklist.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-base-content/60">
            {completedCount}/{checklist.length}
          </span>
          <progress
            className="progress progress-primary flex-1"
            value={completedCount}
            max={checklist.length}
          />
        </div>
      )}

      <ul className="space-y-1 mb-2">
        {checklist.map((item) => (
          <li key={item._id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              checked={item.completed}
              onChange={() => toggleItem(item._id)}
            />
            <span
              className={`flex-1 text-sm ${item.completed ? 'line-through text-base-content/50' : ''}`}
            >
              {item.text}
            </span>
            <button
              className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeItem(item._id)}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          className="input input-sm input-bordered flex-1"
          placeholder="Add an item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-sm btn-primary" onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  );
}
