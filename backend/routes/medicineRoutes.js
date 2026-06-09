import express from 'express';
import { chat } from '../controllers/medicineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
// router.get('/otc', getOTCInfo);
// router.get('/telemedicine', getTelemedicineInfo);

// // Protected routes
// router.post('/advice', protect, getMedicineRecommendation);
router.post('/chat', chat);

export default router;
