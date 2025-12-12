# SocketLink — Real-Time Chat Application

**A beginner-friendly backend project built with Node.js, Express, Socket.IO, and JWT Authentication.**

Perfect for learning real-time communication, WebSocket fundamentals, and modern backend development.

---

## ✨ Features

✅ **User Registration & Login** (JWT Authentication)
✅ **Real-Time Chat** (Socket.IO WebSocket)
✅ **Multiple Chat Rooms** (Create, join, leave)
✅ **User Presence** (See who's online in each room)
✅ **Typing Indicators** ("User is typing...")
✅ **Secure Password Hashing** (bcrypt with salt)
✅ **Token-Based Auth** (Stateless JWT)
✅ **Clean MVC Architecture** (Easy to understand and extend)

---

## 🗂 Folder Structure

```
SocketLink/
├── src/
│   ├── controllers/          # Business logic
│   │   ├── auth.controller.js       # Register, login
│   │   └── socket.controller.js     # Real-time events
│   ├── middleware/           # Auth verification
│   │   └── auth.middleware.js
│   ├── routes/               # API endpoints
│   │   └── auth.routes.js
│   └── index.js              # Main server file
├── public/                   # Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── style.css
│   └── client.js
├── .env                      # Environment variables
├── package.json
└── README.md
```

**Simple & Clean!** No complex abstractions. Everything is beginner-friendly.

---

## 📦 Installation

### 1. Clone or Download

```bash
cd SocketLink
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_key_change_this_in_production_min_32_chars
```

⚠️ **Important**: Change `JWT_SECRET` to a random, long string in production!

---

## ▶️ Run the Server

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will start at: **http://localhost:3001**

---

## 🔐 Authentication API

### Register New User

**POST** `/api/auth/register`

```json
{
  "username": "alice",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "userId": "l3k5j2h4",
    "username": "alice",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Login

**POST** `/api/auth/login`

```json
{
  "username": "alice",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "l3k5j2h4",
    "username": "alice"
  }
}
```

💡 **Store the token!** You'll need it for WebSocket connection.

---

### Get All Users (Debugging Only)

**GET** `/api/auth/users`

Returns list of all registered users (without passwords).

---

## 🔌 Real-Time Socket.IO Events

### Connect to Socket.IO

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE'
  }
});
```

---

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `get_rooms` | - | Get list of available rooms |
| `create_room` | `{ roomName }` | Create a new chat room |
| `join_room` | `{ roomName }` | Join a room |
| `leave_room` | - | Leave current room |
| `send_message` | `{ text }` | Send message to current room |
| `typing` | - | Notify others you're typing |
| `stop_typing` | - | Stop typing indicator |

---

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `rooms_list` | `['general', 'random']` | List of available rooms |
| `room_created` | `{ roomName, createdBy, timestamp }` | New room created |
| `joined_room` | `{ roomName, users, userCount }` | Successfully joined room |
| `user_joined` | `{ username, roomName, userCount }` | Someone joined your room |
| `user_left` | `{ username, roomName, userCount }` | Someone left your room |
| `new_message` | `{ messageId, text, sender, roomName, timestamp }` | New message in room |
| `user_typing` | `{ username, roomName }` | User is typing |
| `user_stop_typing` | `{ username }` | User stopped typing |
| `error` | `{ message, code }` | Error occurred |

---

## 📌 How It Works

### 1. Registration & Login Flow

```
┌─────────┐                    ┌─────────┐
│ Client  │                    │ Server  │
└────┬────┘                    └────┬────┘
     │                              │
     │  POST /api/auth/register     │
     │ { username, password }       │
     ├─────────────────────────────>│
     │                              │
     │                         Hash password
     │                         Store user
     │                              │
     │  201 Created                 │
     │ { success: true, user }      │
     │<─────────────────────────────┤
     │                              │
     │  POST /api/auth/login        │
     │ { username, password }       │
     ├─────────────────────────────>│
     │                              │
     │                      Verify password
     │                      Generate JWT
     │                              │
     │  200 OK                      │
     │ { token, user }              │
     │<─────────────────────────────┤
     │                              │
```

### 2. Real-Time Chat Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Alice   │                    │ Server  │                    │   Bob   │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │  Connect with JWT            │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │  join_room { roomName }      │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │                              │  user_joined { username }    │
     │                              ├─────────────────────────────>│
     │                              │                              │
     │  send_message { text }       │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │  new_message                 │  new_message                 │
     │<─────────────────────────────┼─────────────────────────────>│
     │                              │                              │
```

---

## 🔒 Security Features

### Password Hashing

- ✅ Uses **bcrypt** with salt (cost factor: 10)
- ✅ Each password gets unique salt
- ✅ Impossible to reverse hash to get password
- ✅ Slow by design (prevents brute force)

### JWT Authentication

- ✅ Stateless (no server-side sessions)
- ✅ Signed with secret key (tamper-proof)
- ✅ 24-hour expiration
- ✅ Contains user data (no DB lookup needed)

### Input Validation

- ✅ Username: 3-20 characters, alphanumeric + underscore
- ✅ Password: Minimum 6 characters
- ✅ Message: Maximum 1000 characters
- ✅ Room name: Maximum 50 characters

---

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"SecurePass123"}'
```

### Using JavaScript (Browser Console)

```javascript
// Register
fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'alice', password: 'SecurePass123' })
})
.then(res => res.json())
.then(data => console.log(data));

// Login
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'alice', password: 'SecurePass123' })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('token', data.token);
  console.log('Logged in!', data);
});
```

---

## 🎓 Learning Resources

This project includes **extensive documentation** to help you understand every concept:

1. **[BACKEND_FUNDAMENTALS.md](./BACKEND_FUNDAMENTALS.md)** - Complete backend guide (35,000 words)
   - How the Internet works
   - HTTP protocol deep dive
   - WebSocket vs HTTP
   - JWT authentication explained
   - Password security with bcrypt
   - Node.js event loop
   - Express.js framework
   - And much more!

2. **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Architecture and design decisions

3. **[DAY_WISE_SCHEDULE.md](./DAY_WISE_SCHEDULE.md)** - 10-day learning plan

4. **[CONCEPTS.md](./CONCEPTS.md)** - Deep dive into specific concepts

---

## 🐛 Common Issues & Solutions

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
1. Change port in `.env`: `PORT=3002`
2. Or kill the process using port 3001:
   - Windows: `netstat -ano | findstr :3001` then `taskkill /PID <number> /F`
   - Mac/Linux: `lsof -i :3001` then `kill -9 <PID>`

---

### JWT Secret Not Defined

**Error:** `secretOrPrivateKey must have a value`

**Solution:** Create/edit `.env` file and add:
```env
JWT_SECRET=your_super_secret_key_min_32_characters
```

---

### Connection Failed

**Error:** `connect_error` on client

**Possible causes:**
1. Server not running → Start with `npm run dev`
2. Wrong URL → Check `http://localhost:3001`
3. Invalid token → Login again to get new token
4. Token expired → Login again (tokens expire after 24h)

---

## 🚀 What's Next?

Want to enhance this project? Try adding:

- ✨ Private messaging (1-on-1 chat)
- ✨ Message persistence (PostgreSQL/MongoDB)
- ✨ File uploads (images, documents)
- ✨ User profiles (avatar, bio)
- ✨ Message search
- ✨ Online/offline status
- ✨ Read receipts
- ✨ Message reactions (like, love, etc.)

---

## 📚 Interview Preparation

This project covers key backend topics for interviews:

✅ RESTful API design
✅ Authentication & Authorization
✅ WebSocket communication
✅ JWT tokens
✅ Password security
✅ Real-time systems
✅ Event-driven architecture
✅ MVC pattern

Check [BACKEND_FUNDAMENTALS.md](./BACKEND_FUNDAMENTALS.md) for detailed interview Q&A!

---

## 🤝 Contributing

This is a learning project. Feel free to:
- Report bugs
- Suggest improvements
- Ask questions
- Share your enhanced version

---

## 📄 License

MIT License - Feel free to use this project for learning!

---

## 💡 Tips for Beginners

1. **Read the code comments** - Every file has detailed explanations
2. **Start simple** - Understand one file at a time
3. **Test as you go** - Use Postman or cURL to test endpoints
4. **Break things** - Best way to learn is to experiment
5. **Ask questions** - Use the documentation or Google

---

**Happy Learning! 🎉**

Built with ❤️ for backend beginners
