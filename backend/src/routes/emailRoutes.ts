import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { validateScheduleEmail, validateGetEmails } from '../middleware/validators';
import {
  scheduleEmails,
  getEmails,
  getEmailStats,
  cancelBatch,
} from '../controllers/emailController';

const router = Router();

// All email routes require authentication
router.use(isAuthenticated);

// Schedule emails
router.post('/schedule', validateScheduleEmail, scheduleEmails);

// Get emails with optional filters
router.get('/', validateGetEmails, getEmails);

// Get email statistics
router.get('/stats', getEmailStats);

// Cancel a batch of emails
router.delete('/batch/:batchId', cancelBatch);

export default router;
