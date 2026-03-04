const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Mock Database
const db = {
    users: {},
    levelConfig: {
        1: { slots: 3 },
        2: { slots: 4 },
        3: { slots: 5 },
        4: { slots: 5 },
        5: { slots: 6 },
        6: { slots: 6 },
        7: { slots: 7 }
    }
};

// User subscription endpoint
app.post('/api/subscribe', csrfProtection, authenticateUser, async (req, res) => {
    const userId = req.user.id;
    const paymentVerified = await verifyPayment(req.body.paymentId);
    
    if (!paymentVerified) {
        return res.status(400).json({ error: 'Payment verification failed' });
    }
    
    // Set user subscription status in the database
    db.users[userId].subscriptionStatus = true;
    db.users[userId].dailyLimit = Infinity; // Unlimited access for paid users

    res.json({ success: true });
});

// Middleware to authenticate user
function authenticateUser(req, res, next) {
    // Example user authentication logic
    if (req.session.user) {
        req.user = db.users[req.session.user.id];
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Example payment verification function
async function verifyPayment(paymentId) {
    // Simulate payment verification logic
    return paymentId === 'valid_payment_id';
}

// Level configuration endpoint
app.get('/api/level-config/:level', async (req, res) => {
    const level = parseInt(req.params.level);
    const config = db.levelConfig[level];
    if (!config) {
        return res.status(404).json({ error: 'Level not found' });
    }
    res.json(config);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});