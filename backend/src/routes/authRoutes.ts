import { Router } from 'express';
import {
  googleAuth,
  googleAuthCallback,
  logout,
  getCurrentUser,
} from '../controllers/authController';

const router = Router();

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

// Logout
router.post('/logout', logout);

// Get current user
router.get('/me', getCurrentUser);

export default router;
