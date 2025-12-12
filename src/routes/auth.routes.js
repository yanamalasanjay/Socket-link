/**
 * AUTH ROUTES
 *
 * Defines the API endpoints for authentication
 *
 * WHAT ARE ROUTES?
 * - URL patterns that map to controller functions
 * - Define which HTTP method (GET, POST, etc.)
 * - Connect URLs to business logic
 *
 * Think of it as a phonebook:
 * - "POST /api/auth/register" → authController.register
 * - "POST /api/auth/login" → authController.login
 */

const express = require('express');
const router = express.Router();

// Import controller functions
const authController = require('../controllers/auth.controller');

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

/**
 * ROUTE STRUCTURE:
 *
 * router.METHOD(PATH, HANDLER)
 *
 * - METHOD: HTTP verb (get, post, put, delete, etc.)
 * - PATH: URL pattern (relative to base path)
 * - HANDLER: Function to handle the request
 */

// ----------------------------------------------------------------------------
// POST /api/auth/register
// Create new user account
// ----------------------------------------------------------------------------

/**
 * REGISTER ENDPOINT
 *
 * Full URL: http://localhost:3001/api/auth/register
 *
 * Request:
 * {
 *   "username": "alice",
 *   "password": "SecurePass123"
 * }
 *
 * Success Response (201):
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "user": {
 *     "userId": "...",
 *     "username": "alice",
 *     "createdAt": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 *
 * Error Response (400/409/500):
 * {
 *   "error": "...",
 *   "message": "..."
 * }
 */

router.post('/register', authController.register);

// ----------------------------------------------------------------------------
// POST /api/auth/login
// Authenticate user and get JWT token
// ----------------------------------------------------------------------------

/**
 * LOGIN ENDPOINT
 *
 * Full URL: http://localhost:3001/api/auth/login
 *
 * Request:
 * {
 *   "username": "alice",
 *   "password": "SecurePass123"
 * }
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "userId": "...",
 *     "username": "alice",
 *     "createdAt": "..."
 *   }
 * }
 *
 * Client must store the token and include it in future requests:
 * - HTTP: Authorization: Bearer <token>
 * - Socket.IO: auth: { token: <token> }
 *
 * Error Response (400/401/500):
 * {
 *   "error": "...",
 *   "message": "..."
 * }
 */

router.post('/login', authController.login);

// ----------------------------------------------------------------------------
// GET /api/auth/users (DEBUGGING ONLY)
// Get list of all registered users
// ----------------------------------------------------------------------------

/**
 * ⚠️ WARNING: Remove this in production!
 *
 * This is only for learning/debugging.
 * It exposes all usernames (not passwords).
 *
 * Full URL: http://localhost:3001/api/auth/users
 *
 * Response:
 * {
 *   "count": 3,
 *   "users": [
 *     { "userId": "...", "username": "alice", "createdAt": "..." },
 *     { "userId": "...", "username": "bob", "createdAt": "..." },
 *     { "userId": "...", "username": "charlie", "createdAt": "..." }
 *   ]
 * }
 */

router.get('/users', authController.getAllUsers);

// ============================================================================
// EXPORT ROUTER
// ============================================================================

/**
 * Export router so it can be used in server
 *
 * In index.js:
 * app.use('/api/auth', authRoutes);
 *
 * This means:
 * - All routes here are prefixed with /api/auth
 * - POST /register becomes POST /api/auth/register
 * - POST /login becomes POST /api/auth/login
 */

module.exports = router;

// ============================================================================
// TESTING THE API
// ============================================================================

/**
 * You can test these endpoints using:
 *
 * 1. POSTMAN
 * 2. cURL
 * 3. JavaScript fetch()
 * 4. VS Code REST Client extension
 *
 * Example with cURL:
 *
 * # Register
 * curl -X POST http://localhost:3001/api/auth/register \
 *   -H "Content-Type: application/json" \
 *   -d '{"username":"alice","password":"SecurePass123"}'
 *
 * # Login
 * curl -X POST http://localhost:3001/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"username":"alice","password":"SecurePass123"}'
 *
 * # Get Users
 * curl http://localhost:3001/api/auth/users
 */

/**
 * Example with JavaScript fetch():
 *
 * // Register
 * fetch('http://localhost:3001/api/auth/register', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     username: 'alice',
 *     password: 'SecurePass123'
 *   })
 * })
 * .then(res => res.json())
 * .then(data => console.log(data));
 *
 * // Login
 * fetch('http://localhost:3001/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     username: 'alice',
 *     password: 'SecurePass123'
 *   })
 * })
 * .then(res => res.json())
 * .then(data => {
 *   // Store token
 *   localStorage.setItem('token', data.token);
 *   console.log('Logged in!', data);
 * });
 */
