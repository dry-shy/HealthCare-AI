import mongoose from 'mongoose';

const remedySchema = new mongoose.Schema({
    condition: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    category: {
        type: String,
        enum: ['skin', 'digestive', 'respiratory', 'pain', 'fever', 'allergy', 'stress', 'sleep', 'immunity', 'general'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    remedies: [{
        name: String,
        instructions: String,
        ingredients: [String],
        preparationTime: String,
        effectiveness: {
            type: String,
            enum: ['High', 'Medium', 'Low']
        }
    }],
    dietTips: [{
        tip: String,
        foods: [String]
    }],
    hygieneTips: [String],
    lifestyleChanges: [String],
    avoidList: [{
        item: String,
        reason: String
    }],
    warnings: [{
        type: String
    }],
    contraindications: [{
        condition: String,
        reason: String
    }],
    whenToSeeDoctor: [{
        type: String
    }],
    scientificBasis: String,
    sources: [String],
    isVerified: {
        type: Boolean,
        default: false
    },
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Text search index
remedySchema.index({ condition: 'text', title: 'text', description: 'text' });

const Remedy = mongoose.model('Remedy', remedySchema);

export default Remedy;
