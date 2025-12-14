import Parser from 'rss-parser';
import BaseScraper from './BaseScraper.js';
import logger from '../utils/logger.js';
import { categorizeArticle } from '../utils/categorizer.js';

class TheVergeScraper extends BaseScraper {
  constructor() {
    super('The Verge');
    this.rssUrl = 'https://www.theverge.com/rss/index.xml';
    this.parser = new Parser();
  }

  async scrape() {
    logger.info(`[${this.name}] Starting RSS fetch...`);
    try {
      const feed = await this.parser.parseURL(this.rssUrl);
      
      const articles = feed.items.map(item => {
        const content = item.contentSnippet || '';
        
        // The Verge RSS is pretty standard
        
        return {
          title: item.title,
          url: this.normalizeUrl(item.link),
          source: this.name,
          content: content,
          summary: content,
          imageUrl: null, // Reliably getting high-res images from RSS is tough without parsing the HTML content field
          author: item.creator || 'The Verge',
          publishedAt: new Date(item.pubDate),
          categories: categorizeArticle(item.title)
        };
      });

      logger.info(`[${this.name}] Found ${articles.length} articles via RSS.`);
      return articles;

    } catch (error) {
      logger.error(`[${this.name}] RSS Scraping failed: ${error.message}`);
      return [];
    }
  }
}

export default TheVergeScraper;
