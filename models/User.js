const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'Hey there! I am using WhatsApp.',
  },
  avatar: {
    type: String,
    default: 'https://randomuser.me/api/portraits/lego/1.jpg',
  },
  country: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
