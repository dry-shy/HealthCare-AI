import express from 'express';
import {
    getDashboard,
    getHealthHistory,
    exportData,
    deleteAllData,
    getInsights
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getDashboard);
router.get('/history', getHealthHistory);
router.get('/export', exportData);
router.get('/insights', getInsights);
router.delete('/data', deleteAllData);

export default router;
