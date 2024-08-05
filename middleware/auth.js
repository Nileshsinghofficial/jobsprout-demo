const jwt = require('jsonwebtoken');

module.exports.ensureAuthenticated = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ error_msg: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error_msg: 'Invalid token' });
        }

        req.user = decoded; // Attach user info to request object
        next();
    });
};
