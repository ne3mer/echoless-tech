import axios from 'axios';
import * as cheerio from 'cheerio';
import BaseScraper from './BaseScraper.js';
import logger from '../utils/logger.js';

class TechCrunchScraper extends BaseScraper {
  constructor() {
    super('TechCrunch');
    this.baseUrl = 'https://techcrunch.com';
  }

  async scrape() {
    logger.info(`[${this.name}] Starting scrape...`);
    try {
      // TechCrunch latest news endpoint or HTML page
      const { data } = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const $ = cheerio.load(data);
      const articles = [];

      // Select article cards (Selectors need to be updated if TechCrunch changes UI)
      // As of Late 2024/Early 2025, loop-card is a common class or a semantic <article>
      $('.loop-card').each((i, el) => {
        // Limit to top 20 to avoid overloading
        if (i >= 20) return false;

        const titleParams = $(el).find('.loop-card__title-link');
        const title = titleParams.text().trim();
        const rawUrl = titleParams.attr('href');
        
        let imageUrl = $(el).find('img').attr('src');
        
        // Sometimes content is in a description tag
        const description = $(el).find('.loop-card__content').text().trim();
        const author = $(el).find('.loop-card__author').text().trim();
        const dateStr = $(el).find('time').attr('datetime');

        if (title && rawUrl) {
          articles.push({
            title,
            url: this.normalizeUrl(rawUrl),
            source: this.name,
            content: description || '', // Initial content is just the snippet
            summary: description || '',
            imageUrl: imageUrl || null,
            author: author || 'TechCrunch Staff',
            publishedAt: dateStr ? new Date(dateStr) : new Date(),
            categories: ['Tech', 'Startup']
          });
        }
      });

      logger.info(`[${this.name}] Found ${articles.length} articles.`);
      return articles;

    } catch (error) {
      logger.error(`[${this.name}] Scraping failed: ${error.message}`);
      return [];
    }
  }
}

export default TechCrunchScraper;
