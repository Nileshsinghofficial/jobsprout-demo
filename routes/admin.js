const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { ensureAuthenticated } = require('../middleware/auth');

// Route to render admin registration page
router.get('/admin-register', (req, res) => {
    res.render('admin-register');
});

// Admin registration route
router.post('/admin-register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if username already exists
        const checkAdminSql = 'SELECT * FROM admins WHERE username = $1';
        const checkResult = await db.query(checkAdminSql, [username]);

        if (checkResult.rows.length > 0) {
            req.flash('error_msg', 'Username already exists');
            return res.redirect('/admin/admin-register');
        }

        // If username is available, hash the password and insert the new admin
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO admins (username, password) VALUES ($1, $2)';
        db.query(sql, [username, hashedPassword]);

        req.flash('success_msg', 'Successfully registered');
        res.redirect('/admin/admin-login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred during registration');
        res.redirect('/admin/admin-register');
    }
});

// Route to render admin login page
router.get('/admin-login', (req, res) => {
    res.render('admin-login');
});

// Admin login route
router.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = 'SELECT * FROM admins WHERE username = $1';
        const result = await db.query(sql, [username]);

        if (result.rows.length === 0) {
            req.flash('error_msg', 'Invalid username or password');
            return res.redirect('/admin/admin-login');
        }

        const admin = result.rows[0];
        const match = await bcrypt.compare(password, admin.password);

        if (!match) {
            req.flash('error_msg', 'Invalid username or password');
            return res.redirect('/admin/admin-login');
        }

        req.session.admin = admin;
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Database query error:', err);
        req.flash('error_msg', 'An error occurred');
        res.redirect('/admin/admin-login');
    }
});

// Admin dashboard route
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const sql = 'SELECT * FROM jobs';
        const result = await db.query(sql);
        res.render('admin-dashboard', { jobs: result.rows });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        req.flash('error_msg', 'Error fetching jobs');
        res.redirect('/admin/dashboard');
    }
});

// Add Job route
router.post('/add-job', ensureAuthenticated, async (req, res) => {
    const { title, description, author } = req.body;
    try {
        const sql = 'INSERT INTO jobs (title, description, author) VALUES ($1, $2, $3)';
        await db.query(sql, [title, description, author]);
        req.flash('success_msg', 'Job added successfully');
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Error adding job:', err);
        req.flash('error_msg', 'Error adding job');
        res.redirect('/admin/dashboard');
    }
});

// Edit Job route
router.get('/edit-job/:id', ensureAuthenticated, async (req, res) => {
    const jobId = req.params.id;
    try {
        const sql = 'SELECT * FROM jobs WHERE id = $1';
        const result = await db.query(sql, [jobId]);
        const job = result.rows[0];
        res.render('edit-job', { job });
    } catch (err) {
        console.error('Error fetching job:', err);
        req.flash('error_msg', 'Error fetching job details');
        res.redirect('/admin/dashboard');
    }
});

router.post('/edit-job/:id', ensureAuthenticated, async (req, res) => {
    const jobId = req.params.id;
    const { title, description, author } = req.body;
    try {
        const sql = 'UPDATE jobs SET title = $1, description = $2, author = $3 WHERE id = $4';
        await db.query(sql, [title, description, author, jobId]);
        req.flash('success_msg', 'Job edited successfully');
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Error editing job:', err);
        req.flash('error_msg', 'Error editing job');
        res.redirect('/admin/dashboard');
    }
});

// Delete Job route
router.post('/delete-job/:id', ensureAuthenticated, async (req, res) => {
    const jobId = req.params.id;
    try {
        const sql = 'DELETE FROM jobs WHERE id = $1';
        await db.query(sql, [jobId]);
        req.flash('success_msg', 'Job deleted successfully');
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Error deleting job:', err);
        req.flash('error_msg', 'Error deleting job');
        res.redirect('/admin/dashboard');
    }
});

// Admin logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            req.flash('error_msg', 'Error logging out');
            return res.redirect('/admin/dashboard');
        }
        res.redirect('/');
    });
});

module.exports = router;
