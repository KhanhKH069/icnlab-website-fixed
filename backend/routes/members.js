const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Member = require('../models/Member');
const { auth, isEditor, optionalAuth } = require('../middleware/auth');
const { upload, setUploadType, handleUploadError } = require('../middleware/upload');

// @route   GET /api/members
// @desc    Get all members (all if auth, active only if public)
// @access  Public / Private
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { position, isAlumni } = req.query;
        
        const query = req.user ? {} : { isActive: true };
        
        if (position) {
            query.position = position;
        }
        
        if (isAlumni !== undefined) {
            query.isAlumni = isAlumni === 'true';
        }
        
        const members = await Member.find(query)
            .sort({ order: 1, name: 1 });
        
        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/members/:id
// @desc    Get single member
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            data: member
        });
    } catch (error) {
        console.error('Get member error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/members
// @desc    Create new member
// @access  Private/Editor
router.post('/',
    auth,
    isEditor,
    setUploadType('members'),
    upload.single('photo'),
    (req, res, next) => {
        if (req.body) {
            if (typeof req.body.researchInterests === 'string') {
                try {
                    req.body.researchInterests = JSON.parse(req.body.researchInterests);
                } catch (e) {
                    req.body.researchInterests = req.body.researchInterests.split(',').map(s => s.trim()).filter(Boolean);
                }
            }
            if (req.body.isActive !== undefined) req.body.isActive = ['on','true',true].includes(req.body.isActive);
            if (req.body.isAlumni !== undefined) req.body.isAlumni = ['on','true',true].includes(req.body.isAlumni);
        }
        next();
    },
    handleUploadError,
    [
        body('name').trim().notEmpty(),
        body('email').isEmail().normalizeEmail(),
        body('position').isIn(['professor', 'associate_professor', 'assistant_professor', 'postdoc', 'phd_student', 'master_student', 'undergraduate', 'research_assistant', 'collaborator'])
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

            // Check if email already exists
            const existingMember = await Member.findOne({ email: req.body.email });
            if (existingMember) {
                return res.status(400).json({
                    success: false,
                    message: 'Member with this email already exists'
                });
            }

            const memberData = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                position: req.body.position,
                bio: req.body.bio,
                researchInterests: req.body.researchInterests || [],
                education: req.body.education || [],
                socialLinks: req.body.socialLinks || {},
                joinDate: req.body.joinDate || Date.now(),
                isActive: req.body.isActive !== undefined ? req.body.isActive : true,
                isAlumni: req.body.isAlumni || false,
                order: req.body.order || 0
            };

            if (req.file) {
                memberData.photo = `/uploads/members/${req.file.filename}`;
            }

            const member = new Member(memberData);
            await member.save();

            res.status(201).json({
                success: true,
                message: 'Member created successfully',
                data: member
            });
        } catch (error) {
            console.error('Create member error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private/Editor
router.put('/:id',
    auth,
    isEditor,
    setUploadType('members'),
    upload.single('photo'),
    (req, res, next) => {
        if (req.body) {
            if (typeof req.body.researchInterests === 'string') {
                try {
                    req.body.researchInterests = JSON.parse(req.body.researchInterests);
                } catch (e) {
                    req.body.researchInterests = req.body.researchInterests.split(',').map(s => s.trim()).filter(Boolean);
                }
            }
            if (req.body.isActive !== undefined) req.body.isActive = ['on','true',true].includes(req.body.isActive);
            if (req.body.isAlumni !== undefined) req.body.isAlumni = ['on','true',true].includes(req.body.isAlumni);
        }
        next();
    },
    handleUploadError,
    async (req, res) => {
        try {
            const member = await Member.findById(req.params.id);

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            // Check if email is being changed and if it already exists
            if (req.body.email && req.body.email !== member.email) {
                const existingMember = await Member.findOne({ email: req.body.email });
                if (existingMember) {
                    return res.status(400).json({
                        success: false,
                        message: 'Member with this email already exists'
                    });
                }
            }

            const updateFields = [
                'name', 'email', 'phone', 'position', 'bio', 'researchInterests',
                'education', 'socialLinks', 'joinDate', 'isActive', 'isAlumni', 'order'
            ];
            
            updateFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    member[field] = req.body[field];
                }
            });

            if (req.file) {
                member.photo = `/uploads/members/${req.file.filename}`;
            }

            await member.save();

            res.json({
                success: true,
                message: 'Member updated successfully',
                data: member
            });
        } catch (error) {
            console.error('Update member error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// @route   DELETE /api/members/:id
// @desc    Delete member
// @access  Private/Editor
router.delete('/:id', auth, isEditor, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        await member.deleteOne();

        res.json({
            success: true,
            message: 'Member deleted successfully'
        });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
