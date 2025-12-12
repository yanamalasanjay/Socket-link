/**
 * Socket.IO Authentication Middleware
 *
 * WHAT IS MIDDLEWARE?
 * Middleware is code that runs BETWEEN receiving a request and processing it.
 * Think of it like airport security - you pass through security before boarding.
 *
 * SOCKET.IO MIDDLEWARE:
 * Socket.IO middleware runs when a client tries to connect.
 * We use it to verify the client's JWT token before allowing the connection.
 *
 * FLOW:
 * 1. Client attempts to connect with JWT token
 * 2. This middleware intercepts the connection attempt
 * 3. Middleware verifies the JWT token
 * 4. If valid: Allow connection + attach user data to socket
 * 5. If invalid: Reject connection with error
 */

const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Socket.IO authentication middleware
 *
 * @param {Socket} socket - The Socket.IO socket object
 * @param {Function} next - Call this to allow connection or pass error
 *
 * HOW TO USE:
 * io.use(socketAuthMiddleware);
 *
 * WHAT IT DOES:
 * - Extracts JWT token from socket handshake
 * - Verifies the token
 * - Attaches user data (userId, username) to socket object
 * - Allows or rejects the connection
 */
function socketAuthMiddleware(socket, next) {
  try {
    // Extract token from handshake authentication
    // Client sends this when connecting: io('http://localhost:3000', { auth: { token: 'xxx' } })
    const token = socket.handshake.auth.token;

    // Check if token was provided
    if (!token) {
      logger.warn('Socket connection attempt without token');
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify the JWT token
    // This will throw an error if token is invalid or expired
    const decoded = verifyToken(token);

    // Token is valid! Attach user data to the socket object
    // Now every event handler can access socket.userId and socket.username
    socket.userId = decoded.userId;
    socket.username = decoded.username;

    // Log successful authentication
    logger.socket('AUTH', `User authenticated: ${socket.username} (ID: ${socket.userId})`);

    // Allow the connection to proceed
    next();

  } catch (error) {
    // Token verification failed
    logger.error('Socket authentication failed:', error.message);

    // Reject the connection with error message
    // Client will receive this in 'connect_error' event
    next(new Error('Authentication error: ' + error.message));
  }
}

module.exports = socketAuthMiddleware;

/**
 * EXAMPLE USAGE IN SERVER:
 *
 * const io = new Server(httpServer);
 * io.use(socketAuthMiddleware);
 *
 * io.on('connection', (socket) => {
 *   // At this point, we KNOW the user is authenticated
 *   console.log('Authenticated user:', socket.username);
 *
 *   socket.on('send_message', (data) => {
 *     // We can trust socket.username because it came from verified JWT
 *     const message = {
 *       text: data.text,
 *       sender: socket.username, // This is secure!
 *       senderId: socket.userId
 *     };
 *   });
 * });
 */
