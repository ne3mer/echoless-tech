import Parser from 'rss-parser';
import BaseScraper from './BaseScraper.js';
import logger from '../utils/logger.js';
import { categorizeArticle } from '../utils/categorizer.js';

class TechCrunchScraper extends BaseScraper {
  constructor() {
    super('TechCrunch');
    this.rssUrl = 'https://techcrunch.com/feed/';
    this.parser = new Parser();
  }

  async scrape() {
    logger.info(`[${this.name}] Starting RSS fetch...`);
    try {
      const feed = await this.parser.parseURL(this.rssUrl);
      
      const articles = feed.items.map(item => {
        // TechCrunch RSS content: item.contentSnippet or item.content
        const content = item.contentSnippet || item.content || '';
        
        return {
          title: item.title,
          url: this.normalizeUrl(item.link),
          source: this.name,
          content: content,
          summary: content.substring(0, 300) + '...',
          imageUrl: null, // RSS often doesn't give clean images in standard fields, we rely on frontend placeholders or advanced extraction later if needed
          author: item.creator || 'TechCrunch Staff',
          publishedAt: new Date(item.pubDate),
          categories: categorizeArticle(item.title + ' ' + content)
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

export default TechCrunchScraper;
