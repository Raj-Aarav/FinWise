const express = require('express');
const router = express.Router();
const { db } = require('../firebase'); // Changed from '../config/firebase'
const verifyAuth = require('../middleware/auth');

router.post('/budgets', verifyAuth, async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    const userId = req.user.uid;

    const budget = {
      userId,
      category,
      amount,
      period,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('budgets').add(budget);
    res.status(201).json({ id: docRef.id, ...budget });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

router.get('/budgets', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('budgets')
      .where('userId', '==', userId)
      .get();

    const budgets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

module.exports = router;