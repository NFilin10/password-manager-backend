// middleware/authenticate.middleware.js

const jwt = require('jsonwebtoken');
const secret = "gdgdhdbcb770785rgdzqws";

const authenticateMiddleware = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decodedToken = jwt.verify(token, secret);
        req.user = decodedToken; // Attach the decoded user information to the request object
        next(); // Move to the next middleware or route handler
    } catch (err) {
        console.error(err.message);
        return res.status(403).json({ error: 'Forbidden' }); // Token is invalid or expired
    }
};

module.exports = authenticateMiddleware