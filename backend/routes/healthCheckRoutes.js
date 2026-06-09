import express from 'express';
import {
    analyzeImage,
    getHealthChecks,
    getHealthCheck,
    addFollowUp,
    archiveHealthCheck,
    getStats
} from '../controllers/healthCheckController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadImage, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Stats route (must be before /:id)
router.get('/stats', getStats);

// CRUD routes
router.post('/analyze', uploadImage.single('image'), handleUploadError, analyzeImage);
router.get('/', getHealthChecks);
router.get('/:id', getHealthCheck);
router.put('/:id/followup', addFollowUp);
router.delete('/:id', archiveHealthCheck);

export default router;
