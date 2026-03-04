# Code Review & Security Audit (Iteration 2)

Reviewed: 2026-03-04 15:29
---

# Code Review Report (Re-review - Iteration 2)

## Security Audit

### [CRITICAL_SECURITY] Incomplete CSRF Protection Implementation
- **File**: app.js
- **Line**: 105-120
- **Vulnerability**: Cross-Site Request Forgery (CSRF) (CWE-352)
- **Description**: The CSRF token retrieval function `getCsrfToken()` references a meta tag that doesn't exist in the HTML. The server sets CSRF tokens via cookies, but the frontend doesn't properly retrieve or send them. Additionally, the server middleware applies CSRF protection to ALL routes, including GET requests, which is incorrect.
- **Fix**: Properly implement CSRF token exchange and only protect state-changing endpoints.

```javascript
// server.js - Fix CSRF middleware application
// Only apply CSRF protection to state-changing endpoints, not all routes
app.use(csrfProtection); // This should be removed from global middleware

// Apply CSRF protection only to specific endpoints
app.post('/api/subscribe', csrfProtection, authenticateUser, async (req, res) => {
    // CSRF token automatically validated
    // ... subscription logic
});

// Add endpoint to get CSRF token
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});
```

```javascript
// app.js - Fix CSRF token handling
async function getCsrfToken() {
    try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error('Failed to get CSRF token:', error);
        return null;
    }
}

async function subscribe() {
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
        alert('보안 토큰을 가져오는데 실패했습니다. 페이지를 새로고침 해주세요.');
        return;
    }
    
    const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ paymentId: 'valid_payment_id' })
    });
    // ... rest of the code
}
```

### [CRITICAL_SECURITY] Insecure Session Configuration
- **File**: server.js
- **Line**: 10
- **Vulnerability**: Session Fixation (CWE-384)
- **Description**: Session configuration uses a hardcoded secret and doesn't set secure flags for production. The session cookie lacks `httpOnly`, `secure`, and `sameSite` attributes.
- **Fix**: Use environment variables for secrets and configure secure session cookies.

```javascript
// server.js - Secure session configuration
const session = require('express-session');
const RedisStore = require('connect-redis')(session); // For production

app.use(session({
    store: process.env.NODE_ENV === 'production' ? new RedisStore({
        client: redisClient,
        prefix: 'session:'
    }) : null,
    secret: process.env.SESSION_SECRET || 'development-secret-change-in-production',
    resave: false,
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        httpOnly: true, // Prevent client-side JavaScript access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // Prevent CSRF
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
```

### [CRITICAL_SECURITY] Missing Authentication for Critical Endpoints
- **File**: server.js
- **Line**: 35-45
- **Vulnerability**: Missing Authentication for Critical Function (CWE-306)
- **Description**: The `/api/level-config/:level` endpoint doesn't require authentication, allowing anyone to access level configurations. The `/api/evaluate-path` endpoint referenced in app.js doesn't exist in server.js.
- **Fix**: Add authentication middleware to all endpoints that should be user-specific.

```javascript
// server.js - Add authentication to all user-specific endpoints
app.get('/api/level-config/:level', authenticateUser, async (req, res) => {
    const level = parseInt(req.params.level);
    const config = db.levelConfig[level];
    if (!config) {
        return res.status(404).json({ error: 'Level not found' });
    }
    res.json(config);
});

// Add missing evaluate-path endpoint
app.post('/api/evaluate-path', authenticateUser, async (req, res) => {
    const { path, userId } = req.body;
    
    // Validate input
    if (!Array.isArray(path) || path.length === 0) {
        return res.status(400).json({ error: 'Invalid path format' });
    }
    
    // Implement actual logic evaluation (simplified for example)
    const connectionStrength = evaluateLogicPath(path);
    
    res.json({ 
        success: true, 
        connectionStrength,
        feedback: generateFeedback(path, connectionStrength)
    });
});

function evaluateLogicPath(path) {
    // Simplified evaluation - implement actual logic per PRD
    return Math.random(); // Replace with actual logic evaluation
}
```

### [CRITICAL_SECURITY] Client-Side State Still Manipulable
- **File**: app.js
- **Line**: 1-10
- **Vulnerability**: Insecure Client-Side Storage (CWE-602)
- **Description**: While server-side checks were added, the client-side `user` object still contains critical state (`dailyLimit`, `problemsSolvedToday`, `subscriptionStatus`) that users can manipulate. The app.js still uses this local state for decisions.
- **Fix**: Remove all critical state from client-side and fetch from server on each action.

```javascript
// app.js - Remove client-side user state
let user = null; // Will be fetched from server

async function getUserState() {
    try {
        const response = await fetch('/api/user-state');
        if (!response.ok) throw new Error('Failed to fetch user state');
        user = await response.json();
        updateUI();
    } catch (error) {
        console.error('Failed to get user state:', error);
        // Handle error - redirect to login or show message
    }
}

async function checkDailyLimit() {
    const response = await fetch('/api/check-daily-limit');
    const data = await response.json();
    
    if (data.limitReached) {
        displayRewardOptions();
        return false;
    }
    return true;
}

// Update submitPath function
async function submitPath() {
    // Check daily limit from server
    const canProceed = await checkDailyLimit();
    if (!canProceed) return;
    
    // ... rest of submission logic
}
```

## Code Quality

### [CRITICAL] Missing Server-Side Endpoints
- **File**: server.js
- **Line**: Entire file
- **Issue**: The server.js file is missing critical endpoints referenced in app.js (`/api/evaluate-path`, `/api/user-state`, `/api/check-daily-limit`). This will cause runtime errors.
- **Suggestion**: Implement all referenced endpoints with proper authentication and validation.

```javascript
// server.js - Add missing endpoints
app.get('/api/user-state', authenticateUser, (req, res) => {
    const user = db.users[req.user.id];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
        type: user.subscriptionStatus ? 'paid' : 'free',
        dailyLimit: user.subscriptionStatus ? Infinity : 5,
        problemsSolvedToday: user.problemsSolvedToday || 0,
        level: user.level || 1,
        hints: user.hints || 0,
        subscriptionStatus: user.subscriptionStatus || false
    });
});

app.get('/api/check-daily-limit', authenticateUser, (req, res) => {
    const user = db.users[req.user.id];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const limitReached = !user.subscriptionStatus && 
                        user.problemsSolvedToday >= 5;
    
    res.json({ limitReached });
});

app.post('/api/increment-problem-count', authenticateUser, (req, res) => {
    const user = db.users[req.user.id];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    user.problemsSolvedToday = (user.problemsSolvedToday || 0) + 1;
    res.json({ success: true, count: user.problemsSolvedToday });
});
```

### [MAJOR] Incomplete Authentication Implementation
- **File**: server.js
- **Line**: 28-35
- **Issue**: The `authenticateUser` middleware references `req.session.user` but there's no login/signup endpoint to set the session. The mock database doesn't support user creation.
- **Suggestion**: Implement complete authentication flow with registration, login, and session management.

```javascript
// server.js - Add authentication endpoints
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { email, password, nickname } = req.body;
    
    // Validate input
    if (!email || !password || !nickname) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user exists
    if (db.users[email]) {
        return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userId = uuidv4();
    db.users[userId] = {
        id: userId,
        email,
        password: hashedPassword,
        nickname,
        subscriptionStatus: false,
        dailyLimit: 5,
        problemsSolvedToday: 0,
        level: 1,
        hints: 0,
        createdAt: new Date().toISOString()
    };
    
    // Set session
    req.session.user = { id: userId, email };
    
    res.json({ success: true, userId });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Find user
    const user = Object.values(db.users).find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Set session
    req.session.user = { id: user.id, email: user.email };
    
    res.json({ success: true, user: { id: user.id, nickname: user.nickname } });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});
```

### [MAJOR] Hardcoded Payment Verification
- **File**: server.js
- **Line**: 47
- **Vulnerability**: Hardcoded Secrets (CWE-798)
- **Description**: The `verifyPayment` function uses a hardcoded payment ID check, which is insecure and doesn't integrate with actual payment providers.
- **Fix**: Integrate with actual payment provider API and use environment variables for API keys.

```javascript
// server.js - Proper payment verification
const axios = require('axios');

async function verifyPayment(paymentId) {
    try {
        // Example with Toss Payments (Korean payment provider)
        const response = await axios.post(
            'https://api.tosspayments.com/v1/payments/confirm',
            {
                paymentKey: paymentId,
                amount: 9900,
                orderId: `order_${Date.now()}`
            },
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64')}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data.status === 'DONE';
    } catch (error) {
        console.error('Payment verification failed:', error);
        return false;
    }
}
```

### [MINOR] Missing Input Validation for Level Parameter
- **File**: server.js
- **Line**: 35-45
- **Issue**: The level parameter is parsed as integer but not validated for range (1-7 as per PRD).
- **Suggestion**: Add proper validation for all input parameters.

```javascript
app.get('/api/level-config/:level', authenticateUser, async (req, res) => {
    const level = parseInt(req.params.level);
    
    // Validate level range
    if (isNaN(level) || level < 1 || level > 7) {
        return res.status(400).json({ error: 'Level must be between 1 and 7' });
    }
    
    const config = db.levelConfig[level];
    if (!config) {
        return res.status(404).json({ error: 'Level configuration not found' });
    }
    
    res.json(config);
});
```

## Performance Review

### [MAJOR] Inefficient Database Mock Structure
- **File**: server.js
- **Line**: 12-20
- **Issue**: The mock database uses object with user IDs as keys, but finding users by email requires `Object.values().find()`, which is O(n) inefficient.
- **Suggestion**: Maintain separate indexes or use proper database structure.

```javascript
// Improved mock database structure
const db = {
    users: {}, // userId -> user object
    usersByEmail: {}, // email -> userId (index)
    levelConfig: {
        1: { slots: 3, hintType: 'direct', requiredAccuracy: 0.8 },
        2: { slots: 4, hintType: 'direct', requiredAccuracy: 0.8 },
        // ... other levels
    }
};

// Faster email lookup
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    const userId = db.usersByEmail[email];
    if (!userId) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = db.users[userId];
    // ... rest of login logic
});
```

## Refactoring Suggestions

### Implement Proper Error Handling Middleware
Current error handling is inconsistent. Add centralized error handling:

```javascript
// server.js - Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    
    // Default error
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});
```

### Extract Configuration to Separate Files
Move configuration to environment variables and config files:

```javascript
// config.js
module.exports = {
    session: {
        secret: process.env.SESSION_SECRET,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        }
    },
    payment: {
        toss: {
            secretKey: process.env.TOSS_SECRET_KEY,
            apiUrl: 'https://api.tosspayments.com/v1'
        }
    },
    limits: {
        freeDailyProblems: 5,
        maxLevel: 7,
        levelUpAccuracy: 0.8,
        levelUpConsecutiveSessions: 3
    }
};
```

## Summary

### Security: CRITICAL_ISSUES
- **Critical security vulnerabilities still exist** despite attempted fixes
- CSRF protection is incorrectly implemented and incomplete
- Session configuration remains insecure
- Critical endpoints lack proper authentication
- Client-side state manipulation is still possible

### Quality Score: 4/10 (Improved from 3/10)
- Some security improvements were attempted
- Server-side architecture started but incomplete
- Core authentication flow missing
- Payment integration not implemented

### Issue Count
- Critical Security Issues: 4 (3 in previous review, still critical)
- Critical Issues: 1
- Major Issues: 3
- Minor Issues: 1

### Top 3 Priorities for Improvement
1. **Complete the authentication system** - Implement registration, login, and proper session management
2. **Fix CSRF protection** - Properly implement token exchange and protect only state-changing endpoints
3. **Remove all critical state from client-side** - Fetch user state from server on every action

### Verdict on Security Fixes
The revised code attempted to address security issues but introduced new problems while leaving critical vulnerabilities unresolved:

**✅ Partially Fixed:**
- Server-side state management started (but incomplete)
- CSRF tokens mentioned (but incorrectly implemented)

**❌ Still Critical:**
- Incomplete CSRF implementation creates false sense of security
- Session configuration remains insecure
- Missing authentication for critical endpoints
- Client-side state still manipulable

**⚠️ New Issues Introduced:**
- Missing server endpoints cause runtime errors
- Hardcoded payment verification
- Inefficient database structure

The code is **NOT production-ready**. Critical security issues must be fully resolved before any deployment consideration.