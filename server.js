const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const passport = require('passport'); 
const db = require('./config/db');
require('./config/passport'); // Ensure passport configuration is correct
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize passport and flash middleware
app.use(passport.initialize());

// Flash messages middleware
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to set flash messages in response locals
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

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
        req.flash('error_msg', 'Please log in to view this resource');
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const jobsSql = 'SELECT * FROM jobs';
        const result = await db.query(jobsSql);
        res.render('profile', { user: decoded, jobs: result.rows });
    } catch (err) {
        console.error('Token verification error:', err);
        req.flash('error_msg', 'Invalid or expired token');
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
        req.flash('error_msg', 'Error fetching jobs');
        res.redirect('/');
    }
});

// API endpoint to check login status
app.get('/api/check-login', (req, res) => {
    // Handle token-based check here if needed
    res.json({ loggedIn: false });
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
