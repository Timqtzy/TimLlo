import { useState } from 'react';

interface AddCardProps {
  onAdd: (title: string) => Promise<void>;
}

export default function AddCard({ onAdd }: AddCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleAdd = async () => {
    if (!title.trim()) return;
    await onAdd(title.trim());
    setTitle('');
  };

  if (!isAdding) {
    return (
      <button
        className="btn btn-ghost btn-sm w-full justify-start text-white/60 hover:text-white hover:bg-white/10"
        onClick={() => setIsAdding(true)}
      >
        + Add a card
      </button>
    );
  }

  return (
    <div>
      <textarea
        className="textarea textarea-bordered w-full textarea-sm bg-base-300 border-white/10"
        placeholder="Enter a title for this card..."
        rows={2}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
          }
        }}
        autoFocus
      />
      <div className="flex gap-2 mt-1">
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>
          Add card
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setIsAdding(false);
            setTitle('');
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
