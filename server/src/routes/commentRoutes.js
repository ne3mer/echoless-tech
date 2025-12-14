import express from 'express';
import { voteComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Direct comment operations (ID based)
router.post('/:id/vote', protect, voteComment);
router.delete('/:id', protect, deleteComment);

export default router;
