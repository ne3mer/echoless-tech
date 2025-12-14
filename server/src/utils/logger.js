import winston from 'winston';

/**
 * Custom Log Format
 * Combines timestamp, log level, and message.
 * Colors are added for console output.
 */
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

/**
 * Application Logger
 * Uses Winston for structured logging capable of supporting different transports.
 * currently configured for Console output with colors.
 * 
 * @type {winston.Logger}
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'echoless-api' },
  transports: [
    // Console Transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    // File Transport (Optional/TODO: Add rotation for production)
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

export default logger;
