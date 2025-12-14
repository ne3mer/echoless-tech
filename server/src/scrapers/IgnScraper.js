import puppeteer from 'puppeteer';
import BaseScraper from './BaseScraper.js';
import logger from '../utils/logger.js';
import { categorizeArticle } from '../utils/categorizer.js';

class IgnScraper extends BaseScraper {
  constructor() {
    super('IGN');
    this.baseUrl = 'https://www.ign.com/news';
  }

  async scrape() {
    logger.info(`[${this.name}] Starting scrape (Puppeteer)...`);
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      // Set a real User Agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // IGN loads content dynamically, wait a bit or wait for specific selector
      // "section.main-content" or similar.
      await page.waitForSelector('a[href*="/articles/"]', { timeout: 10000 }).catch(() => {});

      const articles = await page.evaluate(() => {
        const results = [];
        const seen = new Set();
        
        // Find all links that look like articles
        const links = Array.from(document.querySelectorAll('a[href*="/articles/"]'));

        for (const link of links) {
          // Verify it's a real article link (often they have distinct classes or structures)
          // IGN article links usually are inside <h3> or have specific classes.
          // Let's try to get nearest parent container to find image/title.
          
          const url = link.href;
          if (seen.has(url)) continue;
          
          const title = link.innerText || link.getAttribute('aria-label') || '';
          if (!title || title.length < 10) continue; // Skip empty or short links (buttons)

          // Try to find an image nearby
          // Often the image is in a previous sibling or parent's sibling
          let imageUrl = null;
          // Simple heuristic: look for an img inside the same container (card)
          const card = link.closest('section') || link.closest('div'); 
          if (card) {
             const img = card.querySelector('img');
             if (img) imageUrl = img.src || img.srcset?.split(' ')[0];
          }

          seen.add(url);
          results.push({
            title: title.trim(),
            url,
            imageUrl,
            description: title.trim() // IGN feeds often don't show summary on the list easily without complexity
          });
        }
        return results.slice(0, 15); // Limit to 15
      });

      logger.info(`[${this.name}] Found ${articles.length} candidates.`);

      return articles.map(a => ({
        title: a.title,
        url: this.normalizeUrl(a.url),
        source: this.name,
        content: a.description,
        summary: a.description,
        imageUrl: a.imageUrl,
        author: 'IGN Staff',
        publishedAt: new Date(), // IGN list pages often rely on relative time "2h ago" which is hard to parse reliably in one go
        categories: categorizeArticle(a.title + ' ' + 'Gaming') // Force Gaming context
      }));

    } catch (error) {
      logger.error(`[${this.name}] Scraping failed: ${error.message}`);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}

export default IgnScraper;
