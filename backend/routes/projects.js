const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { auth, isEditor } = require('../middleware/auth');
const { upload, setUploadType, handleUploadError } = require('../middleware/upload');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { status, category } = req.query;
        
        const query = { isPublished: true };
        
        if (status) {
            query.status = status;
        }
        
        if (category) {
            query.category = category;
        }
        
        const projects = await Project.find(query)
            .populate('members', 'name position photo')
            .populate('publications', 'title year')
            .sort({ startDate: -1 });
        
        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('members', 'name position photo email')
            .populate('publications');
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private/Editor
router.post('/',
    auth,
    isEditor,
    setUploadType('projects'),
    upload.single('image'),
    handleUploadError,
    [
        body('title').trim().notEmpty(),
        body('description').trim().notEmpty(),
        body('category').isIn(['edge_computing', 'iot_security', '5g_6g', 'ai_ml', 'other']),
        body('status').isIn(['ongoing', 'completed', 'planned']),
        body('startDate').isISO8601()
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

            const projectData = {
                title: req.body.title,
                description: req.body.description,
                fullDescription: req.body.fullDescription,
                category: req.body.category,
                status: req.body.status,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                fundingAgency: req.body.fundingAgency,
                budget: req.body.budget,
                members: req.body.members || [],
                publications: req.body.publications || [],
                technologies: req.body.technologies ? (Array.isArray(req.body.technologies) ? req.body.technologies : req.body.technologies.split(',').map(t => t.trim())) : [],
                githubUrl: req.body.githubUrl,
                websiteUrl: req.body.websiteUrl,
                isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true
            };

            if (req.file) {
                projectData.image = `/uploads/projects/${req.file.filename}`;
            }

            const project = new Project(projectData);
            await project.save();

            await project.populate('members', 'name position photo');
            await project.populate('publications', 'title year');

            res.status(201).json({
                success: true,
                message: 'Project created successfully',
                data: project
            });
        } catch (error) {
            console.error('Create project error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private/Editor
router.put('/:id',
    auth,
    isEditor,
    setUploadType('projects'),
    upload.single('image'),
    handleUploadError,
    async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            const updateFields = [
                'title', 'description', 'fullDescription', 'category', 'status',
                'startDate', 'endDate', 'fundingAgency', 'budget', 'members',
                'publications', 'technologies', 'githubUrl', 'websiteUrl', 'isPublished'
            ];
            
            updateFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    if (field === 'technologies' && typeof req.body[field] === 'string') {
                        project[field] = req.body[field].split(',').map(t => t.trim());
                    } else {
                        project[field] = req.body[field];
                    }
                }
            });

            if (req.file) {
                project.image = `/uploads/projects/${req.file.filename}`;
            }

            await project.save();
            await project.populate('members', 'name position photo');
            await project.populate('publications', 'title year');

            res.json({
                success: true,
                message: 'Project updated successfully',
                data: project
            });
        } catch (error) {
            console.error('Update project error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private/Editor
router.delete('/:id', auth, isEditor, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        await project.deleteOne();

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
