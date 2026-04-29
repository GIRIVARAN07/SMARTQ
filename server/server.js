require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const socketHandler = require('./socket');

// Route imports
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const tokenRoutes = require('./routes/tokens');
const adminRoutes = require('./routes/admin');

const path = require('path');

const app = express();
const server = http.createServer(app);

// Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make io accessible to routes
app.set('io', io);

// Initialize socket handlers
socketHandler(io);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║     🚀 SmartQ Server is Running!         ║');
    console.log(`║     📡 Port: ${PORT}                        ║`);
    console.log(`║     🌍 Mode: ${process.env.NODE_ENV || 'development'}              ║`);
    console.log('║     ⚡ Socket.io: Enabled                ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
  });
};

startServer();
