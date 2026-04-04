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
    const contacts = await Contact.find({ user: req.user.id })
      .populate('contactUser', 'name status avatar phone')
      .lean(); // Lean for faster performance and better data manipulation

    const Message = require('../models/Message');
    const mongoose = require('mongoose');

    const formattedContacts = await Promise.all(contacts.map(async (contact) => {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const contactId = contact.contactUser._id;

        const lastMessage = await Message.findOne({
            $or: [
                { sender: userId, receiver: contactId },
                { sender: contactId, receiver: userId }
            ]
        }).sort({ timestamp: -1 });

        return {
            ...contact,
            lastMessage: lastMessage ? lastMessage.text : contact.contactUser.status,
            lastMessageTime: lastMessage ? lastMessage.timestamp : null
        };
    }));

    res.json(formattedContacts);
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
