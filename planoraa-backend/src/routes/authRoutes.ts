import express from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    validate,
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  login
);

// Refresh token
router.post('/refresh-token', refreshToken);

// Get profile (protected)
router.get('/profile', authenticate, getProfile);

// Update profile (protected)
router.put('/profile', authenticate, updateProfile);

export default router;
