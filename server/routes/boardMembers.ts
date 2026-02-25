import { Router } from 'express';
import BoardMember from '../models/BoardMember.js';
import User from '../models/User.js';
import { checkBoardAccess } from './boards.js';

const router = Router();

// GET /api/boards/:boardId/members — any member or owner
router.get('/:boardId/members', async (req, res) => {
  const access = await checkBoardAccess(req.params.boardId, req.userId!);
  if (!access) {
    res.status(404).json({ message: 'Board not found' });
    return;
  }

  const members = await BoardMember.find({ boardId: access.board._id })
    .populate('userId', '_id name email')
    .sort({ createdAt: 1 });

  // Also include the owner info
  const owner = await User.findById(access.board.userId).select('_id name email');

  res.json({ owner, members });
});

// POST /api/boards/:boardId/members — owner or admin can invite
router.post('/:boardId/members', async (req, res) => {
  const access = await checkBoardAccess(req.params.boardId, req.userId!);
  if (!access) {
    res.status(404).json({ message: 'Board not found' });
    return;
  }
  if (access.role === 'member') {
    res.status(403).json({ message: 'Only owner or admin can invite members' });
    return;
  }

  const { email, role } = req.body as { email: string; role?: 'admin' | 'member' };
  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    res.status(404).json({ message: 'No user found with that email' });
    return;
  }

  // Can't invite the owner
  if (access.board.userId && user._id.toString() === access.board.userId.toString()) {
    res.status(400).json({ message: 'That user is the board owner' });
    return;
  }

  // Check if already a member
  const existing = await BoardMember.findOne({
    boardId: access.board._id,
    userId: user._id,
  });
  if (existing) {
    res.status(409).json({ message: 'User is already a member of this board' });
    return;
  }

  const member = await BoardMember.create({
    boardId: access.board._id,
    userId: user._id,
    role: role || 'member',
  });

  // Populate user info before returning
  await member.populate('userId', '_id name email');

  res.status(201).json(member);
});

// PUT /api/boards/:boardId/members/:memberId — owner or admin can change role
router.put('/:boardId/members/:memberId', async (req, res) => {
  const access = await checkBoardAccess(req.params.boardId, req.userId!);
  if (!access) {
    res.status(404).json({ message: 'Board not found' });
    return;
  }
  if (access.role === 'member') {
    res.status(403).json({ message: 'Only owner or admin can change roles' });
    return;
  }

  const { role } = req.body as { role: 'admin' | 'member' };
  if (!role || !['admin', 'member'].includes(role)) {
    res.status(400).json({ message: 'Role must be "admin" or "member"' });
    return;
  }

  const member = await BoardMember.findOneAndUpdate(
    { _id: req.params.memberId, boardId: access.board._id },
    { role },
    { new: true }
  ).populate('userId', '_id name email');

  if (!member) {
    res.status(404).json({ message: 'Member not found' });
    return;
  }

  res.json(member);
});

// DELETE /api/boards/:boardId/members/:memberId — owner/admin can remove, or self-remove
router.delete('/:boardId/members/:memberId', async (req, res) => {
  const access = await checkBoardAccess(req.params.boardId, req.userId!);
  if (!access) {
    res.status(404).json({ message: 'Board not found' });
    return;
  }

  const member = await BoardMember.findOne({
    _id: req.params.memberId,
    boardId: access.board._id,
  });
  if (!member) {
    res.status(404).json({ message: 'Member not found' });
    return;
  }

  // Self-remove is always allowed; otherwise need owner/admin
  const isSelf = member.userId.toString() === req.userId;
  if (!isSelf && access.role === 'member') {
    res.status(403).json({ message: 'Only owner or admin can remove members' });
    return;
  }

  await member.deleteOne();
  res.json({ message: 'Member removed' });
});

export default router;
