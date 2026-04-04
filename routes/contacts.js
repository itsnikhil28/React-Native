const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Contact = require('../models/Contact');

// @route   GET api/contacts
// @desc    Get all user contacts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/contacts/add
// @desc    Add a contact
// @access  Private
router.post('/add', auth, async (req, res) => {
  const { phone, name } = req.body;

  try {
    // Check if the contact user exists in our system
    let contactUser = await User.findOne({ phone });
    
    // If contact user doesn't exist, we can't add them yet (or we can create a placeholder)
    // For now, let's assume they must be registered.
    if (!contactUser) {
        return res.status(404).json({ msg: 'User with this phone number not found. They must register first.' });
    }

    // Check if contact already added
    let existingContact = await Contact.findOne({ user: req.user.id, contactUser: contactUser.id });
    if (existingContact) {
        return res.status(400).json({ msg: 'Contact already in your list' });
    }

    const newContact = new Contact({
      user: req.user.id,
      contactUser: contactUser.id,
      name,
      phone
    });

    const contact = await newContact.save();
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
