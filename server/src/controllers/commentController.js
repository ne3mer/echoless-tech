import Comment from '../models/Comment.js';
import Article from '../models/Article.js';
import logger from '../utils/logger.js';

/**
 * @desc    Add a comment to an article
 * @route   POST /api/v1/articles/:articleId/comments
 * @access  Private
 */
export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { articleId } = req.params;

    // 1. Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }

    // 2. Create Comment
    const comment = await Comment.create({
      content,
      article: articleId,
      user: req.user._id, // Assumes 'protect' middleware is used
    });

    // 3. Populate user info for immediate return
    await comment.populate('user', 'username');

    logger.info(`New comment by ${req.user.username} on article ${articleId}`);
    
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comments for an article
 * @route   GET /api/v1/articles/:articleId/comments
 * @access  Public
 */
export const getComments = async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const comments = await Comment.find({ article: articleId })
      .populate('user', 'username')
      .sort({ createdAt: -1 }); // Newest first

    res.json(comments);
  } catch (error) {
    next(error);
  }
};
