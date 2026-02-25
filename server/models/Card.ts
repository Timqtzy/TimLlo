import mongoose, { type Document, type Types } from 'mongoose';

export interface IChecklistItem {
  _id: Types.ObjectId;
  text: string;
  completed: boolean;
}

export interface IComment {
  _id: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ICard extends Document {
  title: string;
  description: string;
  listId: Types.ObjectId;
  boardId: Types.ObjectId;
  position: number;
  labels: string[];
  dueDate: Date | null;
  checklist: IChecklistItem[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new mongoose.Schema<IChecklistItem>({
  text: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
});

const CommentSchema = new mongoose.Schema<IComment>({
  text: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });

const CardSchema = new mongoose.Schema<ICard>(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    description: { type: String, default: '', maxlength: 5000 },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true, index: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    position: { type: Number, required: true, default: 0 },
    labels: [{ type: String }],
    dueDate: { type: Date, default: null },
    checklist: [ChecklistItemSchema],
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true }
);

CardSchema.index({ listId: 1, position: 1 });

export default mongoose.model<ICard>('Card', CardSchema);
