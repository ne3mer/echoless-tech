import express from 'express';
import { getArticles, getArticleById } from '../controllers/articleController.js';
import { addComment, getComments } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getArticles);
router.get('/:id', getArticleById);

// Comment Routes (Nested under articles)
router.route('/:articleId/comments')
  .get(getComments)
  .post(protect, addComment);

export default router;
