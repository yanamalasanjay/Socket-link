# SocketLink - Interview Preparation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Complete Application Flow](#complete-application-flow)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Technology Stack Deep Dive](#technology-stack-deep-dive)
5. [Code Walkthrough with Examples](#code-walkthrough-with-examples)
6. [Interview Questions & Answers](#interview-questions--answers)
7. [Key Talking Points](#key-talking-points)

---

## Project Overview

**SocketLink** is a real-time chat application demonstrating:
- ✅ RESTful API design with Express.js
- ✅ WebSocket communication using Socket.IO
- ✅ JWT-based authentication
- ✅ Secure password hashing with bcrypt
- ✅ Event-driven architecture
- ✅ MVC design pattern
- ✅ Real-time room-based messaging

**Tech Stack:**
- **Backend:** Node.js, Express.js, Socket.IO
- **Security:** JWT (jsonwebtoken), bcrypt
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Optional:** Redis (for scalability)

---

## Complete Application Flow

### 1. **User Registration Flow** 📝

```
┌─────────────┐                              ┌─────────────┐
│   Client    │                              │   Server    │
│  (Browser)  │                              │  (Node.js)  │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │  1. POST /api/auth/register                │
       │     { username, password }                 │
       ├───────────────────────────────────────────>│
       │                                            │
       │                        2. Validate input   │
       │                        (length, format)    │
       │                                            │
       │                        3. Check if user    │
       │                           exists           │
       │                                            │
       │                        4. Hash password    │
       │                        bcrypt.hash()       │
       │                                            │
       │                        5. Generate userId  │
       │                                            │
       │                        6. Store user in    │
       │                           Map storage      │
       │                                            │
       │  7. 201 Created                            │
       │     { success, user }                      │
       │<───────────────────────────────────────────┤
       │                                            │
```

**Code Reference:** [auth.controller.js:60-210](src/controllers/auth.controller.js#L60-L210)

---

### 2. **Login & JWT Token Generation Flow** 🔐

```
┌─────────────┐                              ┌─────────────┐
│   Client    │                              │   Server    │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │  1. POST /api/auth/login                   │
       │     { username, password }                 │
       ├───────────────────────────────────────────>│
       │                                            │
       │                        2. Find user in     │
       │                           storage          │
       │                                            │
       │                        3. Compare password │
       │                        bcrypt.compare()    │
       │                                            │
       │                        4. Generate JWT     │
       │                        jwt.sign({          │
       │                          userId,           │
       │                          username          │
       │                        })                  │
       │                                            │
       │  5. 200 OK                                 │
       │     { token, user }                        │
       │<───────────────────────────────────────────┤
       │                                            │
       │  6. Store token in localStorage            │
       │                                            │
```

**Code Reference:** [auth.controller.js:227-367](src/controllers/auth.controller.js#L227-L367)

**JWT Token Structure:**
```javascript
// Token Payload
{
  userId: "l3k5j2h4g9",
  username: "alice",
  iat: 1704470400,  // Issued At
  exp: 1704556800   // Expires (24h later)
}

// Signed with SECRET
// Result: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. **WebSocket Connection Flow** 🔌

```
┌─────────────┐                              ┌─────────────┐
│   Client    │                              │   Server    │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │  1. io.connect(url, {                      │
       │       auth: { token }                      │
       │     })                                     │
       ├───────────────────────────────────────────>│
       │                                            │
       │                        2. Socket Auth      │
       │                        Middleware          │
       │                        - Extract token     │
       │                        - jwt.verify()      │
       │                        - Attach user data  │
       │                                            │
       │  3. Connection established                 │
       │     'connection' event fired               │
       │<───────────────────────────────────────────┤
       │                                            │
       │  4. socket.userId = decoded.userId         │
       │     socket.username = decoded.username     │
       │                                            │
       │  5. Socket handlers registered             │
       │     - join_room                            │
       │     - send_message                         │
       │     - typing, etc.                         │
       │                                            │
```

**Code Reference:**
- [auth.middleware.js:40-158](src/middleware/auth.middleware.js#L40-L158)
- [index.js:175-189](src/index.js#L175-L189)

---

### 4. **Real-Time Messaging Flow** 💬

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Alice     │         │   Server    │         │     Bob     │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                        │
       │  join_room            │                        │
       │  { roomName: "general" }                       │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │ - socket.join(room)    │
       │                       │ - Update tracking      │
       │                       │                        │
       │  joined_room          │                        │
       │  { users, count }     │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │                       │  user_joined           │
       │                       │  { username: "alice" } │
       │                       ├───────────────────────>│
       │                       │                        │
       │  send_message         │                        │
       │  { text: "Hello!" }   │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │ - Validate message     │
       │                       │ - Create message obj   │
       │                       │ - Broadcast to room    │
       │                       │                        │
       │  new_message          │  new_message           │
       │  { text, sender }     │  { text, sender }      │
       │<──────────────────────┼───────────────────────>│
       │                       │                        │
```

**Code Reference:** [socket.controller.js:183-426](src/controllers/socket.controller.js#L183-L426)

---

## Architecture & Design Patterns

### 1. **MVC (Model-View-Controller) Pattern**

```
┌─────────────────────────────────────────────────────────┐
│                      PROJECT STRUCTURE                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │    ROUTES    │───>│ CONTROLLERS  │───>│  MODELS  │  │
│  │              │    │              │    │          │  │
│  │ Define URLs  │    │   Business   │    │   Data   │  │
│  │ & Methods    │    │    Logic     │    │ Storage  │  │
│  └──────────────┘    └──────────────┘    └──────────┘  │
│         │                    │                  │       │
│         │                    │                  │       │
│         └────────────────────┴──────────────────┘       │
│                              │                          │
│                              ▼                          │
│                      ┌──────────────┐                   │
│                      │  MIDDLEWARE  │                   │
│                      │              │                   │
│                      │ Auth, CORS,  │                   │
│                      │ Validation   │                   │
│                      └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**

```javascript
// ROUTES (auth.routes.js)
router.post('/register', authController.register);
router.post('/login', authController.login);

// CONTROLLERS (auth.controller.js)
exports.register = async (req, res) => {
  // Business logic
  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(username, user); // Model interaction
  res.status(201).json({ success: true, user });
};

// MODELS (in-memory storage)
const users = new Map(); // In production: Database
```

---

### 2. **Event-Driven Architecture**

Socket.IO uses an **event-driven** model:

```javascript
// Server emits events
io.emit('room_created', { roomName });        // To all
socket.emit('joined_room', { roomName });     // To one
socket.to(room).emit('new_message', data);    // To room

// Client listens for events
socket.on('room_created', (data) => {
  addRoomToList(data.roomName);
});
```

**Benefits:**
- ✅ Loose coupling between components
- ✅ Real-time bidirectional communication
- ✅ Easy to extend with new events
- ✅ Scalable architecture

---

### 3. **Middleware Chain Pattern**

```javascript
// Request flows through middleware chain
app.use(cors());                    // 1. CORS
app.use(express.json());            // 2. JSON Parser
app.use(loggingMiddleware);         // 3. Logger
app.use('/api/auth', authRoutes);   // 4. Routes

// Socket.IO middleware
io.use(authenticateSocket);         // Auth before connection
```

---

## Technology Stack Deep Dive

### 1. **Node.js** 🟢

**What is it?**
- JavaScript runtime built on Chrome's V8 engine
- Event-driven, non-blocking I/O
- Single-threaded with event loop

**Why use it?**
```javascript
// Non-blocking I/O example
const bcrypt = require('bcryptjs');

// ❌ BAD: Synchronous (blocks event loop)
const hash = bcrypt.hashSync(password, 10); // Blocks for ~150ms

// ✅ GOOD: Asynchronous (doesn't block)
const hash = await bcrypt.hash(password, 10); // Returns immediately
```

**Our Usage:**
- Handles thousands of concurrent connections
- Perfect for real-time applications
- JavaScript on both frontend and backend

**Code Reference:** [index.js](src/index.js)

---

### 2. **Express.js** 🚂

**What is it?**
- Minimalist web framework for Node.js
- Handles HTTP requests/responses
- Provides routing and middleware

**Key Features in Our Project:**

```javascript
// 1. Routing
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// 2. Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors());         // Enable CORS

// 3. Static files
app.use(express.static('public')); // Serve HTML/CSS/JS

// 4. Route grouping
app.use('/api/auth', authRoutes); // Mount routes at prefix
```

**Code Reference:** [index.js:87-138](src/index.js#L87-L138)

---

### 3. **Socket.IO** ⚡

**What is it?**
- Real-time bidirectional event-based communication
- Built on WebSocket protocol (with fallbacks)
- Auto-reconnection, rooms, broadcasting

**HTTP vs WebSocket:**

```
HTTP (Request-Response):
┌──────┐  Request   ┌──────┐
│Client│──────────>│Server│
└──────┘            └──────┘
┌──────┐  Response  ┌──────┐
│Client│<──────────│Server│
└──────┘            └──────┘
- One request = One response
- Client initiates all communication
- Short-lived connections

WebSocket (Persistent Connection):
┌──────┐ ←──────── ┌──────┐
│Client│ ─────────→│Server│
└──────┘ Bidirectional └──────┘
- Persistent connection
- Both can send anytime
- Low latency, real-time
```

**Socket.IO Features:**

```javascript
// 1. Rooms (like chat channels)
socket.join('general');
io.to('general').emit('new_message', data);

// 2. Broadcasting
socket.broadcast.emit('user_joined', user); // To all except sender
io.emit('announcement', data);              // To everyone

// 3. Namespaces (not used in this project)
const adminNamespace = io.of('/admin');
const chatNamespace = io.of('/chat');

// 4. Acknowledgements
socket.emit('message', data, (response) => {
  console.log('Server acknowledged:', response);
});
```

**Code Reference:** [socket.controller.js](src/controllers/socket.controller.js)

---

### 4. **JWT (JSON Web Tokens)** 🎫

**Structure:**
```
Header.Payload.Signature

Example:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.     ← Header (algorithm)
eyJ1c2VySWQiOiIxMjMiLCJ1c2VybmFtZSI6ImFsaWNlIn0. ← Payload (data)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c      ← Signature (proof)
```

**Decoded:**
```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "userId": "l3k5j2h4",
  "username": "alice",
  "iat": 1704470400,
  "exp": 1704556800
}

// Signature = HMACSHA256(
//   base64(header) + "." + base64(payload),
//   SECRET_KEY
// )
```

**Why JWT?**
- ✅ Stateless (no server-side sessions)
- ✅ Scalable (any server can verify)
- ✅ Self-contained (all data in token)
- ✅ Tamper-proof (signature verification)

**Our Implementation:**

```javascript
// Generate token (login)
const token = jwt.sign(
  { userId, username },      // Payload
  process.env.JWT_SECRET,    // Secret key
  { expiresIn: '24h' }       // Options
);

// Verify token (authentication)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// decoded = { userId, username, iat, exp }
```

**Code Reference:**
- [auth.controller.js:315-327](src/controllers/auth.controller.js#L315-L327)
- [auth.middleware.js:94](src/middleware/auth.middleware.js#L94)

---

### 5. **bcrypt** 🔒

**What is Password Hashing?**

```
Plain Password → Hash Function → Hashed Password

"SecurePass123" → bcrypt.hash() → "$2a$10$N9qo8uLOick..."

Properties:
✅ One-way (can't reverse)
✅ Deterministic (same input = same output)
✅ Different salt = different hash (even for same password)
```

**How bcrypt Works:**

```javascript
// Hashing (registration)
const password = "SecurePass123";
const saltRounds = 10; // 2^10 iterations

const hash = await bcrypt.hash(password, saltRounds);
// "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
//  │   │  └─ Salt (random)
//  │   └─ Cost factor (10)
//  └─ Algorithm (2a = bcrypt)

// Verification (login)
const isValid = await bcrypt.compare("SecurePass123", hash);
// true (passwords match)

const isValid2 = await bcrypt.compare("WrongPassword", hash);
// false (passwords don't match)
```

**Salt & Cost Factor:**

```javascript
// Why Salt?
// Without salt:
User1: "password" → hash1
User2: "password" → hash1  ❌ Same hash! (rainbow table attack)

// With salt:
User1: "password" + salt1 → hash1
User2: "password" + salt2 → hash2  ✅ Different hashes!

// Cost Factor (saltRounds):
// 10 = 2^10 = 1024 iterations (~150ms)
// 12 = 2^12 = 4096 iterations (~600ms)
// Higher = More secure but slower
```

**Code Reference:** [auth.controller.js:155-156](src/controllers/auth.controller.js#L155-L156)

---

## Code Walkthrough with Examples

### 1. **Server Initialization** ([index.js](src/index.js))

```javascript
// STEP 1: Load environment variables
require('dotenv').config();

// STEP 2: Create Express app
const app = express();

// STEP 3: Create HTTP server (needed for Socket.IO)
const httpServer = createServer(app);

// STEP 4: Attach Socket.IO to HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// STEP 5: Apply middleware
app.use(cors());              // Enable CORS
app.use(express.json());      // Parse JSON bodies
app.use(express.static('public')); // Serve static files

// STEP 6: Register routes
app.use('/api/auth', authRoutes);

// STEP 7: Socket.IO authentication
io.use(authenticateSocket);

// STEP 8: Handle connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.username}`);
  socketHandler(io, socket);
});

// STEP 9: Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Key Points for Interviews:**
- Why `createServer()` instead of `app.listen()`?
  → Socket.IO needs the HTTP server instance
- Middleware order matters (CORS → JSON parser → Routes)
- Socket.IO middleware runs before connection is established

---

### 2. **User Registration** ([auth.controller.js](src/controllers/auth.controller.js))

```javascript
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // VALIDATION
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password required'
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        error: 'Username must be 3-20 characters'
      });
    }

    // CHECK EXISTING USER
    if (users.has(username)) {
      return res.status(409).json({
        error: 'Username already exists'
      });
    }

    // HASH PASSWORD
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // CREATE USER
    const userId = generateUserId();
    const user = {
      userId,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.set(username, user);

    // SEND RESPONSE
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        userId: user.userId,
        username: user.username,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
```

**Interview Questions:**
- **Q:** Why hash passwords?
  - **A:** Security. If database is breached, attackers can't see passwords.
- **Q:** Why use `async/await`?
  - **A:** bcrypt hashing is CPU-intensive. `await` prevents blocking the event loop.
- **Q:** Why status code 201?
  - **A:** 201 = Created. More specific than 200 OK for resource creation.

---

### 3. **JWT Authentication Middleware** ([auth.middleware.js](src/middleware/auth.middleware.js))

```javascript
exports.authenticateSocket = (socket, next) => {
  try {
    // 1. Extract token from handshake
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('No token provided'));
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // jwt.verify() throws error if:
    // - Token is malformed
    // - Signature doesn't match
    // - Token is expired

    // 3. Attach user data to socket
    socket.userId = decoded.userId;
    socket.username = decoded.username;

    // 4. Allow connection
    next(); // ✅ Authentication successful

  } catch (error) {
    // Reject connection
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new Error('Invalid token'));
    }
    return next(new Error('Authentication failed'));
  }
};
```

**How Middleware Works:**

```javascript
// Server side
io.use(authenticateSocket); // Register middleware

// Middleware chain:
New Connection → authenticateSocket() → next() → 'connection' event
                                      ↓
                                  Error? → Reject connection
```

**Client side:**
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'eyJhbGc...'  // Sent to server
  }
});

// On rejection:
socket.on('connect_error', (error) => {
  console.error('Auth failed:', error.message);
});
```

---

### 4. **Room Management** ([socket.controller.js](src/controllers/socket.controller.js))

**Data Structure:**
```javascript
// rooms = Map<roomName, Set<username>>
const rooms = new Map();

// Example state:
rooms = Map {
  'general' => Set { 'alice', 'bob', 'charlie' },
  'random' => Set { 'alice', 'david' }
}
```

**Join Room Handler:**
```javascript
socket.on('join_room', (data) => {
  const { roomName } = data;

  // 1. LEAVE PREVIOUS ROOMS
  Array.from(socket.rooms).forEach(room => {
    if (room !== socket.id) {
      socket.leave(room);

      // Update tracking
      if (rooms.has(room)) {
        rooms.get(room).delete(socket.username);
      }
    }
  });

  // 2. JOIN NEW ROOM
  socket.join(roomName);
  socket.currentRoom = roomName;

  // 3. UPDATE TRACKING
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(socket.username);

  // 4. NOTIFY OTHERS
  socket.to(roomName).emit('user_joined', {
    username: socket.username,
    roomName,
    userCount: rooms.get(roomName).size
  });

  // 5. SEND ROOM INFO TO USER
  socket.emit('joined_room', {
    roomName,
    users: Array.from(rooms.get(roomName)),
    userCount: rooms.get(roomName).size
  });
});
```

**Socket.IO Rooms Explained:**

```javascript
// socket.rooms is a Set
socket.id: "abc123"
socket.rooms: Set { "abc123", "general" }
               ↑          ↑
         Default room   Joined room

// Emit to room
io.to('general').emit('message', data);
// Sends to everyone in 'general' room

// Emit to room except sender
socket.to('general').emit('message', data);
// Sends to everyone in 'general' except current socket
```

---

### 5. **Message Broadcasting** ([socket.controller.js](src/controllers/socket.controller.js))

```javascript
socket.on('send_message', (data) => {
  // 1. VALIDATE
  if (!socket.currentRoom) {
    socket.emit('error', { message: 'Not in a room' });
    return;
  }

  const text = data.text.trim();
  if (!text || text.length > 1000) {
    socket.emit('error', { message: 'Invalid message' });
    return;
  }

  // 2. CREATE MESSAGE OBJECT
  const message = {
    messageId: generateMessageId(),
    text: text,
    sender: socket.username,
    senderId: socket.userId,
    roomName: socket.currentRoom,
    timestamp: Date.now()
  };

  // 3. BROADCAST TO ROOM (including sender)
  io.to(socket.currentRoom).emit('new_message', message);

  // Why include sender?
  // - Confirmation that message was sent
  // - All clients see the same thing
  // - Simpler logic (no duplicate handling)
});
```

**Broadcasting Patterns:**

```javascript
// 1. To everyone
io.emit('announcement', data);

// 2. To everyone in a room
io.to('general').emit('message', data);

// 3. To everyone except sender
socket.broadcast.emit('user_joined', data);

// 4. To everyone in a room except sender
socket.to('general').emit('typing', data);

// 5. To specific socket
io.to(socketId).emit('private_message', data);
```

---

### 6. **Client-Side Connection** ([client.js](public/client.js))

```javascript
function connectSocket() {
  // Create connection with JWT
  socket = io('http://localhost:3000', {
    auth: {
      token: authToken  // JWT token from localStorage
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  // CONNECTION EVENTS
  socket.on('connect', () => {
    console.log('Connected:', socket.id);
    updateConnectionStatus(true);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    updateConnectionStatus(false);
  });

  socket.on('connect_error', (error) => {
    if (error.message.includes('Authentication')) {
      alert('Session expired. Please login again.');
      logout();
    }
  });

  // MESSAGE EVENTS
  socket.on('new_message', (message) => {
    addMessage(message);
  });

  // ROOM EVENTS
  socket.on('user_joined', (data) => {
    addSystemMessage(`${data.username} joined`);
  });
}

// Sending messages
function sendMessage(text) {
  socket.emit('send_message', { text });
}

// Joining rooms
function joinRoom(roomName) {
  socket.emit('join_room', { roomName });
}
```

---

## Interview Questions & Answers

### General Architecture

**Q1: Explain the overall architecture of SocketLink.**

**A:** SocketLink follows an **MVC (Model-View-Controller)** architecture:
- **Routes** define API endpoints and map them to controllers
- **Controllers** contain business logic (registration, login, message handling)
- **Models** handle data storage (in-memory Map for users/rooms)
- **Middleware** provides cross-cutting concerns (authentication, CORS, logging)

The project also uses **event-driven architecture** for real-time features with Socket.IO.

**File Structure:**
```
src/
├── routes/           → URL mappings
├── controllers/      → Business logic
├── middleware/       → Auth, validation
└── index.js         → Server setup
```

---

**Q2: Why did you choose in-memory storage instead of a database?**

**A:** For **learning simplicity**. In production, I would use:
- **PostgreSQL/MySQL** for relational data (users, messages)
- **MongoDB** for flexible schemas
- **Redis** for caching and session storage

The in-memory Map can easily be replaced with database calls:
```javascript
// Current
users.set(username, user);

// With database
await db.users.create({ username, password });
```

---

### Authentication & Security

**Q3: How does JWT authentication work in your project?**

**A:** JWT provides **stateless authentication**:

**1. Login:**
```javascript
// User logs in with credentials
const token = jwt.sign({ userId, username }, SECRET, { expiresIn: '24h' });
// Return token to client
```

**2. Client stores token:**
```javascript
localStorage.setItem('token', token);
```

**3. Client includes token in requests:**
```javascript
// HTTP: Authorization header
headers: { 'Authorization': 'Bearer ' + token }

// WebSocket: auth object
io(url, { auth: { token } })
```

**4. Server verifies token:**
```javascript
const decoded = jwt.verify(token, SECRET);
// decoded = { userId, username, iat, exp }
```

**Benefits:**
- ✅ Stateless (no server-side sessions)
- ✅ Scalable (any server can verify)
- ✅ Self-contained (token has all needed info)

---

**Q4: Explain bcrypt password hashing.**

**A:** bcrypt is a **one-way hashing** algorithm with built-in **salt**:

**Hashing (Registration):**
```javascript
const hash = await bcrypt.hash("password123", 10);
// "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
```

**Verification (Login):**
```javascript
const isValid = await bcrypt.compare("password123", hash);
// true
```

**Why bcrypt?**
- ✅ Salt prevents rainbow table attacks
- ✅ Adaptive (cost factor adjustable)
- ✅ Slow by design (prevents brute force)

**Cost Factor:**
- 10 = 2^10 = 1024 iterations (~150ms)
- Each increment doubles time
- Balance security vs performance

---

**Q5: What security measures did you implement?**

**A:**
1. **Password Security:**
   - bcrypt hashing with salt
   - Never store plain-text passwords
   - Minimum 6 characters

2. **Authentication:**
   - JWT with 24-hour expiration
   - Token verification on every WebSocket connection
   - Stateless (no session hijacking)

3. **Input Validation:**
   - Username: 3-20 chars, alphanumeric
   - Message: Max 1000 chars
   - Room name: Max 50 chars

4. **XSS Prevention:**
   - HTML escaping on client side
   ```javascript
   function escapeHtml(text) {
     const div = document.createElement('div');
     div.textContent = text;
     return div.innerHTML;
   }
   ```

5. **CORS:**
   - Configured allowed origins
   - In production: specific domains only

---

### WebSocket & Real-Time

**Q6: Explain the difference between HTTP and WebSocket.**

**A:**

**HTTP (Request-Response):**
- ❌ One-directional (client → server)
- ❌ New connection for each request
- ❌ Higher overhead (headers, handshake)
- ✅ Stateless, cacheable
- **Use case:** REST APIs, web pages

**WebSocket (Persistent Connection):**
- ✅ Bidirectional (client ↔ server)
- ✅ Single persistent connection
- ✅ Low latency, real-time
- ❌ More complex (connection management)
- **Use case:** Chat, live updates, gaming

**Upgrade Process:**
```
1. Client: HTTP request with "Upgrade: websocket" header
2. Server: 101 Switching Protocols
3. Connection upgraded to WebSocket
4. Bidirectional communication starts
```

---

**Q7: How does Socket.IO handle rooms?**

**A:** Socket.IO **rooms** are like channels or groups:

**Server-side:**
```javascript
// Join room
socket.join('general');

// Leave room
socket.leave('general');

// Emit to room
io.to('general').emit('message', data);

// Emit to room except sender
socket.to('general').emit('typing', data);
```

**Internal Structure:**
```javascript
socket.rooms = Set {
  "abc123",    // Socket's own room (ID)
  "general"    // Joined room
}
```

**Our tracking:**
```javascript
rooms = Map {
  'general' => Set { 'alice', 'bob' },
  'random' => Set { 'alice' }
}
```

**Why two structures?**
- Socket.IO rooms: For broadcasting
- Our Map: For user lists, validation

---

**Q8: How do you handle disconnections?**

**A:**

**Server-side:**
```javascript
socket.on('disconnect', (reason) => {
  // 1. Get user's current room
  const roomName = socket.currentRoom;

  // 2. Remove from tracking
  rooms.get(roomName).delete(socket.username);

  // 3. Notify others
  socket.to(roomName).emit('user_left', {
    username: socket.username,
    userCount: rooms.get(roomName).size
  });

  // 4. Delete empty rooms
  if (rooms.get(roomName).size === 0) {
    rooms.delete(roomName);
  }
});
```

**Client-side (Auto-reconnection):**
```javascript
const socket = io(url, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

socket.on('disconnect', () => {
  // Update UI
  updateConnectionStatus(false);
});

socket.on('connect', () => {
  // Reconnected! Rejoin room if needed
  if (lastRoom) {
    socket.emit('join_room', { roomName: lastRoom });
  }
});
```

---

### Node.js & Express

**Q9: Explain the Node.js event loop.**

**A:** Node.js is **single-threaded** but **non-blocking**:

**Event Loop Phases:**
```
   ┌───────────────────────────┐
┌─>│           timers          │ (setTimeout, setInterval)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ (I/O callbacks)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ (retrieve new I/O events)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │ (setImmediate)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │      close callbacks      │
│  └─────────────┬─────────────┘
└──────────────────────────────┘
```

**Example:**
```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// Output: 1, 4, 3, 2
// Microtasks (Promises) run before macrotasks (setTimeout)
```

**Why async/await?**
```javascript
// ❌ Blocking
const hash = bcrypt.hashSync(password, 10); // Blocks for ~150ms

// ✅ Non-blocking
const hash = await bcrypt.hash(password, 10); // Doesn't block
```

---

**Q10: What is middleware in Express?**

**A:** Middleware = Functions that run **before** route handlers.

**Signature:**
```javascript
function middleware(req, res, next) {
  // Do something
  next(); // Call next middleware
}
```

**Types:**

**1. Application-level:**
```javascript
app.use(cors());
app.use(express.json());
```

**2. Router-level:**
```javascript
router.use(authMiddleware);
```

**3. Error-handling:**
```javascript
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
```

**Our usage:**
```javascript
// 1. CORS
app.use(cors());

// 2. JSON parser
app.use(express.json());

// 3. Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 4. Routes
app.use('/api/auth', authRoutes);

// Order matters!
```

---

### Design Decisions

**Q11: Why did you separate routes and controllers?**

**A:** **Separation of concerns** (clean code principle):

**Without separation:**
```javascript
// ❌ BAD: Everything in routes
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  // 50 lines of validation
  // 20 lines of business logic
  // 10 lines of database operations
  // Hard to test, maintain, reuse
});
```

**With separation:**
```javascript
// ✅ GOOD: Clean routes
router.post('/register', authController.register);

// Business logic in controller
exports.register = async (req, res) => {
  // Reusable, testable, maintainable
};
```

**Benefits:**
- ✅ Routes focus on URL mapping
- ✅ Controllers handle business logic
- ✅ Easy to test controllers independently
- ✅ Reusable across different routes

---

**Q12: How would you scale this application?**

**A:**

**1. Database:**
```javascript
// Replace in-memory storage
const users = new Map(); // ❌

await db.users.create(...); // ✅ PostgreSQL/MongoDB
```

**2. Redis for sessions:**
```javascript
// Store user sessions in Redis
await redis.set(`session:${userId}`, sessionData);
```

**3. Socket.IO Adapter:**
```javascript
// For multiple servers
const { createAdapter } = require('@socket.io/redis-adapter');

io.adapter(createAdapter(redisClient));

// Now messages sync across servers:
Server 1 ←→ Redis ←→ Server 2
```

**4. Load Balancer:**
```
┌─────────┐
│ Client  │
└────┬────┘
     │
     ▼
┌─────────────┐
│Load Balancer│ (NGINX)
└─────┬───────┘
      │
   ┌──┴──┐
   │     │
   ▼     ▼
Server1  Server2
```

**5. Horizontal Scaling:**
```javascript
// Kubernetes/Docker
docker-compose scale app=5
```

**6. Message Queue:**
```javascript
// For offline messages, notifications
await queue.publish('send_email', { userId, message });
```

---

## Key Talking Points

### What to Emphasize

1. **Architecture:**
   - "I used MVC pattern to separate concerns"
   - "Event-driven architecture with Socket.IO"
   - "Middleware chain for request processing"

2. **Security:**
   - "JWT for stateless authentication"
   - "bcrypt with salt for password hashing"
   - "Input validation on all user inputs"
   - "XSS prevention with HTML escaping"

3. **Real-Time:**
   - "WebSocket for bidirectional communication"
   - "Socket.IO rooms for group messaging"
   - "Auto-reconnection for reliability"

4. **Best Practices:**
   - "async/await for non-blocking I/O"
   - "Error handling with try-catch"
   - "Environment variables for configuration"
   - "Clean code with comments"

5. **Scalability:**
   - "Designed to scale with Redis adapter"
   - "Stateless JWT allows horizontal scaling"
   - "Easy to add database layer"

---

### Demo Flow for Interviews

**1. Show Registration:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"SecurePass123"}'
```

**2. Show Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"SecurePass123"}'
```

**3. Show WebSocket Connection:**
- Open browser console
- Connect with JWT token
- Join room
- Send messages

**4. Show Real-Time:**
- Open two browsers
- Join same room
- Messages appear instantly
- Typing indicators work

---

### Common Follow-Up Questions

**Q: What challenges did you face?**

**A:**
- **JWT token management:** Handling expiration, refresh tokens
- **WebSocket state sync:** Keeping client and server in sync
- **Race conditions:** Multiple users joining/leaving rooms simultaneously

**Q: What would you improve?**

**A:**
- Add **message persistence** (database)
- Implement **private messaging**
- Add **file uploads** (images, files)
- Add **read receipts**
- Add **message editing/deletion**
- Implement **refresh tokens**

**Q: How do you test this?**

**A:**
- **Unit tests:** Controllers, middleware (Jest, Mocha)
- **Integration tests:** API endpoints (Supertest)
- **E2E tests:** Full user flow (Cypress)
- **Load tests:** Concurrent connections (Artillery)

```javascript
// Example unit test
describe('authController.register', () => {
  it('should register new user', async () => {
    const req = { body: { username: 'alice', password: '123456' } };
    const res = { status: jest.fn(), json: jest.fn() };

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
```

---

## Quick Reference

### File Structure
```
SocketLink/
├── src/
│   ├── index.js                 → Server entry point
│   ├── controllers/
│   │   ├── auth.controller.js   → Register, login
│   │   └── socket.controller.js → Real-time events
│   ├── middleware/
│   │   └── auth.middleware.js   → JWT verification
│   └── routes/
│       └── auth.routes.js       → API endpoints
├── public/
│   ├── index.html              → Frontend UI
│   ├── style.css               → Styles
│   └── client.js               → Client-side logic
├── .env                         → Environment variables
└── package.json                → Dependencies
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/users` | Get all users (debug) |
| GET | `/api/health` | Health check |

### Socket.IO Events

**Client → Server:**
| Event | Data | Description |
|-------|------|-------------|
| `get_rooms` | - | Get room list |
| `create_room` | `{ roomName }` | Create new room |
| `join_room` | `{ roomName }` | Join a room |
| `leave_room` | - | Leave current room |
| `send_message` | `{ text }` | Send message |
| `typing` | - | User is typing |
| `stop_typing` | - | User stopped typing |

**Server → Client:**
| Event | Data | Description |
|-------|------|-------------|
| `rooms_list` | `['general', ...]` | Room list |
| `room_created` | `{ roomName, createdBy }` | New room created |
| `joined_room` | `{ roomName, users, userCount }` | Joined room |
| `user_joined` | `{ username, userCount }` | User joined |
| `user_left` | `{ username, userCount }` | User left |
| `new_message` | `{ text, sender, timestamp }` | New message |
| `user_typing` | `{ username }` | User typing |
| `error` | `{ message, code }` | Error occurred |

### Key Dependencies
```json
{
  "express": "Web framework",
  "socket.io": "Real-time communication",
  "jsonwebtoken": "JWT authentication",
  "bcryptjs": "Password hashing",
  "dotenv": "Environment variables",
  "cors": "Cross-origin requests"
}
```

---

## Final Tips for Interviews

1. **Start High-Level:**
   - "SocketLink is a real-time chat app using Node.js and Socket.IO"
   - Explain architecture before diving into code

2. **Walk Through Flow:**
   - "When a user registers, we hash their password with bcrypt..."
   - Use diagrams if possible

3. **Explain Trade-offs:**
   - "I used in-memory storage for simplicity, but in production..."
   - Show you understand limitations

4. **Demonstrate Knowledge:**
   - Explain WHY, not just WHAT
   - "I used JWT because it's stateless and scalable"

5. **Be Honest:**
   - "This is a learning project. In production, I would add..."
   - Show growth mindset

6. **Code Quality:**
   - Point out your comments
   - Explain naming conventions
   - Show you care about maintainability

7. **Security Awareness:**
   - Mention all security measures
   - Explain potential vulnerabilities
   - Show you think about security

---

**Good luck with your interview preparation! 🚀**

This project demonstrates solid understanding of:
- ✅ Backend development (Node.js, Express)
- ✅ Real-time systems (WebSocket, Socket.IO)
- ✅ Authentication & Security (JWT, bcrypt)
- ✅ API design (REST, event-driven)
- ✅ Clean code & architecture (MVC, separation of concerns)

You've got this! 💪
