const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Initialize config
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

const http = require('http');
const socketio = require('socket.io');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/chat', require('./routes/chat'));

// Basic testing
app.get('/', (req, res) => {
  res.send('WhatsApp Backend API Running...');
});

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket logic
io.on('connection', (socket) => {
  console.log('New WebSocket connection:', socket.id);

  socket.on('join', ({ userId }) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on('sendMessage', async ({ senderId, receiverId, text }) => {
    try {
      const Message = require('./models/Message');
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        text
      });
      await newMessage.save();

      // Emit to BOTH sender and receiver's individual rooms
      io.to(senderId).to(receiverId).emit('message', newMessage);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
});
