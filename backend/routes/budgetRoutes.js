const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const verifyAuth = require('../middleware/auth');

// Create budget
router.post('/budgets', verifyAuth, async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    const budget = {
      userId: req.user.uid,
      category,
      amount: parseFloat(amount),
      period,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('budgets').add(budget);
    res.status(201).json({ id: docRef.id, ...budget });
  } catch (error) {
    console.error('Budget creation error:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Get budgets
router.get('/budgets', verifyAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('budgets')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const budgets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    }));

    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

module.exports = router;