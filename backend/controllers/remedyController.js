import Remedy from '../models/Remedy.js';
import { getHomeRemedies } from '../services/aiService.js';

// @desc    Get all remedies
// @route   GET /api/remedies
// @access  Public
export const getRemedies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { category, search } = req.query;
        const query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const remedies = await Remedy.find(query)
            .sort({ 'rating.average': -1, views: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Remedy.countDocuments(query);

        res.json({
            success: true,
            data: remedies,
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

// @desc    Get single remedy
// @route   GET /api/remedies/:id
// @access  Public
export const getRemedy = async (req, res) => {
    try {
        const remedy = await Remedy.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!remedy) {
            return res.status(404).json({
                success: false,
                message: 'Remedy not found'
            });
        }

        res.json({
            success: true,
            data: remedy
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get remedies by condition
// @route   GET /api/remedies/condition/:condition
// @access  Public
export const getRemediesByCondition = async (req, res) => {
    try {
        const { condition } = req.params;

        // First try to find in database
        let remedies = await Remedy.find({
            condition: { $regex: condition, $options: 'i' }
        }).limit(5);

        // If not found, use AI to generate
        if (remedies.length === 0) {
            const aiRemedies = await getHomeRemedies(condition);

            res.json({
                success: true,
                source: 'ai',
                data: aiRemedies,
                disclaimer: 'These are general wellness suggestions from AI, not medical treatment. Consult a healthcare professional for persistent issues.'
            });
            return;
        }

        res.json({
            success: true,
            source: 'database',
            data: remedies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get AI-generated remedies
// @route   POST /api/remedies/ai
// @access  Public
export const getAIRemedies = async (req, res) => {
    try {
        const { condition, symptoms } = req.body;

        if (!condition) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a condition'
            });
        }

        const remedies = await getHomeRemedies(condition, symptoms || []);

        res.json({
            success: true,
            data: remedies,
            disclaimer: 'These are general wellness suggestions from AI, not medical treatment. Consult a healthcare professional for persistent issues.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get remedy categories
// @route   GET /api/remedies/categories
// @access  Public
export const getCategories = async (req, res) => {
    const categories = [
        { id: 'skin', name: 'Skin Care', icon: '🧴', description: 'Rashes, itching, acne, etc.' },
        { id: 'digestive', name: 'Digestive Health', icon: '🫃', description: 'Stomach, digestion issues' },
        { id: 'respiratory', name: 'Respiratory', icon: '🫁', description: 'Cough, cold, breathing' },
        { id: 'pain', name: 'Pain Relief', icon: '💢', description: 'Headache, body pain' },
        { id: 'fever', name: 'Fever & Flu', icon: '🤒', description: 'Fever, cold, flu symptoms' },
        { id: 'allergy', name: 'Allergies', icon: '🤧', description: 'Allergic reactions' },
        { id: 'stress', name: 'Stress & Anxiety', icon: '😰', description: 'Mental wellness' },
        { id: 'sleep', name: 'Sleep Issues', icon: '😴', description: 'Insomnia, sleep quality' },
        { id: 'immunity', name: 'Immunity Boost', icon: '💪', description: 'Strengthen immune system' },
        { id: 'general', name: 'General Wellness', icon: '❤️', description: 'Overall health tips' }
    ];

    res.json({
        success: true,
        data: categories
    });
};

// @desc    Rate a remedy
// @route   POST /api/remedies/:id/rate
// @access  Private
export const rateRemedy = async (req, res) => {
    try {
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a rating between 1 and 5'
            });
        }

        const remedy = await Remedy.findById(req.params.id);

        if (!remedy) {
            return res.status(404).json({
                success: false,
                message: 'Remedy not found'
            });
        }

        // Calculate new average
        const newCount = remedy.rating.count + 1;
        const newAverage = ((remedy.rating.average * remedy.rating.count) + rating) / newCount;

        remedy.rating.average = Math.round(newAverage * 10) / 10;
        remedy.rating.count = newCount;
        await remedy.save();

        res.json({
            success: true,
            data: remedy.rating
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Seed initial remedies
// @route   POST /api/remedies/seed
// @access  Private (Admin only in production)
export const seedRemedies = async (req, res) => {
    try {
        const initialRemedies = [
            {
                condition: 'Skin Itching',
                category: 'skin',
                title: 'Natural Remedies for Skin Itching',
                description: 'Home remedies to relieve mild skin itching and irritation',
                remedies: [
                    {
                        name: 'Cold Compress',
                        instructions: 'Apply a cold, wet cloth to the itchy area for 5-10 minutes',
                        ingredients: ['Clean cloth', 'Cold water'],
                        effectiveness: 'High'
                    },
                    {
                        name: 'Oatmeal Bath',
                        instructions: 'Add colloidal oatmeal to lukewarm bath water and soak for 15-20 minutes',
                        ingredients: ['Colloidal oatmeal', 'Lukewarm water'],
                        effectiveness: 'High'
                    },
                    {
                        name: 'Aloe Vera Gel',
                        instructions: 'Apply fresh aloe vera gel directly to the affected area',
                        ingredients: ['Fresh aloe vera leaf'],
                        effectiveness: 'Medium'
                    },
                    {
                        name: 'Coconut Oil',
                        instructions: 'Gently massage virgin coconut oil on dry, itchy skin',
                        ingredients: ['Virgin coconut oil'],
                        effectiveness: 'Medium'
                    }
                ],
                dietTips: [
                    { tip: 'Stay hydrated', foods: ['Water', 'Coconut water', 'Herbal teas'] },
                    { tip: 'Eat anti-inflammatory foods', foods: ['Fatty fish', 'Leafy greens', 'Berries'] }
                ],
                hygieneTips: [
                    'Use mild, fragrance-free soaps',
                    'Avoid hot showers - use lukewarm water',
                    'Pat skin dry instead of rubbing'
                ],
                lifestyleChanges: [
                    'Wear loose, cotton clothing',
                    'Keep nails short to prevent scratching damage',
                    'Use a humidifier in dry weather'
                ],
                warnings: [
                    'Stop using if irritation worsens',
                    'Avoid if you have open wounds'
                ],
                whenToSeeDoctor: [
                    'Itching persists for more than 2 weeks',
                    'Itching is severe and affects sleep',
                    'Signs of infection (pus, increased redness)'
                ],
                isVerified: true
            },
            {
                condition: 'Common Cold',
                category: 'respiratory',
                title: 'Natural Remedies for Common Cold',
                description: 'Home remedies to relieve cold symptoms and boost recovery',
                remedies: [
                    {
                        name: 'Honey and Ginger Tea',
                        instructions: 'Boil fresh ginger in water for 10 minutes, strain, and add honey',
                        ingredients: ['Fresh ginger', 'Honey', 'Hot water'],
                        effectiveness: 'High'
                    },
                    {
                        name: 'Steam Inhalation',
                        instructions: 'Inhale steam from hot water for 10 minutes, optionally with eucalyptus oil',
                        ingredients: ['Hot water', 'Eucalyptus oil (optional)'],
                        effectiveness: 'High'
                    },
                    {
                        name: 'Turmeric Milk',
                        instructions: 'Add turmeric powder to warm milk and drink before bed',
                        ingredients: ['Turmeric powder', 'Warm milk', 'Black pepper'],
                        effectiveness: 'Medium'
                    }
                ],
                dietTips: [
                    { tip: 'Drink plenty of fluids', foods: ['Warm water', 'Soups', 'Herbal teas'] },
                    { tip: 'Eat vitamin C rich foods', foods: ['Oranges', 'Lemons', 'Bell peppers'] }
                ],
                hygieneTips: [
                    'Wash hands frequently',
                    'Cover mouth when coughing or sneezing',
                    'Dispose of tissues properly'
                ],
                lifestyleChanges: [
                    'Get adequate rest',
                    'Avoid cold beverages',
                    'Keep the throat warm'
                ],
                warnings: [
                    'Do not give honey to children under 1 year',
                    'Avoid steam inhalation in children without supervision'
                ],
                whenToSeeDoctor: [
                    'High fever (above 103°F)',
                    'Symptoms last more than 10 days',
                    'Difficulty breathing or chest pain'
                ],
                isVerified: true
            },
            {
                condition: 'Headache',
                category: 'pain',
                title: 'Natural Remedies for Headaches',
                description: 'Home remedies to relieve mild to moderate headaches',
                remedies: [
                    {
                        name: 'Peppermint Oil Massage',
                        instructions: 'Dilute peppermint oil and massage on temples and forehead',
                        ingredients: ['Peppermint essential oil', 'Carrier oil'],
                        effectiveness: 'High'
                    },
                    {
                        name: 'Cold/Hot Compress',
                        instructions: 'Apply cold pack to forehead or warm pack to neck/shoulders',
                        ingredients: ['Ice pack or warm towel'],
                        effectiveness: 'Medium'
                    }
                ],
                dietTips: [
                    { tip: 'Stay hydrated', foods: ['Water', 'Electrolyte drinks'] },
                    { tip: 'Avoid trigger foods', foods: ['Avoid: aged cheese, alcohol, processed meats'] }
                ],
                lifestyleChanges: [
                    'Rest in a dark, quiet room',
                    'Practice relaxation techniques',
                    'Take regular breaks from screens'
                ],
                warnings: [
                    'Avoid peppermint oil if you have allergies',
                    'Do not apply essential oils directly to skin'
                ],
                whenToSeeDoctor: [
                    'Sudden, severe headache',
                    'Headache with fever, stiff neck, or confusion',
                    'Headaches that worsen over days'
                ],
                isVerified: true
            }
        ];

        await Remedy.deleteMany({});
        await Remedy.insertMany(initialRemedies);

        res.json({
            success: true,
            message: 'Remedies seeded successfully',
            count: initialRemedies.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default {
    getRemedies,
    getRemedy,
    getRemediesByCondition,
    getAIRemedies,
    getCategories,
    rateRemedy,
    seedRemedies
};
