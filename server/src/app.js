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

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow any localhost
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

// Setup API Routes
import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes from './routes/userRoutes.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/users', userRoutes);

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
