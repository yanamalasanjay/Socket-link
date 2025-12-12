/**
 * SocketLink - Real-Time Chat Application
 *
 * SIMPLIFIED VERSION FOR BEGINNERS
 *
 * This is the main entry point of our application.
 * We keep everything simple and easy to understand.
 *
 * Tech Stack:
 * - Node.js: JavaScript runtime
 * - Express: Web server framework
 * - Socket.IO: Real-time communication
 * - JWT: Authentication tokens
 * - bcrypt: Password hashing
 *
 * Author: Beginner-Friendly Version
 * Purpose: Learning backend development with real-time features
 */

// ============================================================================
// STEP 1: LOAD ENVIRONMENT VARIABLES
// ============================================================================

// This MUST be first - loads variables from .env file
// Example: process.env.PORT, process.env.JWT_SECRET
require('dotenv').config();

// ============================================================================
// STEP 2: IMPORT DEPENDENCIES (npm packages)
// ============================================================================

const express = require('express');          // Web server framework
const { createServer } = require('http');    // Node's built-in HTTP server
const { Server } = require('socket.io');     // Real-time WebSocket library
const cors = require('cors');                // Allow cross-origin requests
const path = require('path');                // File path utilities

// ============================================================================
// STEP 3: IMPORT OUR CUSTOM MODULES
// ============================================================================

const authRoutes = require('./routes/auth.routes');
const socketHandler = require('./controllers/socket.controller');
const { authenticateSocket } = require('./middleware/auth.middleware');

// ============================================================================
// STEP 4: CREATE EXPRESS APP AND HTTP SERVER
// ============================================================================

const app = express();

// WHY we create HTTP server manually instead of app.listen()?
// Because Socket.IO needs the HTTP server instance to attach WebSocket support
const httpServer = createServer(app);

// ============================================================================
// STEP 5: CREATE SOCKET.IO SERVER
// ============================================================================

const io = new Server(httpServer, {
  // CORS configuration for Socket.IO
  cors: {
    origin: "*",  // In development, allow all origins
    // In production, change to: origin: "https://yourdomain.com"
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ============================================================================
// STEP 6: MIDDLEWARE SETUP
// ============================================================================

/**
 * WHAT IS MIDDLEWARE?
 *
 * Middleware = Functions that run BEFORE your route handlers
 * Think of it as a security checkpoint at an airport:
 * 1. Check passport (CORS)
 * 2. Scan baggage (Parse JSON)
 * 3. Verify ticket (Authentication)
 * 4. Board plane (Your route handler)
 *
 * ORDER MATTERS! They execute top to bottom.
 */

// 1. CORS - Allow requests from different origins (frontend on different port)
app.use(cors());

// 2. JSON Parser - Convert request body from JSON string to JavaScript object
app.use(express.json());

// 3. URL Encoder - Parse form data
app.use(express.urlencoded({ extended: true }));

// 4. Static Files - Serve HTML, CSS, JavaScript from 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// 5. Logging - Log every request (helpful for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // IMPORTANT: Call next() to continue to the next middleware
});

// ============================================================================
// STEP 7: API ROUTES (REST API Endpoints)
// ============================================================================

/**
 * WHAT IS A ROUTE?
 *
 * Route = URL path + HTTP method
 * Example: POST /api/auth/login
 *
 * When client sends: POST http://localhost:3001/api/auth/login
 * Express finds the matching route and calls its handler
 */

// Health check - Test if server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'SocketLink server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() // How long server has been running (seconds)
  });
});

// Authentication routes (register, login)
app.use('/api/auth', authRoutes);

// 404 handler - Catch any undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

// ============================================================================
// STEP 8: SOCKET.IO AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * WEBSOCKET AUTHENTICATION
 *
 * Unlike HTTP requests, WebSocket connections stay open.
 * We need to verify the user BEFORE allowing the connection.
 *
 * Flow:
 * 1. Client connects with JWT token
 * 2. This middleware verifies the token
 * 3. If valid: Allow connection
 * 4. If invalid: Reject connection
 */

io.use(authenticateSocket);

// ============================================================================
// STEP 9: SOCKET.IO CONNECTION HANDLER
// ============================================================================

/**
 * HANDLE WEBSOCKET CONNECTIONS
 *
 * When a client connects:
 * 1. 'connection' event fires
 * 2. We get a 'socket' object representing that client
 * 3. We can listen to events from that client
 * 4. We can send events to that client
 *
 * One socket = One connected client
 */

io.on('connection', (socket) => {
  // At this point, authentication passed (thanks to middleware)
  // socket.userId and socket.username are set by authenticateSocket

  console.log(`✅ User connected: ${socket.username} (ID: ${socket.id})`);

  // Delegate all socket event handling to socket controller
  // This keeps this file clean and organized
  socketHandler(io, socket);

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.username} (${reason})`);
  });
});

// ============================================================================
// STEP 10: START THE SERVER
// ============================================================================

const PORT = process.env.PORT || 3003;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              SocketLink Server Started! 🚀                ║
║                                                            ║
║  HTTP Server:    http://localhost:${PORT}                    ║
║  Socket.IO:      ws://localhost:${PORT}                      ║
║                                                            ║
║  Environment:    ${process.env.NODE_ENV || 'development'}                   ║
║                                                            ║
║  Press Ctrl+C to stop                                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  console.log('✅ Server is ready to accept connections');
  console.log('📝 Try: http://localhost:' + PORT);
});

// ============================================================================
// STEP 11: GRACEFUL SHUTDOWN
// ============================================================================

/**
 * WHAT IS GRACEFUL SHUTDOWN?
 *
 * When server stops (Ctrl+C or crash):
 * - Close all connections properly
 * - Save any pending data
 * - Clean up resources
 *
 * WHY?
 * - Prevents data loss
 * - Doesn't leave clients hanging
 * - Professional approach
 */

function shutdown() {
  console.log('\n⚠️  Shutting down gracefully...');

  // Close Socket.IO connections
  io.close(() => {
    console.log('✅ Socket.IO connections closed');
  });

  // Close HTTP server
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    console.log('👋 Goodbye!');
    process.exit(0);
  });

  // Force exit if it takes too long (10 seconds)
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Listen for shutdown signals
process.on('SIGTERM', shutdown); // Termination signal
process.on('SIGINT', shutdown);  // Ctrl+C

// Handle uncaught errors (prevents crashes)
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  shutdown();
});

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

module.exports = { app, httpServer, io };
