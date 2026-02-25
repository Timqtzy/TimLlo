import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { auth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import boardMemberRoutes from './routes/boardMembers.js';
import listRoutes from './routes/lists.js';
import cardRoutes from './routes/cards.js';
import { checkBoardAccess } from './routes/boards.js';
import Board from './models/Board.js';
import Card from './models/Card.js';
import List from './models/List.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth routes (public)
app.use('/api/auth', authRoutes);

// All routes below require authentication
app.use('/api', auth);

// Reorder routes (defined directly to avoid Express 5 router param conflicts)
app.put('/api/card-reorder', async (req, res) => {
  try {
    const { boardId, sourceListId, destListId, sourceCardIds, destCardIds } = req.body as {
      boardId: string;
      sourceListId: string;
      destListId: string;
      sourceCardIds: string[];
      destCardIds: string[];
    };

    // Board access check — use boardId if provided, otherwise infer from destListId
    if (boardId) {
      const access = await checkBoardAccess(boardId, req.userId!);
      if (!access) { res.status(404).json({ message: 'Board not found' }); return; }
    } else {
      // Fallback: look up the board from the destination list
      const list = await List.findById(destListId);
      if (!list) { res.status(404).json({ message: 'List not found' }); return; }
      const access = await checkBoardAccess(list.boardId.toString(), req.userId!);
      if (!access) { res.status(404).json({ message: 'Board not found' }); return; }
    }

    const ops = [];

    for (let i = 0; i < destCardIds.length; i++) {
      ops.push({
        updateOne: {
          filter: { _id: destCardIds[i] },
          update: { $set: { position: i, listId: new mongoose.Types.ObjectId(destListId) } },
        },
      });
    }

    if (sourceListId !== destListId) {
      for (let i = 0; i < sourceCardIds.length; i++) {
        ops.push({
          updateOne: {
            filter: { _id: sourceCardIds[i] },
            update: { $set: { position: i } },
          },
        });
      }
    }

    if (ops.length > 0) {
      await Card.bulkWrite(ops);
    }
    res.json({ message: 'Cards reordered' });
  } catch (err) {
    console.error('Card reorder error:', err);
    res.status(500).json({ message: (err as Error).message });
  }
});

app.put('/api/list-reorder', async (req, res) => {
  try {
    const { boardId, listIds } = req.body as { boardId: string; listIds: string[] };

    // Board access check — use boardId if provided, otherwise infer from first list
    if (boardId) {
      const access = await checkBoardAccess(boardId, req.userId!);
      if (!access) { res.status(404).json({ message: 'Board not found' }); return; }
    } else if (listIds.length > 0) {
      const list = await List.findById(listIds[0]);
      if (!list) { res.status(404).json({ message: 'List not found' }); return; }
      const access = await checkBoardAccess(list.boardId.toString(), req.userId!);
      if (!access) { res.status(404).json({ message: 'Board not found' }); return; }
    }

    const ops = listIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { position: index } },
      },
    }));
    await List.bulkWrite(ops);
    res.json({ message: 'Lists reordered' });
  } catch (err) {
    console.error('List reorder error:', err);
    res.status(500).json({ message: (err as Error).message });
  }
});

// Routes
app.use('/api/boards', boardRoutes);
app.use('/api/boards', boardMemberRoutes);
app.use('/api', listRoutes);
app.use('/api', cardRoutes);

app.use(errorHandler);

connectDB().then(async () => {
  // Backfill slugs for existing boards that don't have one
  const boardsWithoutSlug = await Board.find({ $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }] });
  for (const board of boardsWithoutSlug) {
    await board.save(); // triggers the pre-save hook which generates the slug
  }
  if (boardsWithoutSlug.length > 0) {
    console.log(`Generated slugs for ${boardsWithoutSlug.length} existing board(s)`);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
