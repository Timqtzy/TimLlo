import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { List, Card } from '../../types/index.js';
import ListColumn from './ListColumn.js';
import AddList from './AddList.js';

interface BoardCanvasProps {
  lists: List[];
  cardsByList: Record<string, Card[]>;
  onDragEnd: (result: DropResult) => void;
  onAddList: (title: string) => Promise<void>;
  onUpdateList: (listId: string, title: string) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
  onAddCard: (listId: string, title: string) => Promise<void>;
  onCardClick: (card: Card) => void;
}

export default function BoardCanvas({
  lists,
  cardsByList,
  onDragEnd,
  onAddList,
  onUpdateList,
  onDeleteList,
  onAddCard,
  onCardClick,
}: BoardCanvasProps) {
  return (
    <div className="flex-1 overflow-x-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex items-start gap-3 p-4 pt-3 min-h-full"
            >
              {lists.map((list, index) => (
                <Draggable key={list._id} draggableId={list._id} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className={`transition-transform ${snapshot.isDragging ? 'rotate-2 opacity-90 z-[9999]' : ''}`}
                      style={snapshot.isDragging ? { ...dragProvided.draggableProps.style, zIndex: 9999 } : dragProvided.draggableProps.style}
                    >
                      <ListColumn
                        list={list}
                        cards={cardsByList[list._id] || []}
                        onUpdateList={onUpdateList}
                        onDeleteList={onDeleteList}
                        onAddCard={onAddCard}
                        onCardClick={onCardClick}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <AddList onAdd={onAddList} />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
