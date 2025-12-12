/**
 * AUTH CONTROLLER
 *
 * Handles user registration and login
 *
 * WHAT IS A CONTROLLER?
 * - Contains business logic
 * - Processes requests
 * - Sends responses
 * - Separated from routes (clean code principle)
 *
 * Think of it as the "brain" of your API:
 * - Route says: "Someone wants to register"
 * - Controller says: "Here's how we handle registration"
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================================================
// IN-MEMORY USER STORAGE
// ============================================================================

/**
 * WHY IN-MEMORY STORAGE?
 *
 * For learning and simplicity, we use a JavaScript Map.
 *
 * In PRODUCTION, you'd use a database:
 * - MongoDB (NoSQL)
 * - PostgreSQL (SQL)
 * - MySQL (SQL)
 *
 * Map<username, userObject>
 * Example: users.get('alice') → { userId: '123', username: 'alice', ... }
 */

const users = new Map();

// Helper: Generate unique user ID
function generateUserId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================================================
// REGISTER CONTROLLER
// ============================================================================

/**
 * REGISTRATION FLOW:
 *
 * 1. Client sends: { username, password }
 * 2. Validate input (length, format)
 * 3. Check if username already exists
 * 4. Hash password (NEVER store plain text)
 * 5. Save user to storage
 * 6. Return success response
 */

exports.register = async (req, res) => {
  try {
    // STEP 1: Extract data from request body
    const { username, password } = req.body;

    console.log(`📝 Registration attempt: ${username}`);

    // ========================================================================
    // STEP 2: INPUT VALIDATION
    // ========================================================================

    /**
     * WHY VALIDATE?
     *
     * - Prevent invalid data in database
     * - Give clear error messages to users
     * - Security (prevent injection attacks)
     */

    // Check if fields are provided
    if (!username || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Username and password are required',
        fields: {
          username: !username ? 'Username is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Validate username length
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Username must be between 3 and 20 characters'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate username format (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }

    // ========================================================================
    // STEP 3: CHECK IF USER ALREADY EXISTS
    // ========================================================================

    if (users.has(username)) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Username already exists'
      });
    }

    // ========================================================================
    // STEP 4: HASH PASSWORD
    // ========================================================================

    /**
     * PASSWORD HASHING WITH BCRYPT
     *
     * WHY hash passwords?
     * - Security: If database is breached, passwords are not exposed
     * - One-way: Cannot convert hash back to original password
     *
     * HOW bcrypt works:
     * 1. Generate random "salt" (random data)
     * 2. Combine password + salt
     * 3. Apply hashing algorithm multiple times (cost factor)
     * 4. Result: Unique hash for each user (even with same password)
     *
     * Example:
     * Password: "hello123"
     * Salt: "random12345"
     * Hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68..."
     *
     * Cost factor (10):
     * - Higher = More secure but slower
     * - Lower = Faster but less secure
     * - 10 is a good balance (~150ms on modern CPU)
     */

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log(`🔒 Password hashed for: ${username}`);

    // ========================================================================
    // STEP 5: CREATE USER OBJECT
    // ========================================================================

    const userId = generateUserId();
    const user = {
      userId,
      username,
      password: hashedPassword, // Store hashed password, NOT plain text
      createdAt: new Date().toISOString()
    };

    // Save to storage
    users.set(username, user);

    console.log(`✅ User registered: ${username} (ID: ${userId})`);

    // ========================================================================
    // STEP 6: SEND SUCCESS RESPONSE
    // ========================================================================

    /**
     * HTTP STATUS CODE: 201 Created
     * - Means: Resource successfully created
     * - Alternative: 200 OK (but 201 is more precise)
     */

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        userId: user.userId,
        username: user.username,
        createdAt: user.createdAt
        // Note: We DON'T return the password (even hashed)
      }
    });

  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    console.error('❌ Registration error:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: 'Registration failed. Please try again later.'
    });
  }
};

// ============================================================================
// LOGIN CONTROLLER
// ============================================================================

/**
 * LOGIN FLOW:
 *
 * 1. Client sends: { username, password }
 * 2. Validate input
 * 3. Check if user exists
 * 4. Compare password hash
 * 5. Generate JWT token
 * 6. Return token to client
 */

exports.login = async (req, res) => {
  try {
    // STEP 1: Extract credentials
    const { username, password } = req.body;

    console.log(`🔑 Login attempt: ${username}`);

    // ========================================================================
    // STEP 2: INPUT VALIDATION
    // ========================================================================

    if (!username || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Username and password are required'
      });
    }

    // ========================================================================
    // STEP 3: CHECK IF USER EXISTS
    // ========================================================================

    const user = users.get(username);

    if (!user) {
      // Security note: Don't reveal whether username exists
      // Instead, give generic "invalid credentials" message
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    // ========================================================================
    // STEP 4: VERIFY PASSWORD
    // ========================================================================

    /**
     * PASSWORD VERIFICATION
     *
     * We can't "decrypt" the hash to compare.
     * Instead, bcrypt:
     * 1. Takes the provided password
     * 2. Hashes it with the SAME salt (stored in hash)
     * 3. Compares the two hashes
     * 4. Returns true/false
     *
     * Example:
     * Stored hash: "$2a$10$abc...xyz"
     * User enters: "hello123"
     * bcrypt.compare() extracts salt from hash, hashes "hello123"
     * Compares: New hash === Stored hash? → true/false
     */

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${username}`);

      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    // ========================================================================
    // STEP 5: GENERATE JWT TOKEN
    // ========================================================================

    /**
     * JWT TOKEN GENERATION
     *
     * Token contains:
     * - Payload: User data (userId, username)
     * - Expiration: When token becomes invalid
     * - Signature: Cryptographic proof of authenticity
     *
     * Why JWT?
     * - Stateless: Server doesn't store sessions
     * - Scalable: Any server can verify token
     * - Self-contained: Token has all needed info
     *
     * Security:
     * - Signed with SECRET key (only we know)
     * - If anyone changes payload, signature won't match
     * - Expires after 24 hours (security best practice)
     */

    const token = jwt.sign(
      // Payload (data to store in token)
      {
        userId: user.userId,
        username: user.username
      },
      // Secret key (must match in verification)
      process.env.JWT_SECRET,
      // Options
      {
        expiresIn: '24h' // Token valid for 24 hours
      }
    );

    console.log(`✅ Login successful: ${username}`);

    // ========================================================================
    // STEP 6: SEND SUCCESS RESPONSE
    // ========================================================================

    /**
     * HTTP STATUS CODE: 200 OK
     * - Means: Request successful
     *
     * Response includes:
     * - Token: Client must store this (localStorage or cookie)
     * - User info: For client to display user details
     */

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token, // Client must include this in future requests
      user: {
        userId: user.userId,
        username: user.username,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    console.error('❌ Login error:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: 'Login failed. Please try again later.'
    });
  }
};

// ============================================================================
// HELPER: GET ALL USERS (For debugging only)
// ============================================================================

/**
 * ⚠️ WARNING: Never expose this in production!
 *
 * This is only for learning/debugging.
 * It shows all registered users (without passwords).
 */

exports.getAllUsers = (req, res) => {
  const allUsers = Array.from(users.values()).map(user => ({
    userId: user.userId,
    username: user.username,
    createdAt: user.createdAt
    // Password is excluded for security
  }));

  res.json({
    count: allUsers.length,
    users: allUsers
  });
};
