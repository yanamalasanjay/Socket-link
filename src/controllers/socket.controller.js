/**
 * SOCKET CONTROLLER
 *
 * Handles all Socket.IO events (real-time communication)
 *
 * WHAT IS SOCKET.IO?
 * - Library for real-time, bidirectional communication
 * - Built on WebSocket protocol
 * - Works like a phone call (always connected)
 * - Unlike HTTP (which is like sending letters)
 *
 * EVENTS:
 * - Server can send to client anytime
 * - Client can send to server anytime
 * - Perfect for: Chat, notifications, live updates
 */

// ============================================================================
// IN-MEMORY ROOM STORAGE
// ============================================================================

/**
 * ROOMS DATA STRUCTURE
 *
 * Map<roomName, Set<username>>
 *
 * Example:
 * rooms = Map {
 *   'general' => Set { 'alice', 'bob', 'charlie' },
 *   'random' => Set { 'alice', 'david' }
 * }
 *
 * Set is used because:
 * - Automatically prevents duplicates
 * - Fast add/remove operations
 * - Easy to check if user is in room
 */

const rooms = new Map();

// ============================================================================
// MAIN SOCKET HANDLER
// ============================================================================

/**
 * This function is called for EACH connected client
 *
 * @param {SocketIO.Server} io - The Socket.IO server instance
 * @param {SocketIO.Socket} socket - Individual client connection
 */

module.exports = (io, socket) => {

  /**
   * At this point:
   * - User is authenticated (verified by middleware)
   * - socket.userId and socket.username are set
   * - socket.id is unique ID for this connection
   */

  console.log(`🔌 Socket handler initialized for: ${socket.username}`);

  // ==========================================================================
  // EVENT: get_rooms
  // Client asks for list of all available rooms
  // ==========================================================================

  socket.on('get_rooms', () => {
    /**
     * Convert Map keys to Array
     * Example: Map { 'general' => Set, 'random' => Set }
     *       => ['general', 'random']
     */

    const roomList = Array.from(rooms.keys());

    socket.emit('rooms_list', roomList);

    console.log(`📋 Sent room list to ${socket.username}: ${roomList.length} rooms`);
  });

  // ==========================================================================
  // EVENT: create_room
  // Client wants to create a new chat room
  // ==========================================================================

  socket.on('create_room', (data) => {
    /**
     * FLOW:
     * 1. Validate room name
     * 2. Check if room already exists
     * 3. Create empty room
     * 4. Notify ALL clients about new room
     */

    const { roomName } = data;

    console.log(`🏗️  Room creation request: "${roomName}" by ${socket.username}`);

    // -------------------------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------------------------

    if (!roomName || typeof roomName !== 'string') {
      socket.emit('error', {
        message: 'Invalid room name',
        code: 'INVALID_ROOM_NAME'
      });
      return;
    }

    // Trim whitespace
    const trimmedName = roomName.trim();

    if (trimmedName.length === 0) {
      socket.emit('error', {
        message: 'Room name cannot be empty',
        code: 'EMPTY_ROOM_NAME'
      });
      return;
    }

    if (trimmedName.length > 50) {
      socket.emit('error', {
        message: 'Room name too long (max 50 characters)',
        code: 'ROOM_NAME_TOO_LONG'
      });
      return;
    }

    // -------------------------------------------------------------------------
    // CHECK IF ROOM EXISTS
    // -------------------------------------------------------------------------

    if (rooms.has(trimmedName)) {
      socket.emit('error', {
        message: 'Room already exists',
        code: 'ROOM_EXISTS'
      });
      return;
    }

    // -------------------------------------------------------------------------
    // CREATE ROOM
    // -------------------------------------------------------------------------

    /**
     * Create empty Set for storing usernames
     * Initially empty because creator hasn't joined yet
     */

    rooms.set(trimmedName, new Set());

    console.log(`✅ Room created: "${trimmedName}"`);

    // -------------------------------------------------------------------------
    // BROADCAST TO ALL CLIENTS
    // -------------------------------------------------------------------------

    /**
     * io.emit() = Send to ALL connected clients
     * socket.emit() = Send to THIS client only
     * socket.broadcast.emit() = Send to everyone EXCEPT this client
     */

    io.emit('room_created', {
      roomName: trimmedName,
      createdBy: socket.username,
      timestamp: Date.now()
    });

    // Also send success confirmation to creator
    socket.emit('room_create_success', {
      roomName: trimmedName
    });
  });

  // ==========================================================================
  // EVENT: join_room
  // Client wants to join a specific room
  // ==========================================================================

  socket.on('join_room', (data) => {
    /**
     * FLOW:
     * 1. Validate room name
     * 2. Leave current room (if any)
     * 3. Join new room
     * 4. Update room tracking
     * 5. Notify others in room
     * 6. Send room info to user
     */

    const { roomName } = data;

    console.log(`🚪 Join request: ${socket.username} → "${roomName}"`);

    // -------------------------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------------------------

    if (!roomName) {
      socket.emit('error', {
        message: 'Room name is required',
        code: 'MISSING_ROOM_NAME'
      });
      return;
    }

    // -------------------------------------------------------------------------
    // LEAVE PREVIOUS ROOMS
    // -------------------------------------------------------------------------

    /**
     * User can only be in ONE room at a time
     * socket.rooms is a Set containing:
     * - socket.id (always present)
     * - Any rooms the socket has joined
     */

    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) { // Don't leave the socket's own room
        socket.leave(room);

        // Update our tracking
        if (rooms.has(room)) {
          rooms.get(room).delete(socket.username);

          console.log(`👋 ${socket.username} left "${room}"`);
        }
      }
    });

    // -------------------------------------------------------------------------
    // JOIN NEW ROOM
    // -------------------------------------------------------------------------

    /**
     * Socket.IO Rooms:
     * - Like channels or groups
     * - Can broadcast to all users in a room
     * - User can be in multiple rooms (but we limit to one for simplicity)
     */

    socket.join(roomName);
    socket.currentRoom = roomName; // Store for easy access

    // Update our tracking
    if (!rooms.has(roomName)) {
      // Auto-create room if it doesn't exist
      rooms.set(roomName, new Set());
    }
    rooms.get(roomName).add(socket.username);

    const userCount = rooms.get(roomName).size;

    console.log(`✅ ${socket.username} joined "${roomName}" (${userCount} users)`);

    // -------------------------------------------------------------------------
    // NOTIFY OTHERS IN ROOM
    // -------------------------------------------------------------------------

    /**
     * socket.to(roomName) = Send to everyone in room EXCEPT sender
     */

    socket.to(roomName).emit('user_joined', {
      username: socket.username,
      roomName,
      userCount,
      timestamp: Date.now()
    });

    // -------------------------------------------------------------------------
    // SEND ROOM INFO TO USER
    // -------------------------------------------------------------------------

    socket.emit('joined_room', {
      roomName,
      users: Array.from(rooms.get(roomName)), // Convert Set to Array
      userCount,
      message: `Welcome to ${roomName}!`
    });
  });

  // ==========================================================================
  // EVENT: leave_room
  // Client wants to leave current room
  // ==========================================================================

  socket.on('leave_room', () => {
    if (!socket.currentRoom) {
      socket.emit('error', {
        message: 'You are not in any room',
        code: 'NOT_IN_ROOM'
      });
      return;
    }

    const roomName = socket.currentRoom;

    // Remove from Socket.IO room
    socket.leave(roomName);

    // Update tracking
    if (rooms.has(roomName)) {
      rooms.get(roomName).delete(socket.username);

      const userCount = rooms.get(roomName).size;

      console.log(`👋 ${socket.username} left "${roomName}" (${userCount} remaining)`);

      // Notify others
      socket.to(roomName).emit('user_left', {
        username: socket.username,
        roomName,
        userCount,
        timestamp: Date.now()
      });

      // Delete empty rooms
      if (userCount === 0) {
        rooms.delete(roomName);
        console.log(`🗑️  Deleted empty room: "${roomName}"`);

        // Notify all clients
        io.emit('room_deleted', {
          roomName,
          reason: 'empty'
        });
      }
    }

    socket.currentRoom = null;

    socket.emit('left_room', {
      roomName,
      message: `You left ${roomName}`
    });
  });

  // ==========================================================================
  // EVENT: send_message
  // Client sends a message to their current room
  // ==========================================================================

  socket.on('send_message', (data) => {
    /**
     * FLOW:
     * 1. Check if user is in a room
     * 2. Validate message
     * 3. Create message object
     * 4. Broadcast to everyone in room (including sender)
     */

    // -------------------------------------------------------------------------
    // CHECK IF IN ROOM
    // -------------------------------------------------------------------------

    if (!socket.currentRoom) {
      socket.emit('error', {
        message: 'You must join a room first',
        code: 'NOT_IN_ROOM'
      });
      return;
    }

    // -------------------------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------------------------

    if (!data.text || typeof data.text !== 'string') {
      socket.emit('error', {
        message: 'Invalid message',
        code: 'INVALID_MESSAGE'
      });
      return;
    }

    const text = data.text.trim();

    if (text.length === 0) {
      socket.emit('error', {
        message: 'Message cannot be empty',
        code: 'EMPTY_MESSAGE'
      });
      return;
    }

    if (text.length > 1000) {
      socket.emit('error', {
        message: 'Message too long (max 1000 characters)',
        code: 'MESSAGE_TOO_LONG'
      });
      return;
    }

    // -------------------------------------------------------------------------
    // CREATE MESSAGE OBJECT
    // -------------------------------------------------------------------------

    const message = {
      messageId: generateMessageId(),
      text: text,
      sender: socket.username,
      senderId: socket.userId,
      roomName: socket.currentRoom,
      timestamp: Date.now()
    };

    console.log(`💬 [${message.roomName}] ${message.sender}: ${message.text}`);

    // -------------------------------------------------------------------------
    // BROADCAST TO ROOM
    // -------------------------------------------------------------------------

    /**
     * io.to(roomName).emit() = Send to everyone in room (including sender)
     *
     * Why include sender?
     * - Confirmation that message was sent
     * - All clients show the same message (consistency)
     */

    io.to(socket.currentRoom).emit('new_message', message);
  });

  // ==========================================================================
  // EVENT: typing
  // Client is typing (for "User is typing..." indicator)
  // ==========================================================================

  socket.on('typing', () => {
    if (socket.currentRoom) {
      // Send to everyone in room EXCEPT sender
      socket.to(socket.currentRoom).emit('user_typing', {
        username: socket.username,
        roomName: socket.currentRoom
      });
    }
  });

  // ==========================================================================
  // EVENT: stop_typing
  // Client stopped typing
  // ==========================================================================

  socket.on('stop_typing', () => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit('user_stop_typing', {
        username: socket.username,
        roomName: socket.currentRoom
      });
    }
  });

  // ==========================================================================
  // EVENT: disconnect
  // Client disconnects (closes tab, loses internet, etc.)
  // ==========================================================================

  socket.on('disconnect', (reason) => {
    /**
     * CLEANUP:
     * - Remove from current room
     * - Notify others
     * - Delete empty rooms
     */

    console.log(`🔴 ${socket.username} disconnected (${reason})`);

    if (socket.currentRoom && rooms.has(socket.currentRoom)) {
      const roomName = socket.currentRoom;

      rooms.get(roomName).delete(socket.username);
      const userCount = rooms.get(roomName).size;

      // Notify others
      socket.to(roomName).emit('user_left', {
        username: socket.username,
        roomName,
        userCount,
        timestamp: Date.now()
      });

      // Delete empty rooms
      if (userCount === 0) {
        rooms.delete(roomName);
        console.log(`🗑️  Deleted empty room: "${roomName}"`);

        io.emit('room_deleted', {
          roomName,
          reason: 'empty'
        });
      }
    }
  });

};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique message ID
 *
 * Uses timestamp + random string
 * Example: "l3k5j2h4g9"
 */
function generateMessageId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
