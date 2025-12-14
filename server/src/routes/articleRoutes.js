import express from 'express';
import { getArticles, getArticleById, recategorizeAll } from '../controllers/articleController.js';
import { addComment, getComments } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/recategorize', recategorizeAll); // Internal/Admin Use
router.get('/', getArticles);
router.get('/:id', getArticleById);

// Comment Routes (Nested under articles)
router.route('/:articleId/comments')
  .get(getComments)
  .post(protect, addComment);

export default router;
