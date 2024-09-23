const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = process.env;

const auth = (role,  requireSecretKey = false) => {
  return async (req, res, next) => {
    const token =req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: 'no token' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded.user;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(401).json({ msg: 'plz login first' });
      }

      if (role && user.role !== role) {
        return res.status(403).json({ msg: 'Access denied' });
      }

      if (requireSecretKey) {
        const { secretKey } = req.body;
        if (!secretKey && secretKey !== process.env.JWT_SECRET) {
          return res.status(401).json({ msg: 'Invalid or missing secret key' });
        }
      }

      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
};

module.exports = auth;
