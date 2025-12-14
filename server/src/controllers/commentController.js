import Comment from '../models/Comment.js';

/**
 * @desc    Add a comment or reply
 * @route   POST /api/v1/articles/:articleId/comments
 */
export const addComment = async (req, res, next) => {
  try {
    const { content, parentComment } = req.body;
    const { articleId } = req.params;

    const comment = await Comment.create({
      content,
      article: articleId,
      user: req.user._id,
      parentComment: parentComment || null
    });

    const populatedComment = await Comment.findById(comment._id).populate('user', 'username');

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comments for an article (Threaded)
 * @route   GET /api/v1/articles/:articleId/comments
 */
export const getComments = async (req, res, next) => {
  try {
    // Fetch only top-level comments (parentComment: null)
    // and populate their replies recursively (up to reasonable depth or via client expanding)
    // For simplicity with Mongoose virtuals, we fetch top-level and populate 'replies'
    const comments = await Comment.find({ 
        article: req.params.articleId, 
        parentComment: null 
    })
    .populate('user', 'username')
    .populate({
        path: 'replies',
        populate: { path: 'user', select: 'username' } // Level 1 replies
    })
    .sort({ createdAt: -1 }); // Newest first

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Vote on a comment
 * @route   POST /api/v1/comments/:id/vote
 */
export const voteComment = async (req, res, next) => {
    try {
        const { type } = req.body; // 'upvote' or 'downvote'
        const comment = await Comment.findById(req.params.id);
        const userId = req.user._id;

        if (!comment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        // Logic to toggle votes
        const isUpvoted = comment.upvotes.includes(userId);
        const isDownvoted = comment.downvotes.includes(userId);

        if (type === 'upvote') {
            if (isUpvoted) {
                // Remove upvote
                comment.upvotes.pull(userId);
            } else {
                // Add upvote, remove downvote if exists
                comment.upvotes.push(userId);
                comment.downvotes.pull(userId);
            }
        } else if (type === 'downvote') {
             if (isDownvoted) {
                // Remove downvote
                comment.downvotes.pull(userId);
            } else {
                // Add downvote, remove upvote if exists
                comment.downvotes.push(userId);
                comment.upvotes.pull(userId);
            }
        }

        // Recalculate score
        comment.score = comment.upvotes.length - comment.downvotes.length;
        await comment.save();

        res.json(comment);

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/v1/comments/:id
 */
export const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        // Check permission: Owner or Admin
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to delete this comment');
        }

        // Also delete replies? ideally yes, or mark as deleted. For now, strict delete.
        await Comment.deleteMany({ parentComment: comment._id });
        await comment.deleteOne();

        res.json({ message: 'Comment removed' });
    } catch (error) {
        next(error);
    }
};
