module.exports = function (req, res, next) {
  if (req.userId && req.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};
