const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken'); // Ensure you have the jwt library installed
const { JWT_SECRET } = process.env;
const flash = require('connect-flash');

// Use connect-flash for flash messages
router.use(flash());

// Route to render register page
router.get('/register', (req, res) => {
    res.render('register');
});

// Register route
router.post('/register', async (req, res) => {
    const { username, password, confirmPassword, checkbox } = req.body;

    if (password !== confirmPassword) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect('/register');
    }

    try {
        // Check if username already exists
        const checkUserSql = 'SELECT * FROM users WHERE username = $1';
        const checkResult = await db.query(checkUserSql, [username]);

        if (checkResult.rows.length > 0) {
            req.flash('error_msg', 'Username already taken');
            return res.redirect('/register');
        }

        // Hash the password and insert the new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password, checkbox) VALUES ($1, $2, $3)';
        await db.query(sql, [username, hashedPassword, checkbox ? 1 : 0]);

        req.flash('success_msg', 'Successfully registered');
        res.redirect('/login');
    } catch (err) {
        console.error('Registration error:', err);
        req.flash('error_msg', 'An error occurred during registration');
        res.redirect('/register');
    }
});

// Route to render login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = 'SELECT * FROM users WHERE username = $1';
        const result = await db.query(sql, [username]);

        if (result.rows.length === 0) {
            req.flash('error_msg', 'Invalid username or password');
            return res.redirect('/login');
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            req.flash('error_msg', 'Invalid username or password');
            return res.redirect('/login');
        }

        // Generate a token
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token }); // Send token to client
    } catch (err) {
        console.error('Login error:', err);
        req.flash('error_msg', 'An error occurred during login');
        res.redirect('/login');
    }
});

// Logout route
router.post('/logout', (req, res) => {
    // For token-based systems, logout is handled on the client-side (remove token)
    req.flash('success_msg', 'Logged out successfully');
    res.redirect('/login');
});

// Route to render profile page
router.get('/profile', async (req, res) => {
    try {
        const jobsSql = 'SELECT * FROM jobs';
        const jobsResult = await db.query(jobsSql);
        res.render('profile', { user: req.session.user, jobs: jobsResult.rows });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        req.flash('error_msg', 'Error fetching jobs');
        res.redirect('/'); // Redirect to home or another route
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            req.flash('error_msg', 'Error logging out');
            return res.redirect('/login'); // Redirect to login page on error
        }
        res.redirect('/'); // Redirect to home or login page
    });
});

module.exports = router;
