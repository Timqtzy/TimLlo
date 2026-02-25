import { Link } from 'react-router-dom';
import type { Board } from '../../types/index.js';

interface BoardCardProps {
  board: Board;
}

export default function BoardCard({ board }: BoardCardProps) {
  return (
    <Link to={`/board/${board.slug}`} className="group">
      <div className="rounded-lg overflow-hidden bg-base-300 hover:ring-2 hover:ring-primary/40 transition-all">
        {/* Colored top section */}
        <div
          className="h-24 w-full group-hover:brightness-110 transition-all"
          style={{ backgroundColor: board.background }}
        />
        {/* Title section */}
        <div className="p-3">
          <h2 className="font-semibold text-sm truncate">{board.title}</h2>
        </div>
      </div>
    </Link>
  );
}
