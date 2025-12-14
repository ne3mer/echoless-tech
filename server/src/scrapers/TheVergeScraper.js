import axios from 'axios';
import * as cheerio from 'cheerio';
import BaseScraper from './BaseScraper.js';
import logger from '../utils/logger.js';
import { categorizeArticle } from '../utils/categorizer.js';

class TheVergeScraper extends BaseScraper {
  constructor() {
    super('The Verge');
    this.baseUrl = 'https://www.theverge.com/tech';
  }

  async scrape() {
    logger.info(`[${this.name}] Starting scrape...`);
    try {
      const { data } = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EcholessBot/1.0;)'
        }
      });

      const $ = cheerio.load(data);
      const articles = [];

      // The Verge structure changes, but generally article blocks are identifiable
      // Looking for standard 'h2 a' patterns in their feed
      $('h2 a').each((i, el) => {
        if (i >= 15) return false; // Limit

        const title = $(el).text().trim();
        const rawUrl = $(el).attr('href');
        
        if (!title || !rawUrl) return;

        const fullUrl = this.normalizeUrl(rawUrl, 'https://www.theverge.com');
        
        // Use parent finding to locate image and time if possible
        const parentBlock = $(el).closest('div, article');
        /* 
           The Verge uses complex picture tags. 
           We attempt to find an img `src` or `srcset`.
        */
        const img = parentBlock.find('img').first();
        const imageUrl = img.attr('src');
        
        const timeEl = parentBlock.find('time');
        const pubDate = timeEl.attr('datetime') || new Date();

        articles.push({
          title,
          url: fullUrl,
          source: this.name,
          content: title, // Summary is hard to extract reliably from titles-only feed
          summary: title,
          imageUrl: imageUrl || null,
          author: 'The Verge Staff',
          publishedAt: new Date(pubDate),
          categories: categorizeArticle(title)
        });
      });

      logger.info(`[${this.name}] Found ${articles.length} articles.`);
      return articles;

    } catch (error) {
      logger.error(`[${this.name}] Scraping failed: ${error.message}`);
      return [];
    }
  }
}

export default TheVergeScraper;
