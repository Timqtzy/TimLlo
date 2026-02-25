import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { Card } from '../../types/index.js';
import type { List } from '../../types/index.js';
import CardItem from './CardItem.js';
import AddCard from './AddCard.js';

interface ListColumnProps {
  list: List;
  cards: Card[];
  onUpdateList: (listId: string, title: string) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
  onAddCard: (listId: string, title: string) => Promise<void>;
  onCardClick: (card: Card) => void;
}

export default function ListColumn({
  list,
  cards,
  onUpdateList,
  onDeleteList,
  onAddCard,
  onCardClick,
}: ListColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);

  const handleSaveTitle = () => {
    setIsEditing(false);
    if (title.trim() && title.trim() !== list.title) {
      onUpdateList(list._id, title.trim());
    } else {
      setTitle(list.title);
    }
  };

  return (
    <div className="w-72 shrink-0 rounded-xl bg-black/40 backdrop-blur-sm max-h-[calc(100vh-160px)] flex flex-col">
      {/* List header */}
      <div className="flex items-center gap-1 px-2 pt-2 pb-1">
        {isEditing ? (
          <input
            className="input input-sm input-ghost flex-1 font-semibold text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            autoFocus
          />
        ) : (
          <h3
            className="font-semibold flex-1 px-2 py-1 cursor-pointer hover:bg-white/10 rounded transition-colors text-sm text-white"
            onClick={() => setIsEditing(true)}
          >
            {list.title}
          </h3>
        )}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle text-white/70">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-300 rounded-box w-40 p-2 shadow-lg z-50">
            <li>
              <button className="text-error" onClick={() => onDeleteList(list._id)}>
                Delete list
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Cards - Droppable */}
      <Droppable droppableId={list._id} type="CARD">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-2 space-y-2 min-h-2 ${
              snapshot.isDraggingOver ? 'bg-base-200/50' : ''
            }`}
          >
            {cards.map((card, index) => (
              <CardItem key={card._id} card={card} index={index} onClick={onCardClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add card */}
      <div className="p-2 pt-0">
        <AddCard onAdd={(cardTitle) => onAddCard(list._id, cardTitle)} />
      </div>
    </div>
  );
}
