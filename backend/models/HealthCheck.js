import mongoose from 'mongoose';

const healthCheckSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    imageType: {
        type: String,
        enum: ['skin', 'eye', 'throat', 'wound', 'rash', 'other'],
        default: 'other'
    },
    userDescription: {
        type: String,
        trim: true
    },
    analysis: {
        possibleCauses: [{
            condition: String,
            probability: {
                type: String,
                enum: ['High', 'Medium', 'Low']
            },
            description: String
        }],
        severityLevel: {
            type: String,
            enum: ['mild', 'moderate', 'urgent'],
            required: true
        },
        severityScore: {
            type: Number,
            min: 1,
            max: 10
        },
        advice: [{
            type: String
        }],
        shouldSeeDoctor: {
            type: Boolean,
            default: false
        },
        urgencyNote: String,
        homeRemedySuggestions: [{
            type: String
        }],
        warningSignsToWatch: [{
            type: String
        }],
        symptoms: [{
            type: String
        }],
        medicine: [{
            type: String
        }],
        recommendedActions: [{
            type: String
        }],
        analysisStatus: {
            type: String,
            enum: ['valid', 'invalid'],
            default: 'valid'
        },
        analysisMessage: String
    },
    aiModel: {
        type: String,
        default: 'gemini-1.5-flash'
    },
    disclaimer: {
        type: String,
        default: 'This is AI-generated guidance only, not a medical diagnosis. Please consult a healthcare professional for proper evaluation and treatment.'
    },
    followUp: {
        isFollowUpNeeded: {
            type: Boolean,
            default: false
        },
        followUpDate: Date,
        followUpNotes: String
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
healthCheckSchema.index({ user: 1, createdAt: -1 });
healthCheckSchema.index({ 'analysis.severityLevel': 1 });

const HealthCheck = mongoose.model('HealthCheck', healthCheckSchema);

export default HealthCheck;
