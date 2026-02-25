import { Router } from 'express';
import Card from '../models/Card.js';
import List from '../models/List.js';
import { checkBoardAccess } from './boards.js';

const router = Router();

// GET /api/boards/:boardId/cards
router.get('/boards/:boardId/cards', async (req, res) => {
  const access = await checkBoardAccess(req.params.boardId, req.userId!);
  if (!access) { res.status(404).json({ message: 'Board not found' }); return; }
  const cards = await Card.find({ boardId: access.board._id }).sort({ position: 1 });
  res.json(cards);
});

// POST /api/lists/:listId/cards
router.post('/lists/:listId/cards', async (req, res) => {
  const { title } = req.body;
  const list = await List.findById(req.params.listId);
  if (!list) {
    res.status(404).json({ message: 'List not found' });
    return;
  }
  const access = await checkBoardAccess(list.boardId.toString(), req.userId!);
  if (!access) { res.status(404).json({ message: 'Board not found' }); return; }
  const maxCard = await Card.findOne({ listId: req.params.listId }).sort({ position: -1 });
  const position = maxCard ? maxCard.position + 1 : 0;
  const card = await Card.create({
    title,
    listId: req.params.listId,
    boardId: list.boardId,
    position,
  });
  res.status(201).json(card);
});

// GET /api/cards/:id
router.get('/cards/:id', async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) {
    res.status(404).json({ message: 'Card not found' });
    return;
  }
  const access = await checkBoardAccess(card.boardId.toString(), req.userId!);
  if (!access) { res.status(404).json({ message: 'Card not found' }); return; }
  res.json(card);
});

// PUT /api/cards/:id
router.put('/cards/:id', async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) {
    res.status(404).json({ message: 'Card not found' });
    return;
  }
  const access = await checkBoardAccess(card.boardId.toString(), req.userId!);
  if (!access) { res.status(404).json({ message: 'Card not found' }); return; }
  const { title, description, labels, dueDate, checklist, comments } = req.body;
  const updated = await Card.findByIdAndUpdate(
    req.params.id,
    { title, description, labels, dueDate, checklist, comments },
    { new: true, runValidators: true }
  );
  res.json(updated);
});

// DELETE /api/cards/:id
router.delete('/cards/:id', async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) {
    res.status(404).json({ message: 'Card not found' });
    return;
  }
  const access = await checkBoardAccess(card.boardId.toString(), req.userId!);
  if (!access) { res.status(404).json({ message: 'Card not found' }); return; }
  await card.deleteOne();
  res.json({ message: 'Card deleted' });
});

export default router;
