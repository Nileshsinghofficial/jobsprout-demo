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
            return res.redirect('/login?error_msg=Invalid+username+or+password');
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.redirect('/login?error_msg=Invalid+username+or+password');
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('authToken', token, { httpOnly: true });
        res.redirect('/profile?success_msg=Successfully+logged+in');
    } catch (err) {
        console.error('Login error:', err);
        res.redirect('/login?error_msg=An+error+occurred+during+login');
    }
});

// Profile route
router.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        const jobsSql = 'SELECT * FROM jobs';
        const jobsResult = await db.query(jobsSql);
        res.render('profile', { jobs: jobsResult.rows });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.redirect('/?error_msg=Error+fetching+jobs');
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
