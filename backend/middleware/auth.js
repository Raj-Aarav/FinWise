const { auth } = require('../firebase');

const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Add debug logging
    console.log('Received token:', token);
    
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = verifyAuth;