import { useState, useRef } from 'react';

const PALETTE = [
  '#61BD4F', '#F2D600', '#FF9F1A', '#EB5A46', '#FF78CB',
  '#0079BF', '#00C2E0', '#51E898', '#C377E0', '#344563',
];

const INITIAL_LABELS = [
  { color: '#61BD4F', name: 'Priority 1' },
  { color: '#F2D600', name: '' },
  { color: '#FF9F1A', name: '' },
  { color: '#EB5A46', name: '' },
  { color: '#FF78CB', name: '' },
  { color: '#0079BF', name: '' },
  { color: '#00C2E0', name: '' },
  { color: '#51E898', name: '' },
  { color: '#C377E0', name: '' },
  { color: '#344563', name: '' },
];

interface LabelDef {
  color: string;
  name: string;
}

interface CardLabelsProps {
  labels: string[];
  onChange: (labels: string[]) => void;
  onClose: () => void;
}

type View = 'list' | 'edit' | 'create';

export default function CardLabels({ labels, onChange, onClose }: CardLabelsProps) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('list');
  const [allLabels, setAllLabels] = useState<LabelDef[]>(INITIAL_LABELS);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#0079BF');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const toggleLabel = (color: string) => {
    if (labels.includes(color)) {
      onChange(labels.filter((l) => l !== color));
    } else {
      onChange([...labels, color]);
    }
  };

  const filtered = allLabels.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.color.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (index: number) => {
    const label = allLabels[index];
    setEditingIndex(index);
    setEditName(label.name);
    setEditColor(label.color);
    setView('edit');
  };

  const startCreate = () => {
    setEditingIndex(-1);
    setEditName('');
    setEditColor('#0079BF');
    setView('create');
  };

  const saveEdit = () => {
    if (view === 'edit' && editingIndex >= 0) {
      const oldColor = allLabels[editingIndex].color;
      setAllLabels((prev) =>
        prev.map((l, i) => (i === editingIndex ? { color: editColor, name: editName.trim() } : l))
      );
      // Update card labels if color changed
      if (oldColor !== editColor && labels.includes(oldColor)) {
        onChange(labels.map((l) => (l === oldColor ? editColor : l)));
      }
    } else if (view === 'create') {
      const newLabel: LabelDef = { color: editColor, name: editName.trim() };
      setAllLabels((prev) => [...prev, newLabel]);
    }
    setView('list');
  };

  const deleteLabel = () => {
    if (editingIndex >= 0) {
      const color = allLabels[editingIndex].color;
      setAllLabels((prev) => prev.filter((_, i) => i !== editingIndex));
      if (labels.includes(color)) {
        onChange(labels.filter((l) => l !== color));
      }
    }
    setView('list');
  };

  const heading = view === 'edit' ? 'Edit label' : view === 'create' ? 'Create label' : 'Labels';

  return (
    <div
      className="bg-base-300 rounded-xl shadow-xl w-72 p-3"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center mb-3">
        {view !== 'list' ? (
          <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setView('list')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-6" />
        )}
        <h3 className="font-semibold text-sm flex-1 text-center">{heading}</h3>
        <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {view !== 'list' ? (
        /* Edit / Create view */
        <div>
          <p className="text-xs font-semibold text-base-content/50 mb-1.5">Name</p>
          <input
            className="input input-sm input-bordered w-full bg-base-200 border-base-content/10 mb-3"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            autoFocus
          />

          <p className="text-xs font-semibold text-base-content/50 mb-1.5">Color</p>
          {/* Preview */}
          <div
            className="h-10 rounded-lg mb-3 cursor-pointer hover:brightness-110 transition-all"
            style={{ backgroundColor: editColor }}
            onClick={() => colorInputRef.current?.click()}
          />
          {/* Palette grid */}
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                className={`h-7 rounded transition-all ${
                  editColor === c ? 'ring-2 ring-offset-1 ring-offset-base-300 ring-primary scale-110' : 'hover:brightness-110'
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setEditColor(c)}
              />
            ))}
          </div>
          {/* Custom color */}
          <label className="flex items-center gap-2 cursor-pointer group mb-3">
            <div
              className="w-7 h-7 rounded shrink-0 relative overflow-hidden"
              style={{
                background: !PALETTE.includes(editColor)
                  ? editColor
                  : 'conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
              }}
            >
              <input
                ref={colorInputRef}
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
              />
            </div>
            <span className="text-xs text-base-content/50 group-hover:text-base-content/80 transition-colors">
              Custom color
            </span>
          </label>

          <button className="btn btn-primary btn-sm w-full mb-2" onClick={saveEdit}>
            Save
          </button>
          {view === 'edit' && (
            <button className="btn btn-error btn-outline btn-sm w-full" onClick={deleteLabel}>
              Delete label
            </button>
          )}
        </div>
      ) : (
        /* Label list view */
        <>
          <input
            className="input input-sm input-bordered w-full mb-3 bg-base-200 border-base-content/10"
            placeholder="Search labels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <p className="text-xs font-semibold text-base-content/50 mb-2">Labels</p>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {filtered.map((label) => {
              const realIndex = allLabels.indexOf(label);
              const isSelected = labels.includes(label.color);
              return (
                <div key={`${label.color}-${realIndex}`} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary shrink-0"
                    checked={isSelected}
                    onChange={() => toggleLabel(label.color)}
                  />
                  <button
                    type="button"
                    className="flex-1 h-8 rounded hover:brightness-110 transition-all flex items-center px-3"
                    style={{ backgroundColor: label.color }}
                    onClick={() => toggleLabel(label.color)}
                  >
                    {label.name && (
                      <span className="text-white text-sm font-medium drop-shadow-sm">{label.name}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content shrink-0"
                    onClick={() => startEdit(realIndex)}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-ghost btn-sm w-full mt-3 bg-base-content/5 text-base-content/60 hover:bg-base-content/10"
            onClick={startCreate}
          >
            Create a new label
          </button>
        </>
      )}
    </div>
  );
}

// Helper: get label info by color
export function getLabelInfo(color: string) {
  const found = INITIAL_LABELS.find((l) => l.color === color);
  return found || { color, name: '' };
}

export { INITIAL_LABELS as LABELS };
