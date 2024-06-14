import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connection.js';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import ChatMessage from './models/ChatMessage.js';
import userRoutes from './routes/user.js';
import reviewRoutes from './routes/review.js';
import chatRoutes from './routes/chat.js';

// Load environment variables
dotenv.config();

// Get the resolved path to the file and the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Setting up the port
const PORT = process.env.PORT || 5051;

// Initialize the Express application
const app = express();

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images
app.use('/images', express.static(path.join(__dirname, '../client/images')));

// Serve React build files
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);

// Catch-all handler to send back React's index.html file for any request that doesn't match the above routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', ({ userId, recipientId }) => {
    const roomName = [userId, recipientId].sort().join('-');
    socket.join(roomName);
    console.log(`User ${userId} joined room ${roomName}`);
  });

  socket.on('leaveRoom', ({ userId, recipientId }) => {
    const roomName = [userId, recipientId].sort().join('-');
    socket.leave(roomName);
    console.log(`User ${userId} left room ${roomName}`);
  });

  socket.on('sendMessage', async (data) => {
    const { sender, recipient, message } = data;
    const newMessage = new ChatMessage({ sender, recipient, message });
    await newMessage.save();
    const roomName = [sender, recipient].sort().join('-');
    io.to(roomName).emit('receiveMessage', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
