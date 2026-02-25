import { createPortal } from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import type { Card } from '../../types/index.js';

interface CardItemProps {
  card: Card;
  index: number;
  onClick: (card: Card) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CardItem({ card, index, onClick }: CardItemProps) {
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const completedChecklist = card.checklist.filter((i) => i.completed).length;

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => {
        const child = (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`card bg-base-300 shadow-sm cursor-pointer hover:ring-1 hover:ring-white/20 transition-all ${
              snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''
            }`}
            onClick={() => onClick(card)}
          >
            <div className="card-body p-2.5 gap-1.5">
              {card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {card.labels.map((color) => (
                    <span
                      key={color}
                      className="w-8 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
              <p className="text-sm">{card.title}</p>
              {(card.description || card.dueDate || card.checklist.length > 0) && (
                <div className="flex items-center gap-2 text-base-content/50 text-xs mt-1">
                  {card.description && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  )}
                  {card.dueDate && (
                    <span className={`badge badge-xs ${isOverdue ? 'badge-error' : 'badge-ghost'}`}>
                      {formatDate(card.dueDate)}
                    </span>
                  )}
                  {card.checklist.length > 0 && (
                    <span
                      className={`badge badge-xs ${
                        completedChecklist === card.checklist.length ? 'badge-success' : 'badge-ghost'
                      }`}
                    >
                      {completedChecklist}/{card.checklist.length}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );

        // Portal the dragged card to document.body so it's not clipped by overflow-y-auto
        if (snapshot.isDragging) {
          return createPortal(child, document.body);
        }

        return child;
      }}
    </Draggable>
  );
}
