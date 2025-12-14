/**
 * Base Scraper Class
 * All specific site scrapers must extend this class.
 */
class BaseScraper {
  constructor(name) {
    if (this.constructor === BaseScraper) {
      throw new Error("Abstract class 'BaseScraper' cannot be instantiated directly.");
    }
    this.name = name;
  }

  /**
   * Main scrape method to be implemented by subclasses.
   * Should return an array of standardized article objects.
   * @returns {Promise<Array<{title: string, url: string, content: string, ...}>>}
   */
  async scrape() {
    throw new Error("Method 'scrape()' must be implemented.");
  }

  /**
   * Helper to normalize URLs (remove query params, utm tags, etc.)
   * @param {string} url 
   * @returns {string}
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remove common tracking parameters
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'rss'];
      paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
}

export default BaseScraper;
