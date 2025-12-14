import axios from 'axios';
import BaseScraper from './BaseScraper.js';
import logger from '../utils/logger.js';
import { categorizeArticle } from '../utils/categorizer.js';

class DevToScraper extends BaseScraper {
  constructor() {
    super('Dev.to');
    this.baseUrl = 'https://dev.to/api/articles'; // Public API
  }

  async scrape() {
    logger.info(`[${this.name}] Starting scrape (API)...`);
    try {
      // Fetch top articles from the last few days
      const { data } = await axios.get(this.baseUrl, {
        params: {
            top: 1, // Start with top articles of the day
            per_page: 15
        }
      });

      const articles = data.map(item => ({
        title: item.title,
        url: item.url,
        source: this.name,
        content: item.description,
        summary: item.description || item.title,
        imageUrl: item.cover_image || item.social_image,
        author: item.user.name,
        publishedAt: new Date(item.published_at),
        categories: categorizeArticle(item.title + ' ' + item.tag_list.join(' '))
      }));

      logger.info(`[${this.name}] Found ${articles.length} articles.`);
      return articles;

    } catch (error) {
      logger.error(`[${this.name}] Scraping failed: ${error.message}`);
      return [];
    }
  }
}

export default DevToScraper;
