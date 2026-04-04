const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// @route   GET api/chat/history/:recipientId
// @desc    Get chat history between two users
// @access  Private
router.get('/history/:recipientId', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const recipientId = req.params.recipientId;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: recipientId },
        { sender: recipientId, receiver: senderId },
      ],
    }).sort({ timestamp: -1 }); // Newest first for inverted list

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/chat/clear/:recipientId
// @desc    Clear chat history between two users
// @access  Private
router.delete('/clear/:recipientId', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const recipientId = req.params.recipientId;

    await Message.deleteMany({
      $or: [
        { sender: senderId, receiver: recipientId },
        { sender: recipientId, receiver: senderId },
      ],
    });

    res.json({ msg: 'Chat history cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
