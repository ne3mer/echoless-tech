import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from '../models/Article.js';
import logger from '../utils/logger.js';

dotenv.config();

const resetDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/echoless');
    logger.info('Connected to MongoDB.');

    const result = await Article.deleteMany({});
    logger.info(`Deleted ${result.deletedCount} articles.`);

    const commentsResult = await mongoose.connection.collection('comments').deleteMany({});
    logger.info(`Deleted ${commentsResult.deletedCount || 0} comments.`);

    if (process.env.CLEAR_USERS === 'true') {
        // Optional: Clear users
        // await mongoose.connection.collection('users').deleteMany({});
    }

    logger.info('Database reset complete.');
    process.exit(0);
  } catch (error) {
    logger.error(`Error resetting DB: ${error.message}`);
    process.exit(1);
  }
};

resetDb();
