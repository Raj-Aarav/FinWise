const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const verifyAuth = require('../middleware/auth');

router.post('/profile', verifyAuth, async (req, res) => {
  try {
    const { uid, monthlyIncome, riskTolerance, goals, onboardingCompleted } = req.body;

    // Create user profile document in Firestore
    await db.collection('users').doc(uid).set({
      monthlyIncome,
      riskTolerance,
      goals,
      onboardingCompleted,
      updatedAt: new Date().toISOString()
    }, { merge: true }); // merge: true will update existing fields and add new ones

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;