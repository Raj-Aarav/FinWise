const express = require('express');
const router = express.Router();
const { auth } = require('../firebase');

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    const token = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      token,
      user: {
        id: userRecord.uid,
        name: userRecord.displayName,
        email: userRecord.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userRecord = await auth.getUserByEmail(email);
    
    // Note: In a real app, you'd verify the password here
    const token = await auth.createCustomToken(userRecord.uid);

    res.json({
      token,
      user: {
        id: userRecord.uid,
        name: userRecord.displayName,
        email: userRecord.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
