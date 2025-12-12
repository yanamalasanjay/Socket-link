# SocketLink - 10-Day Learning Schedule

This schedule is designed for **beginners with zero knowledge**. Each day builds on the previous, with hands-on coding, reading, and practice. Budget **2-3 hours per day** for best results.

---

## 📅 Overview

| Day | Focus Area | Key Concepts | Deliverable |
|-----|------------|--------------|-------------|
| **1** | Node.js Fundamentals | Node.js, npm, Express basics | Basic HTTP server |
| **2** | Express & Middleware | Routing, middleware, JSON | REST API with routes |
| **3** | Understanding Real-Time | HTTP vs WebSocket, use cases | Conceptual understanding |
| **4** | Socket.IO Basics | Connections, events, emit/on | Basic chat (no rooms) |
| **5** | Room Management | Rooms, broadcasting | Multi-room chat |
| **6** | Authentication Part 1 | Password hashing, user registration | User signup/login |
| **7** | Authentication Part 2 | JWT, protecting Socket.IO | Authenticated WebSocket |
| **8** | Event-Driven Patterns | Event emitters, architecture | Refactor with events |
| **9** | Redis Integration | Caching, Redis basics | Redis caching layer |
| **10** | Polish & Review | Testing, deployment, review | Production-ready app |

---

## Day 1: Node.js Fundamentals 🎯

### Goals
- Understand what Node.js is and why it's used
- Install Node.js and npm
- Create your first server
- Understand basic Express concepts

### Reading (45 min)
1. **BACKEND_FUNDAMENTALS.md**: Part 4 - Node.js & JavaScript Backend
2. **README.md**: Installation and basic setup
3. Watch: [What is Node.js? - 15min](https://www.youtube.com/watch?v=TlB_eWDSMt4)
4. Read: Code comments in **src/index.js** (Main server file)

### Hands-On Coding (90 min)

**Step 1: Install Node.js**
```bash
# Download from https://nodejs.org (LTS version)
# Verify installation
node --version
npm --version
```

**Step 2: Create Your First Server**
```bash
mkdir socketlink-learning
cd socketlink-learning
npm init -y
npm install express
```

**Step 3: Create `server.js`**
```javascript
// server.js
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Your first route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from my first server!' });
});

// Another route
app.get('/users', (req, res) => {
  res.json({ users: ['Alice', 'Bob', 'Charlie'] });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Step 4: Run It**
```bash
node server.js
# Open browser: http://localhost:3000
```

### Practice Exercises (30 min)
1. ✅ Add a new route `/about` that returns `{ message: 'About page' }`
2. ✅ Add a route `/time` that returns the current time
3. ✅ Add a POST route `/message` that receives JSON and logs it
4. ✅ Experiment: What happens if you visit a route that doesn't exist?

### Checkpoint
- [ ] Can run a Node.js server
- [ ] Understand what `app.get()` does
- [ ] Can add new routes
- [ ] Understand JSON responses

### Resources
- [Express Getting Started](https://expressjs.com/en/starter/installing.html)
- [Node.js Crash Course - Traversy Media](https://www.youtube.com/watch?v=fBNz5xF-Kx4)

---

## Day 2: Express & Middleware 🛠️

### Goals
- Understand middleware concept
- Create multiple routes
- Handle POST requests
- Use CORS and other middleware

### Reading (30 min)
1. **BACKEND_FUNDAMENTALS.md**: Part 5 - Express.js & Middleware
2. Read: Code comments in **src/middleware/auth.middleware.js**
3. Read: [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)

### Hands-On Coding (90 min)

**Step 1: Install Additional Packages**
```bash
npm install cors
npm install nodemon --save-dev
```

**Step 2: Update `package.json`**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Step 3: Create Enhanced Server**
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// ======= MIDDLEWARE =======

// 1. CORS - allow cross-origin requests
app.use(cors());

// 2. Parse JSON bodies
app.use(express.json());

// 3. Custom logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next(); // Pass to next middleware/route
});

// 4. Custom header middleware
,

// ======= ROUTES =======

// GET routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SocketLink API' });
});

app.get('/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice', online: true },
    { id: 2, name: 'Bob', online: false },
    { id: 3, name: 'Charlie', online: true }
  ];
  res.json({ users });
});

// GET with URL parameters
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ message: `Getting user with ID: ${userId}` });
});

// POST route
app.post('/messages', (req, res) => {
  const { text, sender } = req.body;

  if (!text || !sender) {
    return res.status(400).json({ error: 'Missing text or sender' });
  }

  console.log('Received message:', text, 'from', sender);

  res.json({
    success: true,
    message: { text, sender, timestamp: Date.now() }
  });
});

// PUT route (update)
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  res.json({
    success: true,
    message: `Updated user ${userId}`,
    updates
  });
});

// DELETE route
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ success: true, message: `Deleted user ${userId}` });
});

// 404 handler (must be last!)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Step 4: Test with Thunder Client or curl**
```bash
# GET request
curl http://localhost:3000/users

# POST request
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","sender":"Alice"}'
```

### Practice Exercises (45 min)
1. ✅ Create a route that returns a list of rooms: `GET /rooms`
2. ✅ Create a POST route to create a room: `POST /rooms`
3. ✅ Add middleware that logs the request body
4. ✅ Create error handling middleware
5. ✅ Add validation: reject messages longer than 500 characters

### Checkpoint
- [ ] Understand middleware execution order
- [ ] Can create GET, POST, PUT, DELETE routes
- [ ] Can access URL parameters and request body
- [ ] Understand CORS and why it's needed

### Resources
- [RESTful API Tutorial](https://restfulapi.net/)
- [HTTP Methods Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)

---

## Day 3: Understanding Real-Time Communication 📡

### Goals
- Understand HTTP limitations for real-time
- Learn how WebSocket works
- Understand use cases for real-time communication
- Prepare mentally for Socket.IO

### Reading (90 min)
1. **BACKEND_FUNDAMENTALS.md**: Part 2 - WebSocket & Real-Time Communication - Read CAREFULLY
2. Watch: [WebSockets Crash Course - 30min](https://www.youtube.com/watch?v=2Nt-ZrNP22A)
3. Read: [WebSocket vs HTTP](https://ably.com/topic/websockets-vs-http)

### Conceptual Exercises (60 min)

**Exercise 1: Identify the Protocol**
For each scenario, decide: HTTP or WebSocket?

1. ❓ Loading a user profile page → **Answer: HTTP** (one-time data fetch)
2. ❓ Live chat application → **Answer: WebSocket** (bidirectional, real-time)
3. ❓ Uploading a profile picture → **Answer: HTTP** (one-time upload)
4. ❓ Real-time stock ticker → **Answer: WebSocket** (continuous updates)
5. ❓ Collaborative document editing → **Answer: WebSocket** (real-time changes)
6. ❓ REST API for CRUD operations → **Answer: HTTP** (request-response)
7. ❓ Live sports scores → **Answer: WebSocket** (real-time updates)
8. ❓ User authentication/login → **Answer: HTTP** (one-time verification)

**Exercise 2: Design Analysis**
How would you implement a chat app?

**Option A: HTTP Polling**
```javascript
// Client polls every 2 seconds
setInterval(() => {
  fetch('/api/messages').then(res => res.json());
}, 2000);
```

**Problems with this approach:**
1. ✍️ Write down 3 problems:
   - _________________________________
   - _________________________________
   - _________________________________

**Option B: WebSocket**
```javascript
const socket = io('http://localhost:3000');
socket.on('new_message', (msg) => {
  displayMessage(msg);
});
```

**Advantages:**
1. ✍️ Write down 3 advantages:
   - _________________________________
   - _________________________________
   - _________________________________

### Practical Simulation (30 min)

**Create a "Fake Chat" with HTTP (to understand the pain)**

```javascript
// Add to server.js
let messages = [];

app.get('/api/messages', (req, res) => {
  res.json({ messages });
});

app.post('/api/messages', (req, res) => {
  const message = {
    text: req.body.text,
    sender: req.body.sender,
    timestamp: Date.now()
  };
  messages.push(message);
  res.json({ success: true, message });
});
```

**Create `public/chat-http.html`**
```html
<!DOCTYPE html>
<html>
<head>
  <title>HTTP Chat (The Hard Way)</title>
</head>
<body>
  <h1>HTTP Polling Chat</h1>
  <div id="messages"></div>
  <input id="messageInput" placeholder="Type message...">
  <button onclick="sendMessage()">Send</button>

  <script>
    // Poll for new messages every 2 seconds
    setInterval(async () => {
      const res = await fetch('http://localhost:3000/api/messages');
      const data = await res.json();
      displayMessages(data.messages);
    }, 2000);

    async function sendMessage() {
      const text = document.getElementById('messageInput').value;
      await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender: 'You' })
      });
      document.getElementById('messageInput').value = '';
    }

    function displayMessages(messages) {
      const div = document.getElementById('messages');
      div.innerHTML = messages.map(m =>
        `<p><strong>${m.sender}:</strong> ${m.text}</p>`
      ).join('');
    }
  </script>
</body>
</html>
```

**Test it:**
1. Open browser: `http://localhost:3000/chat-http.html`
2. Open in two browser tabs
3. Send a message in one tab
4. Notice the delay (up to 2 seconds) before it appears in the other tab
5. **Observe:** This is why we need WebSocket!

### Checkpoint
- [ ] Can explain HTTP vs WebSocket to someone else
- [ ] Understand when to use each protocol
- [ ] Experienced the limitations of HTTP polling
- [ ] Ready to appreciate Socket.IO

### Resources
- [WebSocket Protocol Explained](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Real-Time Web Technologies Guide](https://www.pubnub.com/guides/websockets/)

---

## Day 4: Socket.IO Basics 🔌

### Goals
- Install and setup Socket.IO
- Create bidirectional connection
- Emit and receive events
- Build a basic chat (no rooms yet)

### Reading (30 min)
1. **BACKEND_FUNDAMENTALS.md**: Part 3 - Socket.IO Deep Dive
2. Read: Code comments in **src/controllers/socket.controller.js**
3. Read: [Socket.IO Get Started](https://socket.io/get-started/chat)

### Hands-On Coding (120 min)

**Step 1: Install Socket.IO**
```bash
npm install socket.io
```

**Step 2: Create Socket.IO Server**
```javascript
// server.js (replace or create new file)
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files

// ======= SOCKET.IO EVENTS =======

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Listen for 'chat_message' event from client
  socket.on('chat_message', (data) => {
    console.log('📨 Message received:', data);

    // Broadcast to ALL connected clients (including sender)
    io.emit('chat_message', {
      text: data.text,
      sender: data.sender,
      timestamp: Date.now()
    });
  });

  // Listen for disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Start server
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Step 3: Create Client**

Create `public/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>SocketLink Chat</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
    }
    #messages {
      border: 1px solid #ccc;
      height: 400px;
      overflow-y: scroll;
      padding: 10px;
      margin-bottom: 10px;
      background: #f9f9f9;
    }
    .message {
      margin: 5px 0;
      padding: 8px;
      background: white;
      border-radius: 5px;
    }
    .message strong {
      color: #007bff;
    }
    #messageForm {
      display: flex;
      gap: 10px;
    }
    #messageInput {
      flex: 1;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background: #0056b3;
    }
    #status {
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 5px;
    }
    .connected {
      background: #d4edda;
      color: #155724;
    }
    .disconnected {
      background: #f8d7da;
      color: #721c24;
    }
  </style>
</head>
<body>
  <h1>SocketLink Chat</h1>

  <div id="status" class="disconnected">Disconnected</div>

  <div id="messages"></div>

  <form id="messageForm">
    <input id="senderInput" placeholder="Your name..." required>
    <input id="messageInput" placeholder="Type message..." required>
    <button type="submit">Send</button>
  </form>

  <!-- Include Socket.IO client library -->
  <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>

  <script>
    // Connect to Socket.IO server
    const socket = io('http://localhost:3000');

    const messagesDiv = document.getElementById('messages');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const senderInput = document.getElementById('senderInput');
    const statusDiv = document.getElementById('status');

    // ======= CONNECTION EVENTS =======

    socket.on('connect', () => {
      console.log('✅ Connected to server');
      statusDiv.textContent = `Connected (ID: ${socket.id})`;
      statusDiv.className = 'connected';
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      statusDiv.textContent = 'Disconnected';
      statusDiv.className = 'disconnected';
    });

    // ======= MESSAGE EVENTS =======

    // Listen for messages from server
    socket.on('chat_message', (data) => {
      console.log('📨 Message received:', data);
      displayMessage(data.sender, data.text, data.timestamp);
    });

    // Send message when form is submitted
    messageForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const text = messageInput.value.trim();
      const sender = senderInput.value.trim();

      if (!text || !sender) return;

      // Emit message to server
      socket.emit('chat_message', {
        text: text,
        sender: sender
      });

      messageInput.value = '';
    });

    // ======= HELPER FUNCTIONS =======

    function displayMessage(sender, text, timestamp) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message';

      const time = new Date(timestamp).toLocaleTimeString();

      messageDiv.innerHTML = `
        <strong>${sender}</strong>
        <span style="color: #999; font-size: 0.9em;">(${time})</span>
        <br>
        ${text}
      `;

      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll
    }
  </script>
</body>
</html>
```

**Step 4: Test It!**
```bash
npm run dev
# Open http://localhost:3000 in TWO browser tabs
# Send messages and watch them appear INSTANTLY in both tabs!
```

### Practice Exercises (45 min)
1. ✅ Add a "user is typing..." indicator
2. ✅ Display how many users are connected
3. ✅ Add a notification when someone connects/disconnects
4. ✅ Experiment: disconnect your network and see auto-reconnect

### Typing Indicator Example
```javascript
// SERVER
socket.on('typing', (data) => {
  socket.broadcast.emit('user_typing', data);
});

// CLIENT
let typingTimeout;
messageInput.addEventListener('input', () => {
  socket.emit('typing', { sender: senderInput.value });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stop_typing', { sender: senderInput.value });
  }, 1000);
});

socket.on('user_typing', (data) => {
  statusDiv.textContent = `${data.sender} is typing...`;
});
```

### Checkpoint
- [ ] Can create Socket.IO server and client
- [ ] Understand `emit` and `on`
- [ ] Can send messages bidirectionally
- [ ] See instant message delivery
- [ ] Understand connection/disconnect events

### Resources
- [Socket.IO Emit Cheatsheet](https://socket.io/docs/v4/emit-cheatsheet/)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)

---

## Day 5: Room Management 🚪

### Goals
- Understand Socket.IO rooms
- Create multi-room chat
- Join and leave rooms
- Broadcast to specific rooms

### Reading (30 min)
1. **BACKEND_FUNDAMENTALS.md**: Part 3 - Socket.IO Rooms section
2. Read: Room management code in **src/controllers/socket.controller.js** (lines 178-284)
3. Read: [Socket.IO Rooms](https://socket.io/docs/v4/rooms/)

### Hands-On Coding (120 min)

**Step 1: Enhanced Server with Rooms**
```javascript
// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

app.use(express.static('public'));

// Store active rooms and users
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Send list of available rooms
  socket.emit('rooms_list', Array.from(rooms.keys()));

  // ======= ROOM EVENTS =======

  // Create a new room
  socket.on('create_room', (data) => {
    const { roomName, username } = data;

    if (rooms.has(roomName)) {
      socket.emit('error', { message: 'Room already exists' });
      return;
    }

    rooms.set(roomName, new Set());
    io.emit('room_created', { roomName });
    console.log(`🚪 Room created: ${roomName}`);
  });

  // Join a room
  socket.on('join_room', (data) => {
    const { roomName, username } = data;

    // Leave all other rooms first
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    // Join the new room
    socket.join(roomName);
    socket.username = username;
    socket.currentRoom = roomName;

    // Add to room users set
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Set());
    }
    rooms.get(roomName).add(username);

    // Notify others in room
    socket.to(roomName).emit('user_joined', {
      username,
      roomName,
      userCount: rooms.get(roomName).size
    });

    // Send room info to user
    socket.emit('joined_room', {
      roomName,
      users: Array.from(rooms.get(roomName))
    });

    console.log(`👤 ${username} joined room: ${roomName}`);
  });

  // Leave room
  socket.on('leave_room', () => {
    if (socket.currentRoom) {
      const roomName = socket.currentRoom;
      const username = socket.username;

      socket.leave(roomName);
      rooms.get(roomName).delete(username);

      socket.to(roomName).emit('user_left', {
        username,
        roomName
      });

      socket.currentRoom = null;
      console.log(`👋 ${username} left room: ${roomName}`);
    }
  });

  // ======= MESSAGE EVENTS =======

  // Send message to room
  socket.on('room_message', (data) => {
    if (!socket.currentRoom) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    const message = {
      text: data.text,
      sender: socket.username,
      roomName: socket.currentRoom,
      timestamp: Date.now()
    };

    // Broadcast to everyone in the room (including sender)
    io.to(socket.currentRoom).emit('room_message', message);

    console.log(`📨 [${socket.currentRoom}] ${socket.username}: ${data.text}`);
  });

  // ======= DISCONNECT =======

  socket.on('disconnect', () => {
    if (socket.currentRoom && socket.username) {
      const roomName = socket.currentRoom;
      rooms.get(roomName)?.delete(socket.username);

      socket.to(roomName).emit('user_left', {
        username: socket.username,
        roomName
      });
    }

    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Step 2: Enhanced Client**

Create `public/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>SocketLink - Multi-Room Chat</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #007bff;
      color: white;
      padding: 15px;
      text-align: center;
    }
    .container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      width: 250px;
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      padding: 20px;
      overflow-y: auto;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .room-header {
      background: #e9ecef;
      padding: 15px;
      border-bottom: 1px solid #dee2e6;
    }
    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: white;
    }
    .message {
      margin-bottom: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 5px;
    }
    .message strong {
      color: #007bff;
    }
    .system-message {
      background: #fff3cd;
      color: #856404;
      text-align: center;
      font-style: italic;
    }
    .message-form {
      padding: 20px;
      border-top: 1px solid #dee2e6;
      background: #f8f9fa;
    }
    .message-form form {
      display: flex;
      gap: 10px;
    }
    input {
      padding: 10px;
      border: 1px solid #ced4da;
      border-radius: 5px;
      flex: 1;
    }
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background: #0056b3;
    }
    .room-list {
      margin-top: 20px;
    }
    .room-item {
      padding: 10px;
      margin-bottom: 5px;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 5px;
      cursor: pointer;
    }
    .room-item:hover {
      background: #e9ecef;
    }
    .room-item.active {
      background: #007bff;
      color: white;
    }
    .login-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-box {
      background: white;
      padding: 40px;
      border-radius: 10px;
      min-width: 300px;
    }
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <!-- Login Screen -->
  <div id="loginScreen" class="login-screen">
    <div class="login-box">
      <h2>Enter Your Name</h2>
      <form id="loginForm">
        <input id="usernameInput" placeholder="Your name..." required>
        <button type="submit">Enter Chat</button>
      </form>
    </div>
  </div>

  <!-- Main Chat Interface -->
  <div id="chatInterface" class="hidden">
    <header>
      <h1>SocketLink Multi-Room Chat</h1>
    </header>

    <div class="container">
      <!-- Sidebar -->
      <div class="sidebar">
        <h3>Create Room</h3>
        <form id="createRoomForm">
          <input id="newRoomInput" placeholder="Room name..." required>
          <button type="submit">Create</button>
        </form>

        <div class="room-list">
          <h3>Rooms</h3>
          <div id="roomsList"></div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="main">
        <div class="room-header">
          <h2 id="currentRoomName">Select a room to start chatting</h2>
          <p id="userCount"></p>
        </div>

        <div id="messages"></div>

        <div class="message-form">
          <form id="messageForm">
            <input id="messageInput" placeholder="Type message..." required disabled>
            <button type="submit" id="sendButton" disabled>Send</button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
  <script>
    const socket = io('http://localhost:3000');
    let username = '';
    let currentRoom = '';

    // ======= DOM ELEMENTS =======
    const loginScreen = document.getElementById('loginScreen');
    const chatInterface = document.getElementById('chatInterface');
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('usernameInput');
    const createRoomForm = document.getElementById('createRoomForm');
    const newRoomInput = document.getElementById('newRoomInput');
    const roomsList = document.getElementById('roomsList');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesDiv = document.getElementById('messages');
    const currentRoomName = document.getElementById('currentRoomName');
    const userCount = document.getElementById('userCount');

    // ======= LOGIN =======
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      username = usernameInput.value.trim();
      if (username) {
        loginScreen.classList.add('hidden');
        chatInterface.classList.remove('hidden');
      }
    });

    // ======= CREATE ROOM =======
    createRoomForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const roomName = newRoomInput.value.trim();
      if (roomName) {
        socket.emit('create_room', { roomName, username });
        newRoomInput.value = '';
      }
    });

    // ======= SEND MESSAGE =======
    messageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = messageInput.value.trim();
      if (text && currentRoom) {
        socket.emit('room_message', { text });
        messageInput.value = '';
      }
    });

    // ======= SOCKET EVENTS =======

    // Receive rooms list
    socket.on('rooms_list', (rooms) => {
      roomsList.innerHTML = '';
      rooms.forEach(room => {
        addRoomToList(room);
      });
    });

    // Room created
    socket.on('room_created', (data) => {
      addRoomToList(data.roomName);
    });

    // Joined room
    socket.on('joined_room', (data) => {
      currentRoom = data.roomName;
      currentRoomName.textContent = `#${data.roomName}`;
      userCount.textContent = `${data.users.length} users online`;
      messagesDiv.innerHTML = '';
      messageInput.disabled = false;
      sendButton.disabled = false;

      addSystemMessage(`Joined room: ${data.roomName}`);
      addSystemMessage(`Users: ${data.users.join(', ')}`);
    });

    // User joined
    socket.on('user_joined', (data) => {
      addSystemMessage(`${data.username} joined the room`);
      userCount.textContent = `${data.userCount} users online`;
    });

    // User left
    socket.on('user_left', (data) => {
      addSystemMessage(`${data.username} left the room`);
    });

    // Receive message
    socket.on('room_message', (data) => {
      addMessage(data.sender, data.text, data.timestamp);
    });

    // Error
    socket.on('error', (data) => {
      alert(data.message);
    });

    // ======= HELPER FUNCTIONS =======

    function addRoomToList(roomName) {
      const roomDiv = document.createElement('div');
      roomDiv.className = 'room-item';
      roomDiv.textContent = `#${roomName}`;
      roomDiv.onclick = () => joinRoom(roomName);
      roomsList.appendChild(roomDiv);
    }

    function joinRoom(roomName) {
      socket.emit('join_room', { roomName, username });

      // Update UI
      document.querySelectorAll('.room-item').forEach(item => {
        item.classList.remove('active');
      });
      event.target.classList.add('active');
    }

    function addMessage(sender, text, timestamp) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message';
      const time = new Date(timestamp).toLocaleTimeString();
      messageDiv.innerHTML = `
        <strong>${sender}</strong>
        <span style="color: #999; font-size: 0.9em;">${time}</span>
        <br>${text}
      `;
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function addSystemMessage(text) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message system-message';
      messageDiv.textContent = text;
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  </script>
</body>
</html>
```

### Practice Exercises (45 min)
1. ✅ Display list of users in current room
2. ✅ Add ability to delete empty rooms
3. ✅ Add room description/topic
4. ✅ Implement private rooms (password-protected)

### Checkpoint
- [ ] Can create and join rooms
- [ ] Understand room-based broadcasting
- [ ] Can manage multiple rooms
- [ ] Understand socket.join() and socket.leave()

---

## Day 6: Authentication Part 1 - Registration & Login 🔐

### Goals
- Understand password hashing
- Implement user registration
- Implement login with bcrypt
- Store users (in-memory for now)

### Reading (30 min)
1. **BACKEND_FUNDAMENTALS.md**: Part 6 - Authentication & Security (bcrypt section)
2. Read: Code comments in **src/controllers/auth.controller.js** (focus on register function)
3. Read: [bcrypt Explained](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/)

### Hands-On Coding (120 min)

**Step 1: Install Dependencies**
```bash
npm install bcryptjs
```

**Step 2: Study Existing Auth Implementation**

The auth routes and controllers are already implemented! Study these files:
- **src/routes/auth.routes.js** - Route definitions
- **src/controllers/auth.controller.js** - Registration and login logic

Example code structure:
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// In-memory user storage (replace with database in production)
const users = new Map();

// ======= REGISTER =======
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    if (users.has(username)) {
      return res.status(400).json({
        error: 'Username already exists'
      });
    }

    // Hash password (10 rounds of salting)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user
    users.set(username, {
      username,
      password: hashedPassword,
      createdAt: Date.now()
    });

    console.log('✅ User registered:', username);

    res.json({
      success: true,
      message: 'User registered successfully',
      username
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======= LOGIN =======
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password required'
      });
    }

    // Check if user exists
    const user = users.get(username);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    console.log('✅ User logged in:', username);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        username: user.username,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======= GET ALL USERS (for testing) =======
router.get('/users', (req, res) => {
  const userList = Array.from(users.values()).map(user => ({
    username: user.username,
    createdAt: user.createdAt
  }));

  res.json({ users: userList });
});

module.exports = router;
```

**Step 3: Update Server**
```javascript
// server.js (add these lines)
const authRoutes = require('./src/routes/auth.routes');

app.use(express.json()); // Parse JSON bodies
app.use('/api/auth', authRoutes); // Auth routes
```

**Step 4: Test with curl**
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"alice123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"alice123"}'

# Get all users
curl http://localhost:3000/api/auth/users
```

### Practice Exercises (45 min)
1. ✅ Add email validation
2. ✅ Add username length requirements
3. ✅ Add "last login" timestamp
4. ✅ Implement password strength checker
5. ✅ Add rate limiting (prevent brute force)

### Understanding bcrypt
```javascript
// How bcrypt works:
const password = 'mypassword123';

// Hash (this takes time deliberately - prevents brute force)
const hash1 = await bcrypt.hash(password, 10); // 10 rounds
// $2a$10$N9qo8uLOickgx2ZMRZoMye...

const hash2 = await bcrypt.hash(password, 10);
// $2a$10$differentHashBecauseOfSalt...

// Notice: Same password, different hashes! (because of salt)

// Compare
await bcrypt.compare('mypassword123', hash1); // true
await bcrypt.compare('wrongpassword', hash1);  // false
```

### Checkpoint
- [ ] Can register new users
- [ ] Passwords are hashed (never stored plain text)
- [ ] Can login with correct credentials
- [ ] Understand bcrypt salt rounds
- [ ] Handle validation errors

---

## Day 7: Authentication Part 2 - JWT & Protected Routes 🎫

### Goals
- Understand JWT tokens
- Generate JWT on login
- Verify JWT tokens
- Protect Socket.IO connections

### Reading (30 min)
1. **BACKEND_FUNDAMENTALS.md**: Part 6 - JWT Authentication section
2. Read: Code comments in **src/middleware/auth.middleware.js**
3. Visit: [JWT.io](https://jwt.io/) and decode a token
4. Read: [JWT Introduction](https://jwt.io/introduction)

### Hands-On Coding (120 min)

**Step 1: Install JWT**
```bash
npm install jsonwebtoken dotenv
```

**Step 2: Create `.env` file**
```
PORT=3000
JWT_SECRET=your_super_secret_key_min_32_characters_long_12345
```

**Step 3: Update Server to Use .env**
```javascript
// server.js (add at very top)
require('dotenv').config();

const PORT = process.env.PORT || 3000;
```

**Step 4: JWT is Already Implemented!**

JWT functionality is built into **src/controllers/auth.controller.js** and **src/middleware/auth.middleware.js**.

Study the implementation:
```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not defined in .env file');
}

/**
 * Generate JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h' // Token expires in 24 hours
  });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = { generateToken, verifyToken };
```

**Step 5: Study How JWT is Generated on Login**
```javascript
// This is already implemented in src/controllers/auth.controller.js
// Study the login function:

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = users.get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      username: user.username,
      userId: user.username // In production, use a unique ID
    });

    console.log('✅ User logged in:', username);

    res.json({
      success: true,
      message: 'Login successful',
      token, // Send token to client
      user: {
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

**Step 6: Study Socket.IO Auth Middleware**

This is already implemented in **src/middleware/auth.middleware.js**!

Study the `authenticateSocket` function:
```javascript
const { verifyToken } = require('../utils/jwt');

/**
 * Socket.IO authentication middleware
 * Verifies JWT token before allowing connection
 */
function socketAuthMiddleware(socket, next) {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user data to socket
    socket.userId = decoded.userId;
    socket.username = decoded.username;

    console.log('✅ Socket authenticated:', socket.username);

    // Allow connection
    next();

  } catch (error) {
    console.error('Socket auth error:', error.message);
    next(new Error('Authentication error: Invalid token'));
  }
}

module.exports = socketAuthMiddleware;
```

**Step 7: Study How Server Uses Socket Auth**
```javascript
// This is already implemented in src/index.js
// Study how the middleware is applied:

// Apply authentication middleware to Socket.IO
io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.username, '(', socket.id, ')');

  // Now socket.username and socket.userId are available!

  socket.on('join_room', (data) => {
    const { roomName } = data;

    socket.join(roomName);
    socket.currentRoom = roomName;

    // Use authenticated username
    io.to(roomName).emit('user_joined', {
      username: socket.username, // From JWT!
      roomName
    });
  });

  socket.on('room_message', (data) => {
    const message = {
      text: data.text,
      sender: socket.username, // From JWT!
      roomName: socket.currentRoom,
      timestamp: Date.now()
    };

    io.to(socket.currentRoom).emit('room_message', message);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.username);
  });
});
```

**Step 8: Update Client to Use JWT**
```html
<!-- public/index.html - update script section -->
<script>
  let username = '';
  let token = '';
  let socket = null;

  // ======= LOGIN =======
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    username = usernameInput.value.trim();
    const password = document.getElementById('passwordInput').value;

    // Call login API
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      // Store token
      token = data.token;
      localStorage.setItem('auth_token', token);

      // Connect to Socket.IO with token
      connectSocket();

      loginScreen.classList.add('hidden');
      chatInterface.classList.remove('hidden');

    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  });

  // ======= CONNECT SOCKET WITH TOKEN =======
  function connectSocket() {
    socket = io('http://localhost:3000', {
      auth: {
        token: token // Send token in handshake!
      }
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected with authentication');
    });

    socket.on('connect_error', (error) => {
      alert('Connection failed: ' + error.message);
      console.error(error);
    });

    // ... rest of socket event listeners
  }

  // Check for existing token on page load
  window.addEventListener('load', () => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      token = savedToken;
      connectSocket();
      // Skip login screen
      loginScreen.classList.add('hidden');
      chatInterface.classList.remove('hidden');
    }
  });
</script>
```

### Practice Exercises (45 min)
1. ✅ Add token refresh mechanism
2. ✅ Add logout functionality (clear token)
3. ✅ Handle token expiration gracefully
4. ✅ Add "Remember me" checkbox
5. ✅ Display current user's profile

### Understanding JWT Flow
```
┌─────────┐                 ┌─────────┐
│ Client  │                 │ Server  │
└────┬────┘                 └────┬────┘
     │                           │
     │ POST /login               │
     │ {user, pass}              │
     ├──────────────────────────>│
     │                           │ ✓ Verify credentials
     │                           │ ✓ Generate JWT
     │                           │
     │ {token: "eyJhbG..."}     │
     │<──────────────────────────┤
     │                           │
     │ Save token in localStorage│
     │                           │
     │ Connect Socket.IO         │
     │ auth: {token}             │
     ├──────────────────────────>│
     │                           │ ✓ Verify JWT
     │                           │ ✓ Extract user info
     │                           │ ✓ Allow connection
     │ Connection success        │
     │<──────────────────────────┤
     │                           │
```

### Checkpoint
- [ ] Can generate JWT tokens
- [ ] Can verify JWT tokens
- [ ] Socket.IO connections are authenticated
- [ ] Understand token storage in localStorage
- [ ] Handle authentication errors

---

## Day 8: Event-Driven Architecture 🏗️

### Goals
- Understand event-driven patterns
- Refactor code with EventEmitter
- Implement message events
- Add extensible features

### Reading (30 min)
1. **BACKEND_FUNDAMENTALS.md**: Part 7 - Advanced Topics (Event-Driven Architecture)
2. Read: [Node.js EventEmitter](https://nodejs.org/api/events.html)

**Note:** The current simplified SocketLink implementation doesn't use EventEmitter pattern (it was removed for simplicity). This day is optional advanced learning.

### Hands-On Coding (120 min)

**Step 1: Create Event Emitters**

Create `src/events/messageEvents.js`:
```javascript
const EventEmitter = require('events');

class MessageEventEmitter extends EventEmitter {}

const messageEmitter = new MessageEventEmitter();

// ======= EVENT LISTENERS =======

// Log all messages
messageEmitter.on('message_created', (message) => {
  console.log(`📨 [${message.roomName}] ${message.sender}: ${message.text}`);
});

// Track message count
let messageCount = 0;
messageEmitter.on('message_created', (message) => {
  messageCount++;
  console.log(`Total messages sent: ${messageCount}`);
});

// Detect spam (example)
messageEmitter.on('message_created', (message) => {
  if (message.text.length > 500) {
    console.warn(`⚠️ Long message detected from ${message.sender}`);
  }
});

module.exports = messageEmitter;
```

**Step 2: Update Server to Use Events**
```javascript
// server.js
const messageEmitter = require('./src/events/messageEvents');

io.on('connection', (socket) => {
  socket.on('room_message', (data) => {
    const message = {
      text: data.text,
      sender: socket.username,
      roomName: socket.currentRoom,
      timestamp: Date.now(),
      messageId: generateId()
    };

    // Emit event (multiple listeners will handle it)
    messageEmitter.emit('message_created', message);

    // Broadcast to room
    io.to(socket.currentRoom).emit('room_message', message);
  });
});

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
```

**Step 3: Add Analytics Listener**

Create `src/events/analyticsEvents.js`:
```javascript
const messageEmitter = require('./messageEvents');

const analytics = {
  totalMessages: 0,
  messagesByRoom: {},
  messagesByUser: {},
};

messageEmitter.on('message_created', (message) => {
  analytics.totalMessages++;

  // Track by room
  if (!analytics.messagesByRoom[message.roomName]) {
    analytics.messagesByRoom[message.roomName] = 0;
  }
  analytics.messagesByRoom[message.roomName]++;

  // Track by user
  if (!analytics.messagesByUser[message.sender]) {
    analytics.messagesByUser[message.sender] = 0;
  }
  analytics.messagesByUser[message.sender]++;
});

function getAnalytics() {
  return analytics;
}

module.exports = { getAnalytics };
```

**Step 4: Add Analytics Route**
```javascript
// server.js
const { getAnalytics } = require('./src/events/analyticsEvents');

app.get('/api/analytics', (req, res) => {
  res.json(getAnalytics());
});
```

### Practice Exercises (45 min)
1. ✅ Add user connection/disconnection events
2. ✅ Add room creation events
3. ✅ Implement message editing with events
4. ✅ Add profanity filter listener

### Checkpoint
- [ ] Understand EventEmitter pattern
- [ ] Can add new features without modifying core code
- [ ] See benefits of decoupled architecture
- [ ] Can add multiple listeners to same event

---

## Day 9: Redis Integration ⚡

### Goals
- Understand Redis basics
- Install and configure Redis
- Implement caching
- Add Redis adapter for Socket.IO (optional)

### Reading (30 min)
1. **BACKEND_FUNDAMENTALS.md**: Part 7 - Redis & Caching
2. Read: [Redis Quick Start](https://redis.io/docs/getting-started/)

**Note:** Redis is optional for the basic implementation. The current code works without Redis.

### Hands-On Coding (120 min)

**Step 1: Install Redis**

**Windows:**
```bash
# Use WSL or download Redis for Windows
# https://github.com/microsoftarchive/redis/releases
```

**Mac:**
```bash
brew install redis
redis-server
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo service redis-server start
```

**Step 2: Install Redis Client**
```bash
npm install redis
```

**Step 3: Create Redis Configuration (Optional)**

If you want to add Redis, create `src/config/redis.js`:
```javascript
const redis = require('redis');

let redisClient = null;
let isRedisReady = false;

async function connectRedis() {
  if (process.env.REDIS_ENABLED !== 'true') {
    console.log('⚠️ Redis disabled in .env');
    return null;
  }

  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err);
      isRedisReady = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
      isRedisReady = true;
    });

    await redisClient.connect();

    return redisClient;

  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return null;
  }
}

function getRedisClient() {
  return isRedisReady ? redisClient : null;
}

module.exports = { connectRedis, getRedisClient };
```

**Step 4: Update .env**
```
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Step 5: Implement Message Caching**
```javascript
// src/events/messageCacheListener.js
const messageEmitter = require('./messageEvents');
const { getRedisClient } = require('../config/redis');

messageEmitter.on('message_created', async (message) => {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = `messages:${message.roomName}`;

    // Store message in list (keep last 50)
    await redis.lpush(key, JSON.stringify(message));
    await redis.ltrim(key, 0, 49);

    console.log('✅ Message cached in Redis');
  } catch (error) {
    console.error('Redis cache error:', error);
  }
});

async function getCachedMessages(roomName) {
  const redis = getRedisClient();
  if (!redis) return [];

  try {
    const messages = await redis.lrange(`messages:${roomName}`, 0, 49);
    return messages.map(msg => JSON.parse(msg)).reverse();
  } catch (error) {
    console.error('Redis get error:', error);
    return [];
  }
}

module.exports = { getCachedMessages };
```

**Step 6: Send Cached Messages on Join**
```javascript
// server.js
const { getCachedMessages } = require('./src/events/messageCacheListener');

socket.on('join_room', async (data) => {
  const { roomName } = data;

  socket.join(roomName);
  socket.currentRoom = roomName;

  // Send cached messages
  const cachedMessages = await getCachedMessages(roomName);
  socket.emit('message_history', cachedMessages);

  io.to(roomName).emit('user_joined', {
    username: socket.username,
    roomName
  });
});
```

### Practice Exercises (45 min)
1. ✅ Cache online users in Redis
2. ✅ Implement session storage in Redis
3. ✅ Add message search with Redis
4. ✅ Monitor Redis memory usage

### Checkpoint
- [ ] Redis is installed and running
- [ ] Can cache data in Redis
- [ ] Messages persist across reconnections
- [ ] Understand Redis data structures

---

## Day 10: Polish, Testing & Deployment 🚀

### Goals
- Code cleanup and documentation
- Test edge cases
- Add error handling
- Prepare for deployment
- Practice interview explanations

### Tasks (180 min)

**1. Code Review & Cleanup (45 min)**
- [ ] Add comments to complex sections
- [ ] Remove console.logs or use proper logger
- [ ] Check for memory leaks
- [ ] Validate all inputs

**2. Error Handling (30 min)**
```javascript
// Add global error handlers

// Express error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

**3. Testing Edge Cases (45 min)**
Test these scenarios:
- [ ] User disconnects mid-message
- [ ] Invalid JWT token
- [ ] Message too long
- [ ] Special characters in messages
- [ ] Multiple tabs same user
- [ ] Network disconnect/reconnect
- [ ] Server restart (do messages persist?)

**4. Documentation (30 min)**
Update README.md with:
- [ ] Setup instructions
- [ ] Environment variables
- [ ] How to run
- [ ] API endpoints
- [ ] Troubleshooting

**5. Interview Preparation (30 min)**
Practice explaining out loud:
- [ ] "Walk me through your architecture"
- [ ] "Why did you choose Socket.IO?"
- [ ] "How would you scale this?"
- [ ] "Explain your authentication flow"
- [ ] "What challenges did you face?"

### Optional: Deployment
```bash
# Deploy to Heroku, Railway, or Render
# Example for Heroku:
heroku create socketlink-app
git push heroku main
heroku open
```

### Final Checkpoint
- [ ] Project runs without errors
- [ ] All features working
- [ ] Can explain every technical decision
- [ ] Ready to demo in interview
- [ ] Confident in concepts

---

## 📚 Additional Resources by Topic

### Node.js & Express
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### Socket.IO
- [Official Docs](https://socket.io/docs/v4/)
- [Socket.IO Tutorial - Net Ninja](https://www.youtube.com/playlist?list=PL4cUxeGkcC9i4V-_ZVwLmOusj8YAUhj_9)

### Authentication
- [JWT Best Practices](https://blog.logrocket.com/jwt-authentication-best-practices/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)

### Redis
- [Redis University (Free)](https://university.redis.com/)
- [Redis Commands](https://redis.io/commands)

---

## 🎯 Success Metrics

By the end of 10 days, you should be able to:

✅ Build a real-time chat app from scratch in 2-3 hours
✅ Explain HTTP vs WebSocket confidently
✅ Implement secure authentication (bcrypt + JWT)
✅ Use Socket.IO rooms for message routing
✅ Understand event-driven architecture
✅ Configure Redis for caching
✅ Answer technical interview questions about real-time systems
✅ Debug connection and authentication issues
✅ Discuss scalability strategies

---

## 💡 Tips for Learning

1. **Type, Don't Copy-Paste:** Type all code yourself to build muscle memory
2. **Break Things:** Intentionally break code to understand how it fails
3. **Explain Out Loud:** Practice explaining concepts as if teaching someone
4. **Build Variations:** After completing, try building a different app (collaborative todo, live polls)
5. **Ask "Why?":** For every technology choice, ask why it's used
6. **Draw Diagrams:** Sketch architectures and data flows
7. **Review Daily:** Spend 10 minutes reviewing previous day's concepts
8. **Debug Without Google:** Try solving errors yourself first
9. **Read Others' Code:** Check Socket.IO examples on GitHub
10. **Stay Curious:** Explore beyond the schedule when interested

---

## 🎓 After Completion

### Next Projects to Build
1. **Collaborative Whiteboard** (Socket.IO + Canvas)
2. **Live Poll/Quiz App** (Real-time voting)
3. **Multiplayer Game** (Real-time game state)
4. **Video Chat App** (WebRTC + Socket.IO signaling)
5. **Live Dashboard** (Real-time analytics)

### Advanced Topics to Explore
- **Database Integration:** PostgreSQL, MongoDB
- **Testing:** Jest, Mocha, Socket.IO testing
- **CI/CD:** GitHub Actions, automated deployment
- **Monitoring:** PM2, Winston, Sentry
- **Scaling:** Load balancing, Kubernetes
- **GraphQL Subscriptions:** Alternative to Socket.IO for some use cases

---

**Good luck with your learning journey! Remember: Consistency beats intensity. Even 1 hour a day will get you there. 🚀**
