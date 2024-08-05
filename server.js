const express = require('express');
const path = require('path');
const passport = require('passport');
const db = require('./config/db');
require('./config/passport');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize passport middleware
app.use(passport.initialize());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Registering routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/user');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/jobs', jobRoutes);
app.use('/user', userRoutes);

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

// Profile route - Update to use token-based authentication
app.get('/profile', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        res.redirect('/login');
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const jobsSql = 'SELECT * FROM jobs';
        const result = await db.query(jobsSql);
        res.render('profile', { user: decoded, jobs: result.rows });
    } catch (err) {
        console.error('Token verification error:', err);
        res.redirect('/login');
    }
});

// View jobs route
app.get('/jobs', async (req, res) => {
    try {
        const sql = 'SELECT * FROM jobs';
        const result = await db.query(sql);
        res.render('jobs', { jobs: result.rows });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.redirect('/');
    }
});

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
