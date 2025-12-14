import Article from '../models/Article.js';
import TechCrunchScraper from '../scrapers/TechCrunchScraper.js';
import logger from '../utils/logger.js';

class ScraperService {
  constructor() {
    this.scrapers = [
      new TechCrunchScraper(),
      // Add other scrapers here later (TheVerge, HackerNews, etc.)
    ];
  }

  /**
   * Run all scrapers in parallel
   */
  async scrapeAll() {
    logger.info('🚀 Starting global scrape job...');
    
    const results = await Promise.allSettled(
      this.scrapers.map(scraper => scraper.scrape())
    );

    let totalNewArticles = 0;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const articles = result.value;
        const savedCount = await this.processArticles(articles);
        totalNewArticles += savedCount;
      }
    }

    logger.info(`✅ Global scrape job finished. Saved ${totalNewArticles} new articles.`);
  }

  /**
   * Process a batch of articles: Deduplicate and Save
   * @param {Array} articles 
   * @returns {Promise<number>} count of saved articles
   */
  async processArticles(articles) {
    let savedCount = 0;

    for (const articleData of articles) {
      // 1. Check exact URL Match
      const existingUrl = await Article.findOne({ url: articleData.url });
      if (existingUrl) continue;

      // 2. Check Fuzzy Title Match (Simple implementation for now)
      // Prevent saving "iPhone 15 released" if "Apple releases iPhone 15" exists from same day
      // For now, we rely on exact URL or very close title matches to be safe.
      const existingTitle = await Article.findOne({ 
        title: articleData.title 
      });
      if (existingTitle) continue;

      // 3. Save new Unique Article
      try {
        await Article.create(articleData);
        savedCount++;
      } catch (err) {
        logger.error(`Failed to save article "${articleData.title}": ${err.message}`);
      }
    }

    return savedCount;
  }
}

export default new ScraperService();
