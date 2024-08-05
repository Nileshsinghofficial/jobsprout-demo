const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const passport = require('passport'); 
const db = require('./config/db');
require('./config/passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize passport and flash middleware
app.use(passport.initialize());
app.use(passport.session());

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

// Profile route
app.get('/profile', (req, res) => {
    const jobsSql = 'SELECT * FROM jobs';
    db.query(jobsSql)
        .then(result => {
            res.render('profile', { jobs: result.rows });
        })
        .catch(err => {
            req.flash('error_msg', 'Error fetching jobs');
            res.redirect('/profile');
        });
});

// View jobs route
app.get('/jobs', (req, res) => {
    const sql = 'SELECT * FROM jobs';
    db.query(sql)
        .then(result => {
            res.render('jobs', { jobs: result.rows });
        })
        .catch(err => {
            req.flash('error_msg', 'Error fetching jobs');
            res.redirect('/');
        });
});

// API endpoint to check login status
app.get('/api/check-login', (req, res) => {
    // Since session management is removed, this is not needed
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
