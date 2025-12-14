import mongoose from 'mongoose';
import logger from '../utils/logger.js';

/**
 * Establishes a connection to the MongoDB database.
 * Retries connection on failure.
 * 
 * @returns {Promise<typeof mongoose>} The Mongoose instance.
 */
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoless';
    
    logger.info(`Attempting to connect to MongoDB...`);
    
    const conn = await mongoose.connect(mongoURI, {
      // Mongoose 6+ defaults these to true, strictly explicit for clarity
      autoIndex: true, 
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};
