import express from 'express';
import {
    createSymptomRecord,
    getSymptomRecords,
    getSymptomRecord,
    getSymptomTimeline,
    updateSymptomRecord,
    archiveSymptomRecord,
    getPredefinedSymptoms
} from '../controllers/symptomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/list', getPredefinedSymptoms);

// Protected routes
router.use(protect);
router.get('/timeline', getSymptomTimeline);
router.route('/')
    .get(getSymptomRecords)
    .post(createSymptomRecord);
router.route('/:id')
    .get(getSymptomRecord)
    .put(updateSymptomRecord)
    .delete(archiveSymptomRecord);

export default router;
