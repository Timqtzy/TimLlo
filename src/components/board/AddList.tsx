import { useState } from 'react';

interface AddListProps {
  onAdd: (title: string) => Promise<void>;
}

export default function AddList({ onAdd }: AddListProps) {
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
        className="btn bg-white/20 hover:bg-white/30 text-white border-none w-72 shrink-0 justify-start"
        onClick={() => setIsAdding(true)}
      >
        + Add another list
      </button>
    );
  }

  return (
    <div className="w-72 shrink-0 rounded-xl bg-black/40 backdrop-blur-sm p-2">
      <input
        className="input input-sm input-bordered w-full bg-base-300 border-white/10"
        placeholder="Enter list title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        autoFocus
      />
      <div className="flex gap-2 mt-2">
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>
          Add list
        </button>
        <button
          className="btn btn-ghost btn-sm text-white/70"
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
