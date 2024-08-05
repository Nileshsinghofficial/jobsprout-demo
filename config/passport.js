const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');

// Configure Passport.js
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, (username, password, done) => {
    // Fetch user from database
    db.query('SELECT * FROM users WHERE username = $1', [username])
        .then(result => {
            const user = result.rows[0];
            if (!user || !user.password === password) {
                return done(null, false, { message: 'Incorrect username or password.' });
            }
            return done(null, user);
        })
        .catch(err => done(err));
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM users WHERE id = $1', [id])
        .then(result => done(null, result.rows[0]))
        .catch(err => done(err));
});
