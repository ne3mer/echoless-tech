import User from '../models/User.js';
import Comment from '../models/Comment.js';

/**
 * @desc    Get current user profile with stats
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Calculate Stats (Karma = Total score of all comments)
    // This could be optimized with aggregation for large datasets
    const comments = await Comment.find({ user: req.user._id });
    const totalComments = comments.length;
    
    const karma = comments.reduce((acc, comment) => {
        return acc + (comment.score || 0);
    }, 0);

    // Get Vote Stats (How many times I have upvoted/downvoted) - Optional but fun
    const upvotesGiven = await Comment.countDocuments({ upvotes: req.user._id });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      stats: {
        totalComments,
        karma,
        upvotesGiven
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's recent activity (Comments)
 * @route   GET /api/v1/users/activity
 * @access  Private
 */
export const getUserActivity = async (req, res, next) => {
    try {
        const comments = await Comment.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('article', 'title url source') // Show where the comment was posted
            .populate('parentComment', 'user'); // Context if it was a reply

        res.json(comments);
    } catch (error) {
        next(error);
    }
};
