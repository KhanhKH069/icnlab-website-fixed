const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Publication = require('../models/Publication');
const { auth, isEditor } = require('../middleware/auth');
const { upload, setUploadType, handleUploadError } = require('../middleware/upload');

// @route   GET /api/publications
// @desc    Get all publications
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, year, type, search } = req.query;
        
        const query = { isPublished: true };
        
        if (year) {
            query.year = parseInt(year);
        }
        
        if (type) {
            query.type = type;
        }
        
        if (search) {
            query.$text = { $search: search };
        }
        
        const publications = await Publication.find(query)
            .sort({ year: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await Publication.countDocuments(query);
        
        res.json({
            success: true,
            data: publications,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get publications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/publications/:id
// @desc    Get single publication
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id);
        
        if (!publication) {
            return res.status(404).json({
                success: false,
                message: 'Publication not found'
            });
        }
        
        res.json({
            success: true,
            data: publication
        });
    } catch (error) {
        console.error('Get publication error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/publications
// @desc    Create new publication
// @access  Private/Editor
router.post('/',
    auth,
    isEditor,
    setUploadType('publications'),
    (req, res, next) => {
        if (typeof req.body.authors === 'string') {
            req.body.authors = req.body.authors.split('\n').map(a => a.trim()).filter(Boolean);
        }
        next();
    },
    upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'image', maxCount: 1 }]),
    handleUploadError,
    [
        body('title').trim().notEmpty(),
        body('authors').custom(v => Array.isArray(v) && v.length > 0).withMessage('At least one author required'),
        body('venue').trim().notEmpty(),
        body('year').isInt({ min: 2000, max: 2100 }),
        body('type').isIn(['conference', 'journal', 'workshop', 'book_chapter', 'thesis'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const publicationData = {
                title: req.body.title,
                authors: req.body.authors,
                venue: req.body.venue,
                year: parseInt(req.body.year),
                type: req.body.type,
                doi: req.body.doi,
                url: req.body.url,
                abstract: req.body.abstract,
                keywords: req.body.keywords ? (Array.isArray(req.body.keywords) ? req.body.keywords : req.body.keywords.split(',').map(k => k.trim())) : [],
                publishedDate: req.body.publishedDate || Date.now(),
                isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true
            };

            if (req.files?.pdfFile?.[0]) {
                publicationData.pdfFile = `/uploads/publications/${req.files.pdfFile[0].filename}`;
            }
            if (req.files?.image?.[0]) {
                publicationData.image = `/uploads/publications/${req.files.image[0].filename}`;
            }

            const publication = new Publication(publicationData);
            await publication.save();

            res.status(201).json({
                success: true,
                message: 'Publication created successfully',
                data: publication
            });
        } catch (error) {
            console.error('Create publication error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// @route   PUT /api/publications/:id
// @desc    Update publication
// @access  Private/Editor
router.put('/:id',
    auth,
    isEditor,
    setUploadType('publications'),
    (req, res, next) => {
        if (typeof req.body.authors === 'string') {
            req.body.authors = req.body.authors.split('\n').map(a => a.trim()).filter(Boolean);
        }
        next();
    },
    upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'image', maxCount: 1 }]),
    handleUploadError,
    async (req, res) => {
        try {
            const publication = await Publication.findById(req.params.id);

            if (!publication) {
                return res.status(404).json({
                    success: false,
                    message: 'Publication not found'
                });
            }

            const updateFields = ['title', 'authors', 'venue', 'year', 'type', 'doi', 'url', 'abstract', 'keywords', 'citations', 'publishedDate', 'isPublished'];
            
            updateFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    if (field === 'keywords' && typeof req.body[field] === 'string') {
                        publication[field] = req.body[field].split(',').map(k => k.trim());
                    } else if (field === 'authors' && Array.isArray(req.body[field])) {
                        publication[field] = req.body[field];
                    } else if (field !== 'authors') {
                        publication[field] = req.body[field];
                    }
                }
            });

            if (req.files?.pdfFile?.[0]) {
                publication.pdfFile = `/uploads/publications/${req.files.pdfFile[0].filename}`;
            }
            if (req.files?.image?.[0]) {
                publication.image = `/uploads/publications/${req.files.image[0].filename}`;
            }

            await publication.save();

            res.json({
                success: true,
                message: 'Publication updated successfully',
                data: publication
            });
        } catch (error) {
            console.error('Update publication error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// @route   DELETE /api/publications/:id
// @desc    Delete publication
// @access  Private/Editor
router.delete('/:id', auth, isEditor, async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id);

        if (!publication) {
            return res.status(404).json({
                success: false,
                message: 'Publication not found'
            });
        }

        await publication.deleteOne();

        res.json({
            success: true,
            message: 'Publication deleted successfully'
        });
    } catch (error) {
        console.error('Delete publication error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/publications/stats/summary
// @desc    Get publication statistics
// @access  Public
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await Publication.aggregate([
            { $match: { isPublished: true } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalCitations: { $sum: '$citations' },
                    byType: {
                        $push: {
                            type: '$type',
                            year: '$year'
                        }
                    }
                }
            }
        ]);

        const yearStats = await Publication.aggregate([
            { $match: { isPublished: true } },
            {
                $group: {
                    _id: '$year',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                summary: stats[0] || { total: 0, totalCitations: 0 },
                byYear: yearStats
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
