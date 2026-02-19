const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    fullDescription: {
        type: String
    },
    image: {
        type: String
    },
    category: {
        type: String,
        enum: ['edge_computing', 'iot_security', '5g_6g', 'ai_ml', 'other'],
        required: true
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'planned'],
        default: 'ongoing'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    }],
    fundingAgency: {
        type: String
    },
    budget: {
        type: Number
    },
    publications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publication'
    }],
    technologies: [{
        type: String,
        trim: true
    }],
    githubUrl: {
        type: String
    },
    websiteUrl: {
        type: String
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
