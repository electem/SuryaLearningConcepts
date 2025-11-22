const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this';
const JWT_EXPIRES_IN = '7d';

router.post('/login', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password || !role)
      return res.status(400).json({ error: 'Email, password & role required' });

    let user = await User.findOne({ email });

    // If user doesn't exist, register automatically
    if (!user) {
      user = new User({
        name: name || email.split('@')[0], // use name if provided, else email prefix
        email,
        password,
        role: role.toLowerCase() === 'admin' ? 'admin' : 'user'
      });
      await user.save();
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Role from frontend dropdown (can override for demo)
    const finalRole = role.toLowerCase() === 'admin' ? 'admin' : 'user';

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: finalRole }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      token,
      role: finalRole,
      user: { id: user._id, email: user.email, role: finalRole, name: user.name }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
