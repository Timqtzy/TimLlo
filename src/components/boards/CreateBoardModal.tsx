import { useState, useRef, useEffect } from 'react';
import ColorPicker from '../shared/ColorPicker.js';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; background: string }) => Promise<unknown>;
}

export default function CreateBoardModal({ isOpen, onClose, onCreate }: CreateBoardModalProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#0079BF');
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ title: title.trim(), background: color });
      setTitle('');
      setColor('#0079BF');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box">
        <h3 className="text-lg font-bold">Create Board</h3>

        <div className="mt-4">
          <label className="label">
            <span className="label-text">Board Title</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter board title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        <div className="mt-4">
          <label className="label">
            <span className="label-text">Background</span>
          </label>
          <ColorPicker selected={color} onChange={setColor} />
        </div>

        <div
          className="mt-4 h-16 rounded-lg"
          style={{ backgroundColor: color }}
        />

        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost" type="submit">Cancel</button>
          </form>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={!title.trim() || submitting}
          >
            {submitting ? <span className="loading loading-spinner loading-sm" /> : 'Create'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
}
