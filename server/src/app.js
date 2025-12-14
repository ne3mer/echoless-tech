import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './utils/logger.js';

/**
 * Initialize Express Application
 * Configures middleware, security headers, and base routes.
 */
const app = express();

// =========================================
// Middleware Configuration
// =========================================

// 1. Security Headers (Helmet)
// Sets various HTTP headers to secure the app
app.use(helmet());

// 2. CORS (Cross-Origin Resource Sharing)
// Allows the frontend to communicate with the backend
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Restrict this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// 3. Request Logging (Morgan)
// Pipes morgan logs to our custom Winston logger
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// 4. Body Parsing
// Parse incoming JSON payloads and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================
// Routes
// =========================================

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup API Routes (Placeholder for now)
// import apiRoutes from './routes/index.js';
// app.use('/api/v1', apiRoutes);

// =========================================
// Error Handling
// =========================================

// 404 Handler
app.use((req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

export default app;
