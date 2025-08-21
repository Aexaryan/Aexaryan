const mongoose = require('mongoose');

const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'سرویس پایگاه داده در دسترس نیست',
      details: 'Database service is not available. Please try again later or contact support.'
    });
  }
  next();
};

module.exports = checkDB;