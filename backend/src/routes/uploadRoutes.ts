import { Router } from 'express';
import multer from 'multer';
import { isAuthenticated } from '../middleware/auth';
import { uploadCsv } from '../controllers/uploadController';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Upload CSV route (requires authentication)
router.post('/csv', isAuthenticated, upload.single('file'), uploadCsv);

export default router;
