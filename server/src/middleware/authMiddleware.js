import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect Middleware
 * Verifies JWT token and attaches user to request object.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_do_not_use_prod');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      const err = new Error('Not authorized, token failed');
      // Pass to global error handler but enforce 401
      err.statusCode = 401; 
      next(err);
    }
  }

  if (!token) {
    res.status(401);
    const err = new Error('Not authorized, no token');
    err.statusCode = 401;
    next(err);
  }
};
