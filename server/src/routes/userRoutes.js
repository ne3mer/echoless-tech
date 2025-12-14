import express from 'express';
import { getUserProfile, getUserActivity } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.get('/activity', protect, getUserActivity);

export default router;
