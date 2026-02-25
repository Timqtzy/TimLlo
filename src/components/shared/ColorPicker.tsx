const COLORS = [
  '#0079BF', '#D29034', '#519839', '#B04632',
  '#89609E', '#CD5A91', '#4BBF6B', '#00AECC',
  '#838C91',
];

interface ColorPickerProps {
  selected: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ selected, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={`w-10 h-8 rounded cursor-pointer transition-all ${
            selected === color ? 'ring-2 ring-offset-2 ring-primary' : ''
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
