import { useState } from 'react';

interface CardDescriptionProps {
  description: string;
  onSave: (description: string) => void;
}

export default function CardDescription({ description, onSave }: CardDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description);

  const handleSave = () => {
    setIsEditing(false);
    if (value !== description) {
      onSave(value);
    }
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add a more detailed description..."
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              Save
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setIsEditing(false);
                setValue(description);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="bg-base-200 rounded-lg p-3 min-h-16 cursor-pointer hover:bg-base-300 transition-colors text-sm whitespace-pre-wrap"
          onClick={() => setIsEditing(true)}
        >
          {description || (
            <span className="text-base-content/50">Add a more detailed description...</span>
          )}
        </div>
      )}
    </div>
  );
}
