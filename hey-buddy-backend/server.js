const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// ====================================================
// 🔒 CORS CONFIGURATION (The Fix for the Red Error)
// ====================================================
const allowedOrigins = [
  "http://localhost:5173",          // Localhost (Vite)
  "http://localhost:3000",          // Localhost (Standard React)
  "https://hey-buddy-fullstack.vercel.app" // 👈 THIS IS KEY: Your Live Vercel Frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true // Allow cookies/headers if needed
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatRoutes')); 

// ====================================================
// 💬 SOCKET.IO CONFIGURATION
// ====================================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Must match the Express origins above
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User joins a chat room (usually the Goal ID or Match ID)
  socket.on('join_room', (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  // User sends a message
  socket.on('send_message', (data) => {
    // Broadcast to everyone else in that room
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

// Error Handler
app.use(errorHandler);

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server started on port ${port}`));
// Fixing CORS deployment