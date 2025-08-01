const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login with test accounts support
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Test accounts
    const testAccounts = {
      'student@test.com': { password: '123456', role: 'student', name: 'Test Student' },
      'admin@test.com': { password: 'admin123', role: 'admin', name: 'Test Admin' }
    };
    
    // Check test accounts first
    if (testAccounts[email] && testAccounts[email].password === password) {
      const testUser = testAccounts[email];
      const token = jwt.sign({ id: email, role: testUser.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
      return res.json({ 
        token, 
        user: { 
          id: email, 
          name: testUser.name, 
          email: email, 
          role: testUser.role 
        } 
      });
    }
    
    // Regular database authentication
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 