const express = require('express');
const Token = require('../models/Token');
const Service = require('../models/Service');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply admin auth to all routes
router.use(protect, adminOnly);

// @route   PUT /api/admin/call-next/:serviceId
// @desc    Call the next token in queue
// @access  Admin
router.put('/call-next/:serviceId', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Complete any currently serving token
    await Token.updateMany(
      {
        service: req.params.serviceId,
        date: today,
        status: 'serving'
      },
      {
        status: 'completed',
        completedAt: new Date()
      }
    );

    // Get next waiting token
    const nextToken = await Token.findOne({
      service: req.params.serviceId,
      date: today,
      status: 'waiting'
    })
      .sort({ tokenNumber: 1 })
      .populate('user', 'name email')
      .populate('service', 'name category');

    if (!nextToken) {
      return res.status(404).json({ message: 'No more tokens in queue' });
    }

    nextToken.status = 'serving';
    nextToken.calledAt = new Date();
    await nextToken.save();

    // Get updated queue stats
    const waitingCount = await Token.countDocuments({
      service: req.params.serviceId,
      date: today,
      status: 'waiting'
    });

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      // Notify the specific service room
      io.to(`service-${req.params.serviceId}`).emit('queue-update', {
        type: 'token-called',
        serviceId: req.params.serviceId,
        token: nextToken,
        waitingCount
      });

      // Notify the specific user
      io.to(`user-${nextToken.user._id}`).emit('notification', {
        type: 'your-turn',
        title: '🎉 It\'s Your Turn!',
        message: `Token ${nextToken.displayNumber} is now being served at ${nextToken.service.name}`,
        token: nextToken
      });

      // Notify the next person in line (if any)
      const upcomingToken = await Token.findOne({
        service: req.params.serviceId,
        date: today,
        status: 'waiting'
      }).sort({ tokenNumber: 1 });

      if (upcomingToken) {
        io.to(`user-${upcomingToken.user}`).emit('notification', {
          type: 'almost-turn',
          title: '⏰ Get Ready!',
          message: `You're next in line for ${nextToken.service.name}!`,
          token: upcomingToken
        });
      }
    }

    res.json({
      currentToken: nextToken,
      waitingCount
    });
  } catch (error) {
    console.error('Call next error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/complete/:tokenId
// @desc    Mark a token as completed
// @access  Admin
router.put('/complete/:tokenId', async (req, res) => {
  try {
    const token = await Token.findById(req.params.tokenId);
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    token.status = 'completed';
    token.completedAt = new Date();
    await token.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`service-${token.service}`).emit('queue-update', {
        type: 'token-completed',
        serviceId: token.service,
        tokenId: token._id
      });
    }

    res.json(token);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/no-show/:tokenId
// @desc    Mark a token as no-show
// @access  Admin
router.put('/no-show/:tokenId', async (req, res) => {
  try {
    const token = await Token.findById(req.params.tokenId);
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    token.status = 'no_show';
    await token.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`service-${token.service}`).emit('queue-update', {
        type: 'token-no-show',
        serviceId: token.service,
        tokenId: token._id
      });
    }

    res.json(token);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get system analytics
// @access  Admin
router.get('/analytics', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Today's stats
    const todayTokens = await Token.countDocuments({ date: today });
    const todayCompleted = await Token.countDocuments({ date: today, status: 'completed' });
    const todayWaiting = await Token.countDocuments({ date: today, status: 'waiting' });
    const todayServing = await Token.countDocuments({ date: today, status: 'serving' });

    // Calculate average wait time for today
    const completedToday = await Token.find({
      date: today,
      status: 'completed',
      calledAt: { $exists: true }
    });

    let avgWaitTime = 0;
    if (completedToday.length > 0) {
      const totalWait = completedToday.reduce((sum, t) => {
        const wait = (new Date(t.calledAt) - new Date(t.createdAt)) / 60000;
        return sum + wait;
      }, 0);
      avgWaitTime = Math.round(totalWait / completedToday.length);
    }

    // Total users
    const totalUsers = await User.countDocuments();
    const totalServices = await Service.countDocuments({ isActive: true });

    // Weekly data for chart
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const count = await Token.countDocuments({ date: dateStr });
      const completed = await Token.countDocuments({ date: dateStr, status: 'completed' });
      weeklyData.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        total: count,
        completed
      });
    }

    res.json({
      today: {
        total: todayTokens,
        completed: todayCompleted,
        waiting: todayWaiting,
        serving: todayServing,
        avgWaitTime
      },
      overall: {
        totalUsers,
        totalServices
      },
      weeklyData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/queue/:serviceId
// @desc    Get full queue for a service (admin view)
// @access  Admin
router.get('/queue/:serviceId', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const tokens = await Token.find({
      service: req.params.serviceId,
      date: today
    })
      .populate('user', 'name email phone')
      .sort({ tokenNumber: 1 });

    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
