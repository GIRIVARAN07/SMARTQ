const express = require('express');
const Service = require('../models/Service');
const Token = require('../models/Token');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all active services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const services = await Service.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Add current queue info for each service
    const today = new Date().toISOString().split('T')[0];
    const servicesWithQueue = await Promise.all(
      services.map(async (service) => {
        const waitingCount = await Token.countDocuments({
          service: service._id,
          date: today,
          status: 'waiting'
        });
        const currentServing = await Token.findOne({
          service: service._id,
          date: today,
          status: 'serving'
        });
        const totalToday = await Token.countDocuments({
          service: service._id,
          date: today
        });

        return {
          ...service.toObject(),
          queueInfo: {
            waitingCount,
            currentToken: currentServing ? currentServing.displayNumber : 'N/A',
            totalToday,
            estimatedWait: waitingCount * service.estimatedTimePerToken
          }
        };
      })
    );

    res.json(servicesWithQueue);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('createdBy', 'name');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/services
// @desc    Create a new service
// @access  Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, category, icon, estimatedTimePerToken, maxTokensPerDay, operatingHours, location } = req.body;

    const service = await Service.create({
      name,
      description,
      category,
      icon,
      estimatedTimePerToken: estimatedTimePerToken || 10,
      maxTokensPerDay: maxTokensPerDay || 100,
      operatingHours,
      location,
      createdBy: req.user._id
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
