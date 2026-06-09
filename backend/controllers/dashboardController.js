import HealthCheck from '../models/HealthCheck.js';
import SymptomRecord from '../models/SymptomRecord.js';
import User from '../models/User.js';

// @desc    Get dashboard overview
// @route   GET /api/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get health check stats
        const healthCheckStats = await HealthCheck.aggregate([
            { $match: { user: userId, isArchived: false } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    mild: {
                        $sum: { $cond: [{ $eq: ['$analysis.severityLevel', 'mild'] }, 1, 0] }
                    },
                    moderate: {
                        $sum: { $cond: [{ $eq: ['$analysis.severityLevel', 'moderate'] }, 1, 0] }
                    },
                    urgent: {
                        $sum: { $cond: [{ $eq: ['$analysis.severityLevel', 'urgent'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get symptom records count
        const symptomCount = await SymptomRecord.countDocuments({
            user: userId,
            isArchived: false
        });

        // Get recent health checks
        const recentHealthChecks = await HealthCheck.find({
            user: userId,
            isArchived: false
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('imageType analysis.severityLevel analysis.possibleCauses createdAt');

        // Get recent symptoms
        const recentSymptoms = await SymptomRecord.find({
            user: userId,
            isArchived: false
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('symptoms overallFeeling analysis.urgencyLevel createdAt');

        // Get health trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const healthTrend = await SymptomRecord.aggregate([
            {
                $match: {
                    user: userId,
                    createdAt: { $gte: sevenDaysAgo },
                    isArchived: false
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    avgFeeling: { $avg: '$overallFeeling' },
                    symptomCount: { $sum: { $size: '$symptoms' } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get most common symptoms (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const commonSymptoms = await SymptomRecord.aggregate([
            {
                $match: {
                    user: userId,
                    createdAt: { $gte: thirtyDaysAgo },
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
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalHealthChecks: healthCheckStats[0]?.total || 0,
                    totalSymptomRecords: symptomCount,
                    severityBreakdown: {
                        mild: healthCheckStats[0]?.mild || 0,
                        moderate: healthCheckStats[0]?.moderate || 0,
                        urgent: healthCheckStats[0]?.urgent || 0
                    }
                },
                recentHealthChecks,
                recentSymptoms,
                healthTrend,
                commonSymptoms
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get health history
// @route   GET /api/dashboard/history
// @access  Private
export const getHealthHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate, type } = req.query;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        let history = [];

        if (!type || type === 'all' || type === 'healthcheck') {
            const healthChecks = await HealthCheck.find({
                user: userId,
                isArchived: false,
                ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
            })
                .sort({ createdAt: -1 })
                .select('imageType analysis createdAt');

            history = history.concat(
                healthChecks.map(hc => ({
                    type: 'healthcheck',
                    data: hc,
                    date: hc.createdAt
                }))
            );
        }

        if (!type || type === 'all' || type === 'symptom') {
            const symptoms = await SymptomRecord.find({
                user: userId,
                isArchived: false,
                ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
            })
                .sort({ createdAt: -1 })
                .select('symptoms overallFeeling analysis createdAt');

            history = history.concat(
                symptoms.map(s => ({
                    type: 'symptom',
                    data: s,
                    date: s.createdAt
                }))
            );
        }

        // Sort by date
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Export user data
// @route   GET /api/dashboard/export
// @access  Private
export const exportData = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user profile
        const user = await User.findById(userId).select('-password');

        // Get all health checks
        const healthChecks = await HealthCheck.find({
            user: userId,
            isArchived: false
        }).sort({ createdAt: -1 });

        // Get all symptom records
        const symptoms = await SymptomRecord.find({
            user: userId,
            isArchived: false
        }).sort({ createdAt: -1 });

        const exportData = {
            exportDate: new Date().toISOString(),
            profile: user,
            healthChecks: healthChecks.map(hc => ({
                date: hc.createdAt,
                type: hc.imageType,
                severity: hc.analysis.severityLevel,
                possibleCauses: hc.analysis.possibleCauses,
                advice: hc.analysis.advice
            })),
            symptomRecords: symptoms.map(s => ({
                date: s.createdAt,
                symptoms: s.symptoms,
                overallFeeling: s.overallFeeling,
                analysis: s.analysis
            })),
            summary: {
                totalHealthChecks: healthChecks.length,
                totalSymptomRecords: symptoms.length,
                dateRange: {
                    from: symptoms.length > 0 ? symptoms[symptoms.length - 1].createdAt : null,
                    to: symptoms.length > 0 ? symptoms[0].createdAt : null
                }
            }
        };

        res.json({
            success: true,
            data: exportData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete all user data
// @route   DELETE /api/dashboard/data
// @access  Private
export const deleteAllData = async (req, res) => {
    try {
        const userId = req.user._id;

        // Archive all health checks
        await HealthCheck.updateMany(
            { user: userId },
            { isArchived: true }
        );

        // Archive all symptom records
        await SymptomRecord.updateMany(
            { user: userId },
            { isArchived: true }
        );

        res.json({
            success: true,
            message: 'All health data has been archived'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get health insights
// @route   GET /api/dashboard/insights
// @access  Private
export const getInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Analyze patterns
        const recentSymptoms = await SymptomRecord.find({
            user: userId,
            createdAt: { $gte: thirtyDaysAgo },
            isArchived: false
        });

        const insights = [];

        // Check for recurring symptoms
        const symptomCounts = {};
        recentSymptoms.forEach(record => {
            record.symptoms.forEach(symptom => {
                if (!symptomCounts[symptom.name]) {
                    symptomCounts[symptom.name] = { count: 0, severities: [] };
                }
                symptomCounts[symptom.name].count++;
                symptomCounts[symptom.name].severities.push(symptom.severity);
            });
        });

        Object.entries(symptomCounts).forEach(([symptom, data]) => {
            if (data.count >= 3) {
                const avgSeverity = data.severities.reduce((a, b) => a + b, 0) / data.severities.length;
                insights.push({
                    type: 'recurring_symptom',
                    title: `Recurring ${symptom}`,
                    description: `You've reported ${symptom} ${data.count} times in the last 30 days with average severity ${avgSeverity.toFixed(1)}/10`,
                    severity: avgSeverity > 6 ? 'warning' : 'info',
                    recommendation: avgSeverity > 6 ? 'Consider consulting a doctor about this recurring issue' : 'Monitor and track triggers'
                });
            }
        });

        // Check for improvement or decline
        if (recentSymptoms.length >= 5) {
            const firstHalf = recentSymptoms.slice(Math.floor(recentSymptoms.length / 2));
            const secondHalf = recentSymptoms.slice(0, Math.floor(recentSymptoms.length / 2));

            const avgFirst = firstHalf.reduce((sum, r) => sum + (r.overallFeeling || 5), 0) / firstHalf.length;
            const avgSecond = secondHalf.reduce((sum, r) => sum + (r.overallFeeling || 5), 0) / secondHalf.length;

            if (avgSecond - avgFirst > 1) {
                insights.push({
                    type: 'improvement',
                    title: 'Health Improvement Trend',
                    description: 'Your overall health feeling has improved recently!',
                    severity: 'positive'
                });
            } else if (avgFirst - avgSecond > 1) {
                insights.push({
                    type: 'decline',
                    title: 'Health Attention Needed',
                    description: 'Your overall health feeling has declined. Consider reviewing your habits or consulting a doctor.',
                    severity: 'warning'
                });
            }
        }

        res.json({
            success: true,
            data: insights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default {
    getDashboard,
    getHealthHistory,
    exportData,
    deleteAllData,
    getInsights
};
