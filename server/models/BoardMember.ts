import mongoose, { type Document, type Types } from 'mongoose';

export interface IBoardMember extends Document {
  boardId: Types.ObjectId;
  userId: Types.ObjectId;
  role: 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}

const BoardMemberSchema = new mongoose.Schema<IBoardMember>(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
  },
  { timestamps: true }
);

BoardMemberSchema.index({ boardId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IBoardMember>('BoardMember', BoardMemberSchema);
