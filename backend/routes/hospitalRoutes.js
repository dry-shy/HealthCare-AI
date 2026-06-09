import express from 'express';
import {
    getNearbyHospitals,
    getHospitalDetails,
    getEmergencyContacts,
    getSpecialists
} from '../controllers/hospitalController.js';

const router = express.Router();

// All public routes
router.get('/nearby', getNearbyHospitals);
router.get('/emergency', getEmergencyContacts);
router.get('/specialists', getSpecialists);
router.get('/:id', getHospitalDetails);

export default router;
