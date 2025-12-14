import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import logger from '../utils/logger.js';

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} - Signed JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_prod', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    // 1. Validate Input
    const validatedData = registerSchema.parse(req.body);
    const { username, email, password } = validatedData;

    // 2. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // 3. Create User (Password hashing handled in Model hook)
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      logger.info(`New user registered: ${user.email}`);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      res.status(400);
       // Return first validation error message
      return res.json({ error: error.errors[0].message });
    }
    next(error);
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    // 1. Validate Input
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // 2. Find User
    const user = await User.findOne({ email }).select('+password');

    // 3. Check specific field existence to avoid ambiguity
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      res.status(400);
      return res.json({ error: error.errors[0].message });
    }
    next(error);
  }
};
