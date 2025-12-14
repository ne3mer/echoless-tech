import cron from 'node-cron';
import scraperService from '../services/scraperService.js';
import logger from '../utils/logger.js';

/**
 * Initialize System Cron Jobs
 */
export const initCronJobs = () => {
  logger.info('⏳ Initializing Cron Jobs...');

  // 1. High Frequency (Every 5 mins): TechCrunch, Hacker News
  cron.schedule('*/5 * * * *', async () => {
    logger.info('⏰ Executing High-Frequency Scrape (5m)...');
    await scraperService.scrapeSources(['TechCrunch', 'Hacker News']);
  });

  // 2. Medium Frequency (Every 15 mins): IGN, The Verge
  cron.schedule('*/15 * * * *', async () => {
    logger.info('⏰ Executing Medium-Frequency Scrape (15m)...');
    await scraperService.scrapeSources(['IGN', 'The Verge']);
  });

  // 3. Low Frequency (Every 60 mins): Dev.to
  cron.schedule('0 * * * *', async () => {
    logger.info('⏰ Executing Low-Frequency Scrape (60m)...');
    await scraperService.scrapeSources(['Dev.to']);
  });
  
  // Run everything immediately on startup in development
  if (process.env.NODE_ENV !== 'production') {
    logger.info('🚀 Dev Mode: Running immediate global scrape...');
    scraperService.scrapeAll(); 
  }
};
