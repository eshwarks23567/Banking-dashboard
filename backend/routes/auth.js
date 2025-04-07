const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// ✅ SIGNUP ROUTE
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const [existingUser] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
      [name || 'New User', email, hashedPassword]
    );

    const userId = result.insertId;
    console.log(`🟢 Signup successful for email: ${email} | userId: ${userId}`);

    res.status(201).json({
      token: 'dummy-token',
      user: {
        userId,
        email,
        name: name || 'New User'
      }
    });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`🔐 Login attempt: ${email}`);

  try {
    const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      token: 'dummy-token',
      user: {
        userId: user.user_id,
        email: user.email,
        name: user.name
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;