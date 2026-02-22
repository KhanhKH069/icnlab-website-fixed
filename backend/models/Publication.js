const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    authors: [{
        type: String,
        required: true,
        trim: true
    }],
    venue: {
        type: String,
        required: [true, 'Venue/Conference is required'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: 2000,
        max: 2100
    },
    type: {
        type: String,
        enum: ['conference', 'journal', 'workshop', 'book_chapter', 'thesis'],
        required: true
    },
    doi: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    pdfFile: {
        type: String
    },
    image: {
        type: String,
        default: null
    },
    abstract: {
        type: String
    },
    keywords: [{
        type: String,
        trim: true
    }],
    citations: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    publishedDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for searching
publicationSchema.index({ title: 'text', authors: 'text', venue: 'text' });

module.exports = mongoose.model('Publication', publicationSchema);
