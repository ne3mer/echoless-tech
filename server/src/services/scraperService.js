import he from 'he';
import striptags from 'striptags';
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
    return this.scrapeSources(); // Delegate to scrapeSources
  }

  /**
   * Run specific scrapers by name
   * @param {string[]} [sourceNames] - Array of source names to scrape. If empty, scrapes all.
   */
  async scrapeSources(sourceNames = []) {
    const targets = sourceNames.length > 0 
        ? this.scrapers.filter(s => sourceNames.includes(s.name))
        : this.scrapers;

    if (targets.length === 0) {
        logger.warn(`No scrapers found matching: ${sourceNames.join(', ')}`);
        return;
    }

    logger.info(`🚀 Starting scrape job for: ${targets.map(s => s.name).join(', ')}...`);
    
    const results = await Promise.allSettled(
      targets.map(scraper => scraper.scrape())
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

// Imports moved to top
    logger.info(`✅ Scrape job finished. Saved ${totalNew} new articles.`);
  }

  // ... (CleanArticleData continues below)

  /**
   * Cleans and sanitizes article data
   * @param {Object} articleData 
   * @returns {Object} cleaned article data
   */
  cleanArticleData(articleData) {
    let cleanTitle = he.decode(articleData.title || '').trim();
    
    // Clean Summary
    let cleanSummary = articleData.summary || articleData.content || '';
    
    // 1. Decode HTML entities
    cleanSummary = he.decode(cleanSummary);
    
    // 2. Strip HTML tags
    cleanSummary = striptags(cleanSummary);
    
    // 3. Remove common junk phrases
    const junkPhrases = [
       /Read the full story at.*/i,
       /Continue reading.*/i,
       /appeared first on.*/i,
       /The post.*appeared first.*/i,
       /Copyright.*/i
    ];
    
    junkPhrases.forEach(regex => {
        cleanSummary = cleanSummary.replace(regex, '');
    });

    // 4. Clean up truncation/whitespace
    cleanSummary = cleanSummary.trim();
    
    // Remove trailing specific words often found in RSS
    if (cleanSummary.endsWith('...')) {
        // Keep it if it looks like a real truncation
    }

    return {
        ...articleData,
        title: cleanTitle,
        summary: cleanSummary
    };
  }

  /**
   * Process a batch of articles: Deduplicate, Categorize and Save
   * @param {Array} articles 
   * @returns {Promise<number>} count of saved articles
   */
  async saveArticles(articles) {
    let savedCount = 0;

    for (const rawData of articles) {
       // Clean the data first
       const articleData = this.cleanArticleData(rawData);

       // 1. Check Deduplication
       const existingUrl = await Article.findOne({ url: articleData.url });
       if (existingUrl) continue;
 
       // 2. Auto-Categorize (Centralized Logic)
       // Use cleaned title/summary for better categorization
       const textToAnalyze = `${articleData.title} ${articleData.summary || ''}`;
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
