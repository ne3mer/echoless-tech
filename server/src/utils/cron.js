import cron from 'node-cron';
import scraperService from '../services/scraperService.js';
import logger from '../utils/logger.js';

/**
 * Initialize System Cron Jobs
 */
export const initCronJobs = () => {
  logger.info('⏳ Initializing Cron Jobs...');

  // Schedule: Every hour at minute 0 (0 * * * *)
  cron.schedule('0 * * * *', async () => {
    logger.info('⏰ Executing scheduled hourly scrape...');
    await scraperService.scrapeAll();
  });
  
  // Run immediately on startup in development to populate data
  if (process.env.NODE_ENV !== 'production') {
    logger.info('🚀 Dev Mode: Running immediate scrape...');
    scraperService.scrapeAll(); 
  }
};
