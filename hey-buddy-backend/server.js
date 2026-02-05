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
// 🔒 CORS CONFIGURATION
// ====================================================
const allowedOrigins = [
  "http://localhost:5173",           // Vite Localhost
  "http://localhost:3000",           // React Localhost
  "https://hey-buddy-fullstack.onrender.com", // Your Live Frontend
  "https://hey-buddy-frontend.onrender.com"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
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
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// 👇 THIS IS THE CRITICAL FIX 👇
app.set('socketio', io); 
// 👆 Now your controllers can use socket.io!

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User joins their own personal room (based on User ID)
  // This allows us to send notifications to specific users
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
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