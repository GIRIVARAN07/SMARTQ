const express = require('express');
const Token = require('../models/Token');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/tokens/book
// @desc    Book a new token for a service
// @access  Private
router.post('/book', protect, async (req, res) => {
  try {
    const { serviceId, notes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (!service.isActive) {
      return res.status(400).json({ message: 'This service is currently not available' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if user already has a waiting token for this service today
    const existingToken = await Token.findOne({
      user: req.user._id,
      service: serviceId,
      date: today,
      status: { $in: ['waiting', 'serving'] }
    });

    if (existingToken) {
      return res.status(400).json({
        message: 'You already have an active token for this service today',
        token: existingToken
      });
    }

    // Check max tokens per day
    const todayCount = await Token.countDocuments({
      service: serviceId,
      date: today
    });

    if (todayCount >= service.maxTokensPerDay) {
      return res.status(400).json({ message: 'Maximum tokens for today have been reached' });
    }

    // Get next token number
    const lastToken = await Token.findOne({
      service: serviceId,
      date: today
    }).sort({ tokenNumber: -1 });

    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    // Generate display number based on category
    const prefixMap = {
      hospital: 'H',
      bank: 'B',
      college: 'C',
      service_center: 'S',
      government: 'G',
      other: 'Q'
    };
    const prefix = prefixMap[service.category] || 'Q';
    const displayNumber = `${prefix}-${String(tokenNumber).padStart(3, '0')}`;

    // Calculate estimated wait time
    const waitingBefore = await Token.countDocuments({
      service: serviceId,
      date: today,
      status: 'waiting'
    });
    const estimatedWaitTime = waitingBefore * service.estimatedTimePerToken;

    // Create token
    const token = await Token.create({
      tokenNumber,
      displayNumber,
      service: serviceId,
      user: req.user._id,
      estimatedWaitTime,
      notes: notes || '',
      date: today
    });

    const populatedToken = await Token.findById(token._id)
      .populate('service', 'name category icon')
      .populate('user', 'name email');

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`service-${serviceId}`).emit('queue-update', {
        type: 'new-token',
        serviceId,
        token: populatedToken,
        waitingCount: waitingBefore + 1
      });
    }

    res.status(201).json(populatedToken);
  } catch (error) {
    console.error('Book token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tokens/my-tokens
// @desc    Get current user's tokens
// @access  Private
router.get('/my-tokens', protect, async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }
    if (date) {
      filter.date = date;
    }

    const tokens = await Token.find(filter)
      .populate('service', 'name category icon estimatedTimePerToken')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tokens/queue/:serviceId
// @desc    Get live queue for a service
// @access  Public
router.get('/queue/:serviceId', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const tokens = await Token.find({
      service: req.params.serviceId,
      date: today
    })
      .populate('user', 'name')
      .sort({ tokenNumber: 1 });

    const waiting = tokens.filter(t => t.status === 'waiting');
    const serving = tokens.filter(t => t.status === 'serving');
    const completed = tokens.filter(t => t.status === 'completed');

    res.json({
      waiting,
      serving,
      completed,
      stats: {
        total: tokens.length,
        waitingCount: waiting.length,
        servingCount: serving.length,
        completedCount: completed.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tokens/:id/cancel
// @desc    Cancel a token
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const token = await Token.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    if (token.status !== 'waiting') {
      return res.status(400).json({ message: 'Only waiting tokens can be cancelled' });
    }

    token.status = 'cancelled';
    await token.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`service-${token.service}`).emit('queue-update', {
        type: 'token-cancelled',
        serviceId: token.service,
        tokenId: token._id
      });
    }

    res.json(token);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tokens/history
// @desc    Get token history for current user
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tokens = await Token.find({ user: req.user._id })
      .populate('service', 'name category icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Token.countDocuments({ user: req.user._id });

    res.json({
      tokens,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
