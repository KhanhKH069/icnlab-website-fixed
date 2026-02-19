const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const News = require('../models/News');
const { auth, isEditor } = require('../middleware/auth');
const { upload, setUploadType, handleUploadError } = require('../middleware/upload');

// @route   GET /api/news
// @desc    Get all published news
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        
        const query = { isPublished: true };
        
        if (category) {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }
        
        const news = await News.find(query)
            .populate('author', 'name email')
            .sort({ publishedDate: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await News.countDocuments(query);
        
        res.json({
            success: true,
            data: news,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get news error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/news/:id
// @desc    Get single news by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id)
            .populate('author', 'name email');
        
        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }
        
        // Increment views
        news.views += 1;
        await news.save();
        
        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        console.error('Get news by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/news
// @desc    Create new news
// @access  Private/Editor
router.post('/',
    auth,
    isEditor,
    setUploadType('news'),
    upload.single('image'),
    handleUploadError,
    [
        body('title').trim().notEmpty().isLength({ max: 200 }),
        body('content').trim().notEmpty(),
        body('category').isIn(['conference', 'publication', 'event', 'announcement', 'achievement'])
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

            const { title, content, excerpt, category, tags, publishedDate, isPublished } = req.body;

            const newsData = {
                title,
                content,
                excerpt,
                category,
                author: req.user._id,
                tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
                publishedDate: publishedDate || Date.now(),
                isPublished: isPublished !== undefined ? isPublished : true
            };

            if (req.file) {
                newsData.image = `/uploads/news/${req.file.filename}`;
            }

            const news = new News(newsData);
            await news.save();

            await news.populate('author', 'name email');

            res.status(201).json({
                success: true,
                message: 'News created successfully',
                data: news
            });
        } catch (error) {
            console.error('Create news error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// @route   PUT /api/news/:id
// @desc    Update news
// @access  Private/Editor
router.put('/:id',
    auth,
    isEditor,
    setUploadType('news'),
    upload.single('image'),
    handleUploadError,
    async (req, res) => {
        try {
            const news = await News.findById(req.params.id);

            if (!news) {
                return res.status(404).json({
                    success: false,
                    message: 'News not found'
                });
            }

            const { title, content, excerpt, category, tags, publishedDate, isPublished } = req.body;

            if (title) news.title = title;
            if (content) news.content = content;
            if (excerpt !== undefined) news.excerpt = excerpt;
            if (category) news.category = category;
            if (tags) news.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
            if (publishedDate) news.publishedDate = publishedDate;
            if (isPublished !== undefined) news.isPublished = isPublished;

            if (req.file) {
                news.image = `/uploads/news/${req.file.filename}`;
            }

            await news.save();
            await news.populate('author', 'name email');

            res.json({
                success: true,
                message: 'News updated successfully',
                data: news
            });
        } catch (error) {
            console.error('Update news error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// @route   DELETE /api/news/:id
// @desc    Delete news
// @access  Private/Editor
router.delete('/:id', auth, isEditor, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        await news.deleteOne();

        res.json({
            success: true,
            message: 'News deleted successfully'
        });
    } catch (error) {
        console.error('Delete news error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
