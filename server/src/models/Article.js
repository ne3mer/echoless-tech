import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true // Indexed for frequent searching/deduplication
  },
  url: {
    type: String,
    required: true,
    unique: true, // Hard constraint for exact URL matches
    trim: true
  },
  source: {
    type: String,
    required: true,
    index: true // Indexed for filtering by source
  },
  author: {
    type: String,
    default: 'Unknown'
  },
  content: {
    type: String, // Full HTML or text content
  },
  summary: {
    type: String, // The "Unique Echoless Summary"
    required: false
  },
  imageUrl: {
    type: String,
    default: null
  },
  publishedAt: {
    type: Date,
    default: Date.now,
    index: true // Indexed for sorting by newest
  },
  categories: [{
    type: String,
    trim: true
  }],
  // Metadata for the scraper engine
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  originalId: {
    type: String, // ID from the remote source if available
  }
}, {
  timestamps: true
});

// Compound index for fuzzy deduplication optimization (optional but good for future)
articleSchema.index({ title: 'text' }); 

const Article = mongoose.model('Article', articleSchema);
export default Article;
