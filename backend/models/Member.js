const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        enum: ['professor', 'associate_professor', 'assistant_professor', 'postdoc', 'phd_student', 'master_student', 'undergraduate', 'research_assistant', 'collaborator'],
        required: true
    },
    academicTitle: {
        type: String,
        trim: true
    },
    affiliation: {
        type: String,
        trim: true
    },
    bio: {
        type: String
    },
    photo: {
        type: String
    },
    researchInterests: [{
        type: String,
        trim: true
    }],
    education: [{
        degree: String,
        institution: String,
        year: Number,
        field: String
    }],
    socialLinks: {
        googleScholar: String,
        linkedin: String,
        github: String,
        researchGate: String,
        personalWebsite: String
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isAlumni: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Sort by order then by name
memberSchema.index({ order: 1, name: 1 });

module.exports = mongoose.model('Member', memberSchema);
