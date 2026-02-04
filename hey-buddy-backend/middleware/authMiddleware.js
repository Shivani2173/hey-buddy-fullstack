const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  //if the header starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get the token string (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      //  Decode the token to get the User ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user in DB and attach to the request
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to the Controller
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };