require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // New Import
const { Server } = require('socket.io'); // New Import
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app); // Wrap express in HTTP server

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all connections (for now)
    methods: ["GET", "POST"]
  }
});

// Make 'io' accessible in controllers
app.set('socketio', io);

// Middleware
app.use(express.json());
app.use(cors());

connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Socket Connection Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a specific room based on User ID
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Change app.listen to server.listen