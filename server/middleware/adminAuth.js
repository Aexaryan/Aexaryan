const adminAuth = (req, res, next) => {
  // Check if user is admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'دسترسی محدود - فقط مدیران مجاز هستند' });
  }
};

module.exports = adminAuth;
