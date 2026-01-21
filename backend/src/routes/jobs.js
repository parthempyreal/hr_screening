import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Job from '../models/Job.js';
import { protect } from '../middleware/auth.js';
import { extractSkillsFromJobDescription } from '../services/openai.js';

const router = express.Router();

// @route   POST /api/jobs
// @desc    Create a new job post
// @access  Private
router.post('/', protect, [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description')
    .notEmpty().withMessage('Job description is required')
    .custom((value) => {
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount < 200) {
        throw new Error(`Job description must be at least 200 words (currently ${wordCount} words)`);
      }
      return true;
    }),
  body('location').notEmpty().withMessage('Location is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(e => e.msg)
      });
    }

    const { title, description, location, type, salaryMin, salaryMax } = req.body;

    // Extract skills using OpenAI
    console.log('🤖 Extracting skills from job description...');
    const extractedData = await extractSkillsFromJobDescription(description);
    console.log('✅ Skills extracted:', extractedData);

    // Create job
    const job = await Job.create({
      title,
      description,
      location,
      type: type || 'full-time',
      salaryMin: salaryMin || 0,
      salaryMax: salaryMax || 0,
      skills: extractedData.skills,
      techStack: extractedData.techStack,
      requirements: extractedData.requirements,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/jobs
// @desc    Get all jobs (with filtering)
// @access  Private
router.get('/', protect, [
  query('status').optional().isIn(['active', 'paused', 'closed', 'all']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { createdBy: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email'),
      Job.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/jobs/:id
// @desc    Update job
// @access  Private
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const { title, description, location, type, salaryMin, salaryMax, status } = req.body;

    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Update fields
    if (title) job.title = title;
    if (location) job.location = location;
    if (type) job.type = type;
    if (salaryMin !== undefined) job.salaryMin = salaryMin;
    if (salaryMax !== undefined) job.salaryMax = salaryMax;
    if (status) job.status = status;

    // If description changed, re-extract skills
    if (description && description !== job.description) {
      const wordCount = description.trim().split(/\s+/).length;
      if (wordCount < 200) {
        return res.status(400).json({
          success: false,
          message: `Job description must be at least 200 words (currently ${wordCount} words)`
        });
      }
      
      job.description = description;
      const extractedData = await extractSkillsFromJobDescription(description);
      job.skills = extractedData.skills;
      job.techStack = extractedData.techStack;
      job.requirements = extractedData.requirements;
    }

    await job.save();

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
