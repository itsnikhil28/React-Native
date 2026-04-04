const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/profile', auth, async (req, res) => {
  const { name, status, avatar } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (name !== undefined) user.name = name;
    if (status !== undefined) user.status = status;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- Register / Login User ---
router.post('/register', async (req, res) => {
  try {
    const { phone, country } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ phone });
    
    if (user) {
        // User already in DB, update their state
        user.otp = "123456"; // Simulate sending OTP
        await user.save();
        
        // Create Payload
        const payload = {
          user: {
            id: user.id,
            phone: user.phone
          },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
        return res.status(200).json({ msg: "User exists, OTP simulated", user, token });
    }

    // New user, create
    user = new User({
      phone,
      country,
      otp: "123456" // Default OTP for this clone
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        phone: user.phone
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ msg: "User registered successfully", user, token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
