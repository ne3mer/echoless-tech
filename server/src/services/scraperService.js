import Article from '../models/Article.js';
import TechCrunchScraper from '../scrapers/TechCrunchScraper.js';
import HackerNewsScraper from '../scrapers/HackerNewsScraper.js';
import IgnScraper from '../scrapers/IgnScraper.js';
import TheVergeScraper from '../scrapers/TheVergeScraper.js';
import DevToScraper from '../scrapers/DevToScraper.js';
import logger from '../utils/logger.js';
import { categorizeArticle } from '../utils/categorizer.js';

class ScraperService {
  constructor() {
    this.scrapers = [
      new TechCrunchScraper(),
      new HackerNewsScraper(),
      new IgnScraper(),
      new TheVergeScraper(),
      new DevToScraper()
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

    let totalNew = 0;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const savedCount = await this.saveArticles(result.value);
        totalNew += savedCount;
      } else {
        logger.error(`Scraper failed: ${result.reason}`);
      }
    }

    logger.info(`✅ Global scrape job finished. Saved ${totalNew} new articles.`);
  }

  /**
   * Process a batch of articles: Deduplicate, Categorize and Save
   * @param {Array} articles 
   * @returns {Promise<number>} count of saved articles
   */
  async saveArticles(articles) {
    let savedCount = 0;

    for (const articleData of articles) {

       // 1. Check Deduplication
       const existingUrl = await Article.findOne({ url: articleData.url });
       if (existingUrl) continue;
 
       // 2. Auto-Categorize (Centralized Logic)
       const textToAnalyze = `${articleData.title} ${articleData.summary || ''} ${articleData.description || ''}`;
       const categories = categorizeArticle(textToAnalyze);

      // 3. Save new Unique Article
      try {
        await Article.create({
            ...articleData,
            categories: categories
        });
        savedCount++;
      } catch (err) {
        // Ignore duplicate key errors silently (as we checked above, but race conditions exist)
        if (err.code !== 11000) {
             logger.error(`Failed to save article "${articleData.title}": ${err.message}`);
        }
      }
    }

    return savedCount;
  }
}

export default new ScraperService();
