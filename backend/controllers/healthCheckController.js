import HealthCheck from '../models/HealthCheck.js';
import { analyzeHealthImage } from '../services/aiService.js';
import path from 'path';
import fs from 'fs';

// @desc    Upload and analyze health image
// @route   POST /api/health-check/analyze
// @access  Private
export const analyzeImage = async (req, res) => {
    let uploadedImageUrl = null;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        const { description, imageType } = req.body;

        const uploadsDir = path.join(process.cwd(), 'uploads', req.user._id.toString());
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `health-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, req.file.buffer);
        uploadedImageUrl = `/uploads/${req.user._id}/${filename}`;

        // Analyze image with AI via GROQ
        const analysis = await analyzeHealthImage(uploadedImageUrl, description);

        // Create health check record - store URL in DB
        const healthCheck = await HealthCheck.create({
            user: req.user._id,
            imagePath: uploadedImageUrl,
            imageType: imageType || 'other',
            userDescription: description,
            analysis: {
                possibleCauses: analysis.possibleCauses || [],
                severityLevel: analysis.severityLevel || 'mild',
                severityScore: analysis.severityScore || 3,
                advice: analysis.advice || analysis.recommendedActions || [],
                shouldSeeDoctor: analysis.shouldSeeDoctor || false,
                urgencyNote: analysis.urgencyNote,
                homeRemedySuggestions: analysis.homeRemedySuggestions || [],
                warningSignsToWatch: analysis.warningSignsToWatch || [],
                symptoms: analysis.symptoms || [],
                medicine: analysis.medicine || [],
                recommendedActions: analysis.recommendedActions || [],
                analysisStatus: analysis.analysisStatus || 'valid',
                analysisMessage: analysis.message || ''
            }
        });

        res.status(201).json({
            success: true,
            data: healthCheck,
            imageUrl: uploadedImageUrl,
            disclaimer: 'This is AI-generated guidance only, not a medical diagnosis. Please consult a healthcare professional for proper evaluation and treatment.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all health checks for user
// @route   GET /api/health-check
// @access  Private
export const getHealthChecks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { user: req.user._id, isArchived: false };

        if (req.query.severity) {
            query['analysis.severityLevel'] = req.query.severity;
        }

        const healthChecks = await HealthCheck.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await HealthCheck.countDocuments(query);

        res.json({
            success: true,
            data: healthChecks,
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

// @desc    Get single health check
// @route   GET /api/health-check/:id
// @access  Private
export const getHealthCheck = async (req, res) => {
    try {
        const healthCheck = await HealthCheck.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!healthCheck) {
            return res.status(404).json({
                success: false,
                message: 'Health check not found'
            });
        }

        res.json({
            success: true,
            data: healthCheck
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add follow-up to health check
// @route   PUT /api/health-check/:id/followup
// @access  Private
export const addFollowUp = async (req, res) => {
    try {
        const { followUpDate, notes } = req.body;

        const healthCheck = await HealthCheck.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            {
                'followUp.isFollowUpNeeded': true,
                'followUp.followUpDate': followUpDate,
                'followUp.followUpNotes': notes
            },
            { new: true }
        );

        if (!healthCheck) {
            return res.status(404).json({
                success: false,
                message: 'Health check not found'
            });
        }

        res.json({
            success: true,
            data: healthCheck
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Archive health check
// @route   DELETE /api/health-check/:id
// @access  Private
export const archiveHealthCheck = async (req, res) => {
    try {
        const healthCheck = await HealthCheck.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isArchived: true },
            { new: true }
        );

        if (!healthCheck) {
            return res.status(404).json({
                success: false,
                message: 'Health check not found'
            });
        }

        res.json({
            success: true,
            message: 'Health check archived successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get health check statistics
// @route   GET /api/health-check/stats
// @access  Private
export const getStats = async (req, res) => {
    try {
        const stats = await HealthCheck.aggregate([
            { $match: { user: req.user._id, isArchived: false } },
            {
                $group: {
                    _id: '$analysis.severityLevel',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalChecks = await HealthCheck.countDocuments({
            user: req.user._id,
            isArchived: false
        });

        const recentChecks = await HealthCheck.find({
            user: req.user._id,
            isArchived: false
        })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalChecks,
                severityBreakdown: stats,
                recentChecks
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default {
    analyzeImage,
    getHealthChecks,
    getHealthCheck,
    addFollowUp,
    archiveHealthCheck,
    getStats
};
