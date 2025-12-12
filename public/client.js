/**
 * SocketLink Client-Side JavaScript
 *
 * This file handles:
 * 1. User authentication (login/register)
 * 2. Socket.IO connection with JWT token
 * 3. Real-time messaging
 * 4. Room management
 * 5. UI updates
 *
 * STRUCTURE:
 * - State management (username, token, current room)
 * - DOM element references
 * - Authentication functions
 * - Socket.IO connection and event handlers
 * - UI update functions
 * - Utility functions
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_URL = 'http://localhost:3003';
const SOCKET_URL = 'http://localhost:3003';

// ============================================================================
// STATE
// ============================================================================

let socket = null;
let currentUsername = null;
let authToken = null;
let currentRoom = null;
let typingTimeout = null;

// ============================================================================
// DOM ELEMENTS
// ============================================================================

// Screens
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');

// Login/Register
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authError = document.getElementById('authError');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

// Chat Interface
const currentUsernameDisplay = document.getElementById('currentUsername');
const logoutBtn = document.getElementById('logoutBtn');
const createRoomForm = document.getElementById('createRoomForm');
const newRoomInput = document.getElementById('newRoomInput');
const roomsList = document.getElementById('roomsList');
const currentRoomName = document.getElementById('currentRoomName');
const roomUsers = document.getElementById('roomUsers');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');
const messagesContainer = document.getElementById('messagesContainer');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const connectionStatus = document.getElementById('connectionStatus');
const typingIndicator = document.getElementById('typingIndicator');

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Handle login form submission
 */
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    hideError();
    showLoading('Logging in...');

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Success! Store token and username
    authToken = data.token;
    currentUsername = data.user.username;

    // Save to localStorage for persistence
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('username', currentUsername);

    // Connect to Socket.IO
    connectSocket();

    // Switch to chat screen
    showChatScreen();

  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
});

/**
 * Handle register form submission
 */
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value;

  try {
    hideError();
    showLoading('Creating account...');

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Success! Now log them in automatically
    showSuccess('Account created! Logging you in...');

    setTimeout(() => {
      // Fill login form and submit
      document.getElementById('loginUsername').value = username;
      document.getElementById('loginPassword').value = password;
      showLoginTab();
      loginForm.dispatchEvent(new Event('submit'));
    }, 1000);

  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
});

/**
 * Toggle between login and register tabs
 */
showRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();
  showRegisterTab();
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  showLoginTab();
});

function showLoginTab() {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  hideError();
}

function showRegisterTab() {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  hideError();
}

/**
 * Handle logout
 */
logoutBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    logout();
  }
});

function logout() {
  // Disconnect socket
  if (socket) {
    socket.disconnect();
  }

  // Clear state
  authToken = null;
  currentUsername = null;
  currentRoom = null;

  // Clear localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('username');

  // Switch to login screen
  showLoginScreen();

  // Reset forms
  loginForm.reset();
  registerForm.reset();
}

// ============================================================================
// SOCKET.IO CONNECTION
// ============================================================================

/**
 * Connect to Socket.IO server with authentication
 */
function connectSocket() {
  console.log('Connecting to Socket.IO server...');

  // Create socket connection with JWT token
  socket = io(SOCKET_URL, {
    auth: {
      token: authToken
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  // ========== CONNECTION EVENTS ==========

  socket.on('connect', () => {
    console.log('✅ Connected to server');
    updateConnectionStatus(true);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from server:', reason);
    updateConnectionStatus(false);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
    updateConnectionStatus(false);

    if (error.message.includes('Authentication')) {
      // Token is invalid - logout
      alert('Session expired. Please login again.');
      logout();
    }
  });

  // ========== ROOM EVENTS ==========

  socket.on('rooms_list', (rooms) => {
    console.log('Received rooms list:', rooms);
    updateRoomsList(rooms);
  });

  socket.on('room_created', (data) => {
    console.log('Room created:', data.roomName);
    addRoomToList(data.roomName);
  });

  socket.on('joined_room', (data) => {
    console.log('Joined room:', data);
    currentRoom = data.roomName;
    updateCurrentRoom(data);
  });

  socket.on('user_joined', (data) => {
    console.log('User joined:', data.username);
    addSystemMessage(`${data.username} joined the room`);
    updateUserCount(data.userCount);
  });

  socket.on('user_left', (data) => {
    console.log('User left:', data.username);
    addSystemMessage(`${data.username} left the room`);
    updateUserCount(data.userCount);
  });

  socket.on('room_deleted', (data) => {
    console.log('Room deleted:', data.roomName);
    removeRoomFromList(data.roomName);
  });

  // ========== MESSAGE EVENTS ==========

  socket.on('message_history', (messages) => {
    console.log('Received message history:', messages.length);
    messages.forEach(msg => addMessage(msg));
  });

  socket.on('new_message', (message) => {
    console.log('New message:', message);
    addMessage(message);
  });

  socket.on('user_typing', (data) => {
    showTypingIndicator(data.username);
  });

  socket.on('user_stop_typing', () => {
    hideTypingIndicator();
  });

  // ========== ERROR EVENTS ==========

  socket.on('error', (data) => {
    console.error('Server error:', data.message);
    alert('Error: ' + data.message);
  });
}

// ============================================================================
// ROOM MANAGEMENT
// ============================================================================

/**
 * Create a new room
 */
createRoomForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const roomName = newRoomInput.value.trim();

  if (!roomName) return;

  socket.emit('create_room', { roomName });

  newRoomInput.value = '';
});

/**
 * Join a room
 */
function joinRoom(roomName) {
  console.log('Joining room:', roomName);

  // Clear messages
  messagesContainer.innerHTML = '';

  socket.emit('join_room', { roomName });
}

/**
 * Leave current room
 */
leaveRoomBtn.addEventListener('click', () => {
  if (currentRoom) {
    socket.emit('leave_room');
    currentRoom = null;
    resetRoomUI();
  }
});

// ============================================================================
// MESSAGING
// ============================================================================

/**
 * Send a message
 */
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (!text || !currentRoom) return;

  socket.emit('send_message', { text });

  messageInput.value = '';

  // Stop typing indicator
  socket.emit('stop_typing');
});

/**
 * Handle typing
 */
messageInput.addEventListener('input', () => {
  if (!currentRoom) return;

  // Emit typing event
  socket.emit('typing');

  // Clear previous timeout
  clearTimeout(typingTimeout);

  // Stop typing after 1 second of no input
  typingTimeout = setTimeout(() => {
    socket.emit('stop_typing');
  }, 1000);
});

// ============================================================================
// UI UPDATE FUNCTIONS
// ============================================================================

/**
 * Switch to chat screen
 */
function showChatScreen() {
  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  currentUsernameDisplay.textContent = currentUsername;
}

/**
 * Switch to login screen
 */
function showLoginScreen() {
  chatScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  resetRoomUI();
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus(connected) {
  if (connected) {
    connectionStatus.textContent = 'Connected';
    connectionStatus.className = 'status-badge status-connected';
  } else {
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.className = 'status-badge status-disconnected';
  }
}

/**
 * Update rooms list
 */
function updateRoomsList(rooms) {
  if (rooms.length === 0) {
    roomsList.innerHTML = '<p class="empty-state">No rooms yet. Create one!</p>';
    return;
  }

  roomsList.innerHTML = '';
  rooms.forEach(room => addRoomToList(room));
}

/**
 * Add a room to the list
 */
function addRoomToList(roomName) {
  // Check if room already exists
  const existingRoom = document.querySelector(`[data-room="${roomName}"]`);
  if (existingRoom) return;

  // Remove empty state if present
  const emptyState = roomsList.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }

  const roomElement = document.createElement('div');
  roomElement.className = 'room-item';
  roomElement.dataset.room = roomName;
  roomElement.textContent = roomName;
  roomElement.addEventListener('click', () => {
    joinRoom(roomName);
    // Update active state
    document.querySelectorAll('.room-item').forEach(r => r.classList.remove('active'));
    roomElement.classList.add('active');
  });

  roomsList.appendChild(roomElement);
}

/**
 * Remove a room from the list
 */
function removeRoomFromList(roomName) {
  const roomElement = document.querySelector(`[data-room="${roomName}"]`);
  if (roomElement) {
    roomElement.remove();
  }

  // If no rooms left, show empty state
  if (roomsList.children.length === 0) {
    roomsList.innerHTML = '<p class="empty-state">No rooms yet. Create one!</p>';
  }
}

/**
 * Update current room UI
 */
function updateCurrentRoom(data) {
  currentRoomName.textContent = `# ${data.roomName}`;
  updateUserCount(data.userCount);
  messageInput.disabled = false;
  sendBtn.disabled = false;
  messageInput.placeholder = 'Type a message...';
  leaveRoomBtn.classList.remove('hidden');

  // Clear empty state
  const emptyState = messagesContainer.querySelector('.empty-state-large');
  if (emptyState) {
    emptyState.remove();
  }
}

/**
 * Reset room UI
 */
function resetRoomUI() {
  currentRoomName.textContent = 'Select a room to start chatting';
  roomUsers.textContent = '';
  messageInput.disabled = true;
  sendBtn.disabled = true;
  messageInput.placeholder = 'Select a room to send messages...';
  leaveRoomBtn.classList.add('hidden');
  messagesContainer.innerHTML = `
    <div class="empty-state-large">
      <h3>👋 Welcome to SocketLink!</h3>
      <p>Create or join a room to start chatting</p>
    </div>
  `;

  // Remove active state from all rooms
  document.querySelectorAll('.room-item').forEach(r => r.classList.remove('active'));
}

/**
 * Update user count
 */
function updateUserCount(count) {
  roomUsers.textContent = `${count} ${count === 1 ? 'user' : 'users'} online`;
}

/**
 * Add a regular message
 */
function addMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'message';

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  messageElement.innerHTML = `
    <div class="message-bubble">
      <div class="message-header">
        <span class="message-sender">${escapeHtml(message.sender)}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-text">${escapeHtml(message.text)}</div>
    </div>
  `;

  messagesContainer.appendChild(messageElement);
  scrollToBottom();
}

/**
 * Add a system message
 */
function addSystemMessage(text) {
  const messageElement = document.createElement('div');
  messageElement.className = 'message system-message';

  messageElement.innerHTML = `
    <div class="message-bubble">${escapeHtml(text)}</div>
  `;

  messagesContainer.appendChild(messageElement);
  scrollToBottom();
}

/**
 * Show typing indicator
 */
function showTypingIndicator(username) {
  typingIndicator.querySelector('.typing-text').textContent = `${username} is typing...`;
  typingIndicator.classList.remove('hidden');
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  typingIndicator.classList.add('hidden');
}

/**
 * Scroll messages to bottom
 */
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Show error message
 */
function showError(message) {
  authError.textContent = message;
  authError.classList.add('show');
}

/**
 * Hide error message
 */
function hideError() {
  authError.classList.remove('show');
}

/**
 * Show success message
 */
function showSuccess(message) {
  authError.textContent = message;
  authError.style.background = '#d4edda';
  authError.style.border = '1px solid #c3e6cb';
  authError.style.color = '#155724';
  authError.classList.add('show');
}

/**
 * Show loading state
 */
function showLoading(message) {
  // Disable form buttons
  document.querySelectorAll('button[type="submit"]').forEach(btn => {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = message;
  });
}

/**
 * Hide loading state
 */
function hideLoading() {
  document.querySelectorAll('button[type="submit"]').forEach(btn => {
    btn.disabled = false;
    if (btn.dataset.originalText) {
      btn.textContent = btn.dataset.originalText;
      delete btn.dataset.originalText;
    }
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Check for existing session on page load
 */
window.addEventListener('load', () => {
  const savedToken = localStorage.getItem('auth_token');
  const savedUsername = localStorage.getItem('username');

  if (savedToken && savedUsername) {
    // User has a saved session
    authToken = savedToken;
    currentUsername = savedUsername;

    // Try to connect
    connectSocket();
    showChatScreen();
  }
});

/**
 * Log initial state
 */
console.log('SocketLink Client initialized');
console.log('API URL:', API_URL);
console.log('Socket URL:', SOCKET_URL);
