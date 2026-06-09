import mongoose from 'mongoose';

const symptomEntrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    severity: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    duration: {
        value: Number,
        unit: {
            type: String,
            enum: ['hours', 'days', 'weeks', 'months']
        }
    },
    notes: String
});

const symptomRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symptoms: [symptomEntrySchema],
    overallFeeling: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    bodyTemperature: {
        value: Number,
        unit: {
            type: String,
            enum: ['celsius', 'fahrenheit'],
            default: 'celsius'
        }
    },
    analysis: {
        possibleConditions: [{
            condition: String,
            probability: {
                type: String,
                enum: ['High', 'Medium', 'Low']
            },
            description: String,
            matchingSymptoms: [String]
        }],
        recommendations: [{
            type: String
        }],
        shouldSeeDoctor: {
            type: Boolean,
            default: false
        },
        urgencyLevel: {
            type: String,
            enum: ['routine', 'soon', 'urgent', 'emergency']
        },
        suggestedSpecialist: String
    },
    relatedHealthChecks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HealthCheck'
    }],
    medicinesTaken: [{
        name: String,
        dosage: String,
        time: Date
    }],
    notes: {
        type: String,
        trim: true
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for timeline queries
symptomRecordSchema.index({ user: 1, createdAt: -1 });

// Virtual for getting symptoms by date
symptomRecordSchema.virtual('dateString').get(function () {
    return this.createdAt.toISOString().split('T')[0];
});

const SymptomRecord = mongoose.model('SymptomRecord', symptomRecordSchema);

export default SymptomRecord;
