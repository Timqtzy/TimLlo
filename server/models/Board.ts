import mongoose, { type Document, type Types } from 'mongoose';

export interface IBoard extends Document {
  title: string;
  slug: string;
  background: string;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const BoardSchema = new mongoose.Schema<IBoard>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, unique: true },
    background: { type: String, default: '#0079BF' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true }
);

// Auto-generate slug before save
BoardSchema.pre('save', async function () {
  if (this.isModified('title') || !this.slug) {
    let base = toSlug(this.title);
    if (!base) base = 'board';
    let slug = base;
    let count = 0;
    const Board = this.constructor as mongoose.Model<IBoard>;
    while (await Board.findOne({ slug, _id: { $ne: this._id } })) {
      count++;
      slug = `${base}-${count}`;
    }
    this.slug = slug;
  }
});

// Also handle findOneAndUpdate (for PUT routes)
BoardSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (update && typeof update.title === 'string') {
    let base = toSlug(update.title as string);
    if (!base) base = 'board';
    let slug = base;
    let count = 0;
    const filter = this.getFilter();
    const Board = mongoose.model<IBoard>('Board');
    while (await Board.findOne({ slug, _id: { $ne: filter._id } })) {
      count++;
      slug = `${base}-${count}`;
    }
    this.set({ slug });
  }
});

export default mongoose.model<IBoard>('Board', BoardSchema);
