const jwt = require('jsonwebtoken');

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
