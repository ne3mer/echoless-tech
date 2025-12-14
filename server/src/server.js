import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import logger from './utils/logger.js';

// Load Environment Variables
dotenv.config();

/**
 * Start Server
 * 
 * 1. Connect to Database
 * 2. Start Express Server
 * 3. Initialize Cron Jobs (TODO)
 */
const startServer = async () => {
  try {
    // Connect to Data Layer
    await connectDB();

    // Start Listening
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info(`
      ################################################
      🚀 Server listening on port: ${PORT}
      🛠  Environment: ${process.env.NODE_ENV || 'development'}
      ################################################
      `);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
