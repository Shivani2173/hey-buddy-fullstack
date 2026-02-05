const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

connectDB();

const app = express();
const server = http.createServer(app);

// ====================================================
// 🔓 THE FIX: ALLOW EVERYTHING (WILDCARD)
// ====================================================
app.use(cors({
  origin: "*",  // Allow ANY website to connect
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
    origin: "*", // Allow ANY website to connect to Sockets
    methods: ["GET", "POST"],
  },
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

app.use(errorHandler);

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server started on port ${port}`));