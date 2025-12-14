import Parser from 'rss-parser';
import BaseScraper from './BaseScraper.js';
import logger from '../utils/logger.js';
import { categorizeArticle } from '../utils/categorizer.js';

class IgnScraper extends BaseScraper {
  constructor() {
    super('IGN');
    this.rssUrl = 'https://feeds.ign.com/ign/news';
    this.parser = new Parser();
  }

  async scrape() {
    logger.info(`[${this.name}] Starting RSS fetch...`);
    try {
      const feed = await this.parser.parseURL(this.rssUrl);
      
      const articles = feed.items.map(item => {
        const content = item.contentSnippet || item.content || '';
        
        // IGN RSS often puts the image in the 'enclosure' or separate media tag
        // rss-parser might treat it as 'enclosure'
        let imageUrl = null;
        if (item.enclosure && item.enclosure.url) {
            imageUrl = item.enclosure.url;
        }

        return {
          title: item.title,
          url: this.normalizeUrl(item.link),
          source: this.name,
          content: content,
          summary: content,
          imageUrl: imageUrl, 
          author: 'IGN Staff',
          publishedAt: new Date(item.pubDate),
          categories: categorizeArticle(item.title + ' Gaming') // Hinting Gaming
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

export default IgnScraper;
