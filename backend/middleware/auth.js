const { auth } = require('../firebase');

const verifyAuth = async (req, res, next) => {
  // Temporarily skip token verification
  next();
};

module.exports = verifyAuth;