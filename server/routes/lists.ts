import { Router } from 'express';
import List from '../models/List.js';
import Card from '../models/Card.js';
import { checkBoardAccess } from './boards.js';

const router = Router();

// GET /api/boards/:boardId/lists
router.get('/boards/:boardId/lists', async (req, res) => {
  const access = await checkBoardAccess(req.params.boardId, req.userId!);
  if (!access) { res.status(404).json({ message: 'Board not found' }); return; }
  const lists = await List.find({ boardId: access.board._id }).sort({ position: 1 });
  res.json(lists);
});

// POST /api/boards/:boardId/lists
router.post('/boards/:boardId/lists', async (req, res) => {
  const access = await checkBoardAccess(req.params.boardId, req.userId!);
  if (!access) { res.status(404).json({ message: 'Board not found' }); return; }
  const { title } = req.body;
  const boardId = access.board._id;
  const maxList = await List.findOne({ boardId }).sort({ position: -1 });
  const position = maxList ? maxList.position + 1 : 0;
  const list = await List.create({ title, boardId, position });
  res.status(201).json(list);
});

// PUT /api/lists/:id
router.put('/lists/:id', async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) { res.status(404).json({ message: 'List not found' }); return; }
  const access = await checkBoardAccess(list.boardId.toString(), req.userId!);
  if (!access) { res.status(404).json({ message: 'Board not found' }); return; }
  const { title } = req.body;
  list.title = title;
  await list.save();
  res.json(list);
});

// DELETE /api/lists/:id (cascade cards)
router.delete('/lists/:id', async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) { res.status(404).json({ message: 'List not found' }); return; }
  const access = await checkBoardAccess(list.boardId.toString(), req.userId!);
  if (!access) { res.status(404).json({ message: 'Board not found' }); return; }
  await list.deleteOne();
  await Card.deleteMany({ listId: req.params.id });
  res.json({ message: 'List deleted' });
});

export default router;
