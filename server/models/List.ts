import mongoose, { type Document, type Types } from 'mongoose';

export interface IList extends Document {
  title: string;
  boardId: Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListSchema = new mongoose.Schema<IList>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    position: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

ListSchema.index({ boardId: 1, position: 1 });

export default mongoose.model<IList>('List', ListSchema);
