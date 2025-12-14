import Article from '../models/Article.js';
import logger from '../utils/logger.js';
import { categorizeArticle } from '../utils/categorizer.js';

/**
 * @desc    Get all articles with pagination, filtering, and search
 * @route   GET /api/v1/articles
 * @access  Public
 */
export const getArticles = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      source, 
      search 
    } = req.query;

    const query = {};

    // Filter by Category
    if (category) {
      query.categories = { $in: [category] };
    }

    // Filter by Source
    if (source) {
      query.source = source;
    }

    // Keyword Search (if text index exists, otherwise simple regex)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    const articles = await Article.find(query)
      .sort({ publishedAt: -1 }) // Newest first
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      meta: {
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single article by ID
 * @route   GET /api/v1/articles/:id
 * @access  Public
 */
export const getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (article) {
      res.json(article);
    } else {
      res.status(404);
      throw new Error('Article not found');
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
        res.status(404);
        return res.json({ error: 'Article not found' });
    }
    next(error);
  }
};

/**
 * @desc    Re-run categorization on all articles
 * @route   POST /api/v1/articles/recategorize
 * @access  Private (Admin)
 */
export const recategorizeAll = async (req, res, next) => {
  try {
    const articles = await Article.find({});
    let updatedCount = 0;

    for (const article of articles) {
      const text = `${article.title} ${article.summary || ''}`;
      const newCategories = categorizeArticle(text);
      
      article.categories = newCategories;
      await article.save();
      updatedCount++;
    }

    logger.info(`Re-categorized ${updatedCount} articles.`);
    res.json({ message: `Successfully re-categorized ${updatedCount} articles.` });
  } catch (error) {
    next(error);
  }
};
