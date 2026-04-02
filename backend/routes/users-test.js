const express = require('express');
const router = express.Router();

// Test routes
router.get('/test', (req, res) => {
  res.json({ message: 'Users route is working!' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint is working!' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint is working!' });
});

module.exports = router;
