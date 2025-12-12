/**
 * AUTHENTICATION MIDDLEWARE
 *
 * WHAT IS MIDDLEWARE?
 * - Function that runs BEFORE your route handler
 * - Can modify request/response
 * - Can stop request (if unauthorized)
 * - Can pass to next middleware
 *
 * Think of it like airport security:
 * 1. Check ticket (middleware checks JWT)
 * 2. If valid → let through (next())
 * 3. If invalid → stop (send error response)
 */

const jwt = require('jsonwebtoken');

// ============================================================================
// SOCKET.IO AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Authenticates WebSocket connections
 *
 * WEBSOCKET AUTHENTICATION CHALLENGE:
 * - Cannot use HTTP headers easily
 * - Connection happens once, then stays open
 * - Need to verify BEFORE allowing connection
 *
 * SOLUTION:
 * - Client sends token during connection
 * - We verify it here
 * - If valid: Allow connection
 * - If invalid: Reject connection
 *
 * @param {Socket} socket - The socket connection
 * @param {Function} next - Call this to continue or reject
 */

exports.authenticateSocket = (socket, next) => {
  /**
   * FLOW:
   * 1. Extract token from handshake
   * 2. Verify token signature
   * 3. Check expiration
   * 4. Attach user data to socket
   * 5. Allow connection
   */

  try {
    // ------------------------------------------------------------------------
    // STEP 1: EXTRACT TOKEN
    // ------------------------------------------------------------------------

    /**
     * Client sends token during connection:
     *
     * const socket = io('http://localhost:3001', {
     *   auth: {
     *     token: 'eyJhbGc...'
     *   }
     * });
     *
     * We access it via: socket.handshake.auth.token
     */

    const token = socket.handshake.auth.token;

    console.log(`🔐 Auth attempt for socket: ${socket.id}`);

    // Check if token exists
    if (!token) {
      console.log(`❌ No token provided (socket: ${socket.id})`);

      return next(new Error('Authentication error: No token provided'));
      // This stops the connection and sends error to client
    }

    // ------------------------------------------------------------------------
    // STEP 2: VERIFY TOKEN
    // ------------------------------------------------------------------------

    /**
     * jwt.verify() does THREE things:
     *
     * 1. Decode token (base64 → JSON)
     * 2. Verify signature (ensure not tampered)
     * 3. Check expiration (ensure not expired)
     *
     * If any check fails → throws error
     * If all pass → returns payload
     */

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /**
     * decoded = {
     *   userId: '...',
     *   username: '...',
     *   iat: 1234567890,  // Issued At (timestamp)
     *   exp: 1234571490   // Expiration (timestamp)
     * }
     */

    console.log(`✅ Token verified for: ${decoded.username}`);

    // ------------------------------------------------------------------------
    // STEP 3: ATTACH USER DATA TO SOCKET
    // ------------------------------------------------------------------------

    /**
     * WHY attach to socket?
     * - Avoid verifying token for every event
     * - Easy access to user info in handlers
     * - socket.userId and socket.username available everywhere
     */

    socket.userId = decoded.userId;
    socket.username = decoded.username;

    // ------------------------------------------------------------------------
    // STEP 4: ALLOW CONNECTION
    // ------------------------------------------------------------------------

    /**
     * Call next() with no arguments = Allow connection
     * Next steps:
     * - 'connection' event fires on server
     * - Socket handler is called
     * - User can now send/receive events
     */

    next(); // ✅ Authentication successful

  } catch (error) {
    // ------------------------------------------------------------------------
    // ERROR HANDLING
    // ------------------------------------------------------------------------

    /**
     * Common errors:
     * - JsonWebTokenError: Invalid token (tampered/malformed)
     * - TokenExpiredError: Token expired
     * - NotBeforeError: Token used before valid
     */

    console.log(`❌ Auth failed (socket: ${socket.id}): ${error.message}`);

    // Send error to client
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    } else {
      return next(new Error('Authentication error: ' + error.message));
    }
  }
};

// ============================================================================
// HTTP AUTHENTICATION MIDDLEWARE (Optional - for protected REST routes)
// ============================================================================

/**
 * Authenticates HTTP requests
 *
 * Use this for protected REST API endpoints
 *
 * Example:
 * router.get('/protected', authenticateHTTP, controller);
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Call to continue to next middleware/route
 */

exports.authenticateHTTP = (req, res, next) => {
  try {
    // ------------------------------------------------------------------------
    // STEP 1: EXTRACT TOKEN FROM HEADER
    // ------------------------------------------------------------------------

    /**
     * Client sends token in Authorization header:
     *
     * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *
     * Format: "Bearer <token>"
     */

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided'
      });
    }

    // Split "Bearer eyJhbG..." → ["Bearer", "eyJhbG..."]
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Use: Bearer <token>'
      });
    }

    const token = parts[1];

    // ------------------------------------------------------------------------
    // STEP 2: VERIFY TOKEN
    // ------------------------------------------------------------------------

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ------------------------------------------------------------------------
    // STEP 3: ATTACH USER DATA TO REQUEST
    // ------------------------------------------------------------------------

    /**
     * req.user will be available in route handlers
     *
     * Example:
     * router.get('/profile', authenticateHTTP, (req, res) => {
     *   const userId = req.user.userId; // ✅ Available here
     * });
     */

    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };

    // ------------------------------------------------------------------------
    // STEP 4: CONTINUE TO ROUTE HANDLER
    // ------------------------------------------------------------------------

    next(); // ✅ Authentication successful

  } catch (error) {
    // ------------------------------------------------------------------------
    // ERROR HANDLING
    // ------------------------------------------------------------------------

    console.error('❌ HTTP Auth error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired. Please login again.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    } else {
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Authentication failed'
      });
    }
  }
};

// ============================================================================
// EXPLANATION: WHY TWO MIDDLEWARES?
// ============================================================================

/**
 * HTTP Middleware (authenticateHTTP):
 * - For REST API endpoints
 * - Token in Authorization header
 * - Request → Response flow
 *
 * Socket Middleware (authenticateSocket):
 * - For WebSocket connections
 * - Token in handshake
 * - Persistent connection
 *
 * SAME CONCEPT, DIFFERENT IMPLEMENTATION
 * Both verify JWT, just extract it from different places
 */
