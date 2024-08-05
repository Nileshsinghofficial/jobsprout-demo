const express = require('express');
const path = require('path');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const db = require('./config/db');
require('./config/passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize passport middleware
app.use(passport.initialize());

// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/user');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/jobs', jobRoutes);
app.use('/user', userRoutes);

// Serve home.html from the public folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});


// Admin login route
app.get('/admin-login', (req, res) => {
    res.render('admin-login');
});

// Register route
app.get('/register', (req, res) => {
    res.render('register');
});

// Login route
app.get('/login', (req, res) => {
    res.render('login');
});

// Profile route
app.get('/profile', async (req, res) => {
    try {
        const jobsSql = 'SELECT * FROM jobs';
        const jobsResult = await db.query(jobsSql);
        res.render('profile', { jobs: jobsResult.rows });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.redirect('/?error_msg=Error+fetching+jobs');
    }
});

// View jobs route
app.get('/jobs', async (req, res) => {
    try {
        const sql = 'SELECT * FROM jobs';
        const jobsResult = await db.query(sql);
        res.render('jobs', { jobs: jobsResult.rows });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.redirect('/?error_msg=Error+fetching+jobs');
    }
});

// API endpoint to check login status
// app.get('/api/check-login', (req, res) => {
//     // Update logic based on JWT or other authentication mechanism
//     res.json({ loggedIn: false });
// });

// Admin dashboard route
app.get('/admin-dashboard', (req, res) => {
    res.render('admin-dashboard');
});

// Optional: Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
