const express = require('express');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const flash = require('connect-flash');
const passport = require('passport'); 
const db = require('./config/db');
require('./config/passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session middleware configuration
app.use(session({
    store: new pgSession({
        pool: db.$pool, // Use the pg-promise pool
        tableName: 'session' // Table name where sessions are stored
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null;
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
app.use('/jobs', jobRoutes); // Updated route for jobs
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
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const jobsSql = 'SELECT * FROM jobs';
    db.query(jobsSql)
        .then(result => {
            res.render('profile', { user: req.session.user, jobs: result.rows });
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
    if (req.session.user) {
        res.json({ loggedIn: true, username: req.session.user.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// Admin dashboard route
app.get('/admin-dashboard', (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin-login');
    }
    res.render('admin-dashboard');
});

// Optional: Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
