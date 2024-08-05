// middleware/auth.js

module.exports.ensureAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/login');
    }
};
