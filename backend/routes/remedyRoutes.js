import express from 'express';
import {
    getRemedies,
    getRemedy,
    getRemediesByCondition,
    getAIRemedies,
    getCategories,
    rateRemedy,
    seedRemedies
} from '../controllers/remedyController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/', getRemedies);
router.get('/condition/:condition', getRemediesByCondition);
router.post('/ai', optionalAuth, getAIRemedies);
router.get('/:id', getRemedy);

// Protected routes
router.post('/:id/rate', protect, rateRemedy);
router.post('/seed', seedRemedies); // Should be admin only in production

export default router;
