import axios from 'axios';
import BaseScraper from './BaseScraper.js';
import logger from '../utils/logger.js';

class HackerNewsScraper extends BaseScraper {
  constructor() {
    super('Hacker News');
    // HN API endpoints
    this.topStoriesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';
    this.itemUrl = 'https://hacker-news.firebaseio.com/v0/item/';
  }

  async scrape() {
    logger.info(`[${this.name}] Starting API fetch...`);
    try {
      // 1. Get Top 50 Story IDs
      const { data: storyIds } = await axios.get(this.topStoriesUrl);
      const top50Ids = storyIds.slice(0, 30); // Limit to top 30 to stay real-time but light

      const articles = [];

      // 2. Fetch details for each story in parallel
      const storyPromises = top50Ids.map(id => 
        axios.get(`${this.itemUrl}${id}.json`).then(res => res.data)
      );
      
      const stories = await Promise.all(storyPromises);

      for (const story of stories) {
        if (!story || !story.url || story.type !== 'story') continue;

        articles.push({
          title: story.title,
          url: this.normalizeUrl(story.url),
          source: this.name,
          // HN doesn't have images/content in the API usually, we rely on the title + link
          content: story.text || '', 
          summary: `Discussion on Hacker News with ${story.score} points.`,
          imageUrl: null, // Frontend can show a placeholder or we can scrape og:image later
          author: story.by,
          publishedAt: new Date(story.time * 1000),
          categories: ['Tech', 'Discussion', 'Programming'],
          originalId: String(story.id)
        });
      }

      logger.info(`[${this.name}] Found ${articles.length} stories.`);
      return articles;

    } catch (error) {
      logger.error(`[${this.name}] API fetch failed: ${error.message}`);
      return [];
    }
  }
}

export default HackerNewsScraper;
