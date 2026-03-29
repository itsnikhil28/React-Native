const express = require('express');
const router = express.Router();
const User = require('../models/User');

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
        return res.status(200).json({ msg: "User exists, OTP simulated", user });
    }

    // New user, create
    user = new User({
      phone,
      country,
      otp: "123456" // Default OTP for this clone
    });

    await user.save();
    res.status(201).json({ msg: "User registered successfully", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
