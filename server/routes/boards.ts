import { Router } from 'express';
import mongoose from 'mongoose';
import Board, { type IBoard } from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import BoardMember from '../models/BoardMember.js';

const router = Router();

// Helper: find board by slug or _id (no user scoping)
async function findBoardByIdOrSlug(idOrSlug: string) {
  const query: Record<string, unknown> = {};
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    query._id = idOrSlug;
  } else {
    query.slug = idOrSlug;
  }
  return Board.findOne(query);
}

// Shared helper: check if a user has access to a board and return their role
export async function checkBoardAccess(
  boardIdOrSlug: string,
  userId: string
): Promise<{ board: IBoard; role: 'owner' | 'admin' | 'member' } | null> {
  const board = await findBoardByIdOrSlug(boardIdOrSlug);
  if (!board) return null;

  // Owner check
  if (board.userId && board.userId.toString() === userId) {
    return { board, role: 'owner' };
  }

  // Member check
  const membership = await BoardMember.findOne({
    boardId: board._id,
    userId,
  });
  if (membership) {
    return { board, role: membership.role };
  }

  return null;
}

// GET /api/boards — returns owned boards + shared boards with role
router.get('/', async (req, res) => {
  const userId = req.userId!;

  // Owned boards
  const ownedBoards = await Board.find({ userId }).sort({ updatedAt: -1 });
  const ownedWithRole = ownedBoards.map((b) => ({
    ...b.toJSON(),
    role: 'owner' as const,
  }));

  // Shared boards (via BoardMember)
  const memberships = await BoardMember.find({ userId });
  const sharedBoardIds = memberships.map((m) => m.boardId);
  const sharedBoards = sharedBoardIds.length > 0
    ? await Board.find({ _id: { $in: sharedBoardIds } }).sort({ updatedAt: -1 })
    : [];
  const membershipMap = new Map(memberships.map((m) => [m.boardId.toString(), m.role]));
  const sharedWithRole = sharedBoards.map((b) => ({
    ...b.toJSON(),
    role: membershipMap.get((b._id as mongoose.Types.ObjectId).toString()) || 'member',
  }));

  // Combined, sorted by updatedAt
  const all = [...ownedWithRole, ...sharedWithRole].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  res.json(all);
});

// POST /api/boards
router.post('/', async (req, res) => {
  const { title, background } = req.body;
  const board = new Board({ title, background, userId: req.userId });
  await board.save();
  res.status(201).json({ ...board.toJSON(), role: 'owner' });
});

// GET /api/boards/:id — any member or owner can view
router.get('/:id', async (req, res) => {
  const access = await checkBoardAccess(req.params.id, req.userId!);
  if (!access) {
    res.status(404).json({ message: 'Board not found' });
    return;
  }
  res.json({ ...access.board.toJSON(), role: access.role });
});

// PUT /api/boards/:id — owner or admin can edit
router.put('/:id', async (req, res) => {
  const access = await checkBoardAccess(req.params.id, req.userId!);
  if (!access) {
    res.status(404).json({ message: 'Board not found' });
    return;
  }
  if (access.role === 'member') {
    res.status(403).json({ message: 'Only owner or admin can edit the board' });
    return;
  }
  const { title, background } = req.body;
  if (title !== undefined) access.board.title = title;
  if (background !== undefined) access.board.background = background;
  await access.board.save();
  res.json({ ...access.board.toJSON(), role: access.role });
});

// DELETE /api/boards/:id (cascade) — only owner
router.delete('/:id', async (req, res) => {
  const access = await checkBoardAccess(req.params.id, req.userId!);
  if (!access) {
    res.status(404).json({ message: 'Board not found' });
    return;
  }
  if (access.role !== 'owner') {
    res.status(403).json({ message: 'Only the board owner can delete it' });
    return;
  }
  const boardId = access.board._id;
  await access.board.deleteOne();
  await Card.deleteMany({ boardId });
  await List.deleteMany({ boardId });
  await BoardMember.deleteMany({ boardId });
  res.json({ message: 'Board deleted' });
});

export default router;
