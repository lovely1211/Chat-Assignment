require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors'); 
const { Server } = require('socket.io');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const db = require('./config/db'); 

const app = express();
const PORT = 8001;

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
}));

app.use(express.json()); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Handle socket connections
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  // Mark user as online
  db.query('UPDATE users SET is_online = true WHERE id = ?', [userId]);

  socket.on('disconnect', () => {
    // Mark user as offline
    db.query('UPDATE users SET is_online = false WHERE id = ?', [userId]);
  });
});

// API Routes
app.use('/api', userRoutes);
app.use('/api/messages', messageRoutes);

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
