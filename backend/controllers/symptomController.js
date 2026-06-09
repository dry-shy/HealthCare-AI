import SymptomRecord from '../models/SymptomRecord.js';
import User from '../models/User.js';
import { analyzeSymptoms } from '../services/aiService.js';

// @desc    Create new symptom record
// @route   POST /api/symptoms
// @access  Private
export const createSymptomRecord = async (req, res) => {
    try {
        const { symptoms, overallFeeling, bodyTemperature, notes } = req.body;

        if (!symptoms || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one symptom'
            });
        }

        // Get user profile for context
        const user = await User.findById(req.user._id);
        const userProfile = {
            age: user.age,
            gender: user.gender,
            allergies: user.allergies,
            medicalConditions: user.medicalConditions
        };

        // Analyze symptoms with AI
        const analysis = await analyzeSymptoms(symptoms, userProfile);

        // Create symptom record
        const symptomRecord = await SymptomRecord.create({
            user: req.user._id,
            symptoms,
            overallFeeling,
            bodyTemperature,
            notes,
            analysis: {
                possibleConditions: analysis.possibleConditions || [],
                recommendations: analysis.recommendations || [],
                shouldSeeDoctor: analysis.shouldSeeDoctor || false,
                urgencyLevel: analysis.urgencyLevel || 'routine',
                suggestedSpecialist: analysis.suggestedSpecialist
            }
        });

        res.status(201).json({
            success: true,
            data: symptomRecord,
            disclaimer: 'This is AI-generated guidance only, not a medical diagnosis. Please consult a healthcare professional for proper evaluation.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all symptom records for user
// @route   GET /api/symptoms
// @access  Private
export const getSymptomRecords = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { startDate, endDate } = req.query;
        const query = { user: req.user._id, isArchived: false };

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const symptomRecords = await SymptomRecord.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SymptomRecord.countDocuments(query);

        res.json({
            success: true,
            data: symptomRecords,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single symptom record
// @route   GET /api/symptoms/:id
// @access  Private
export const getSymptomRecord = async (req, res) => {
    try {
        const symptomRecord = await SymptomRecord.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!symptomRecord) {
            return res.status(404).json({
                success: false,
                message: 'Symptom record not found'
            });
        }

        res.json({
            success: true,
            data: symptomRecord
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get symptom timeline
// @route   GET /api/symptoms/timeline
// @access  Private
export const getSymptomTimeline = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const timeline = await SymptomRecord.aggregate([
            {
                $match: {
                    user: req.user._id,
                    createdAt: { $gte: startDate },
                    isArchived: false
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    symptoms: { $push: '$symptoms' },
                    avgFeeling: { $avg: '$overallFeeling' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get most common symptoms
        const symptomCounts = await SymptomRecord.aggregate([
            {
                $match: {
                    user: req.user._id,
                    createdAt: { $gte: startDate },
                    isArchived: false
                }
            },
            { $unwind: '$symptoms' },
            {
                $group: {
                    _id: '$symptoms.name',
                    count: { $sum: 1 },
                    avgSeverity: { $avg: '$symptoms.severity' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                timeline,
                commonSymptoms: symptomCounts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update symptom record
// @route   PUT /api/symptoms/:id
// @access  Private
export const updateSymptomRecord = async (req, res) => {
    try {
        const { symptoms, overallFeeling, bodyTemperature, notes, medicinesTaken } = req.body;

        const symptomRecord = await SymptomRecord.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            {
                symptoms,
                overallFeeling,
                bodyTemperature,
                notes,
                medicinesTaken
            },
            { new: true, runValidators: true }
        );

        if (!symptomRecord) {
            return res.status(404).json({
                success: false,
                message: 'Symptom record not found'
            });
        }

        res.json({
            success: true,
            data: symptomRecord
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Archive symptom record
// @route   DELETE /api/symptoms/:id
// @access  Private
export const archiveSymptomRecord = async (req, res) => {
    try {
        const symptomRecord = await SymptomRecord.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isArchived: true },
            { new: true }
        );

        if (!symptomRecord) {
            return res.status(404).json({
                success: false,
                message: 'Symptom record not found'
            });
        }

        res.json({
            success: true,
            message: 'Symptom record archived successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get predefined symptoms list
// @route   GET /api/symptoms/list
// @access  Public
export const getPredefinedSymptoms = async (req, res) => {
    const symptoms = [
        { name: 'Headache', category: 'head' },
        { name: 'Fever', category: 'general' },
        { name: 'Cough', category: 'respiratory' },
        { name: 'Sore Throat', category: 'respiratory' },
        { name: 'Runny Nose', category: 'respiratory' },
        { name: 'Body Pain', category: 'musculoskeletal' },
        { name: 'Fatigue', category: 'general' },
        { name: 'Nausea', category: 'digestive' },
        { name: 'Vomiting', category: 'digestive' },
        { name: 'Diarrhea', category: 'digestive' },
        { name: 'Stomach Pain', category: 'digestive' },
        { name: 'Skin Rash', category: 'skin' },
        { name: 'Itching', category: 'skin' },
        { name: 'Swelling', category: 'general' },
        { name: 'Dizziness', category: 'neurological' },
        { name: 'Chest Pain', category: 'cardiovascular' },
        { name: 'Shortness of Breath', category: 'respiratory' },
        { name: 'Back Pain', category: 'musculoskeletal' },
        { name: 'Joint Pain', category: 'musculoskeletal' },
        { name: 'Insomnia', category: 'sleep' },
        { name: 'Anxiety', category: 'mental' },
        { name: 'Loss of Appetite', category: 'digestive' },
        { name: 'Eye Irritation', category: 'eye' },
        { name: 'Ear Pain', category: 'ear' },
        { name: 'Toothache', category: 'dental' }
    ];

    res.json({
        success: true,
        data: symptoms
    });
};

export default {
    createSymptomRecord,
    getSymptomRecords,
    getSymptomRecord,
    getSymptomTimeline,
    updateSymptomRecord,
    archiveSymptomRecord,
    getPredefinedSymptoms
};
