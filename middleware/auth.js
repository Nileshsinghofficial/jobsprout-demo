const jwt = require('jsonwebtoken'); // Ensure you have the jwt library installed
const { JWT_SECRET } = process.env;

module.exports.ensureAuthenticated = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        req.flash('error_msg', 'Please log in to view this resource');
        return res.redirect('/login');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            req.flash('error_msg', 'Invalid or expired token');
            return res.redirect('/login');
        }

        req.user = decoded; // Attach decoded user data to request
        next();
    });
};
