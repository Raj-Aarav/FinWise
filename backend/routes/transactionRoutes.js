const express = require('express');
const router = express.Router();
const { db } = require('../firebase'); // Changed from '../config/firebase'
const verifyAuth = require('../middleware/auth');

router.post('/transactions', verifyAuth, async (req, res) => {
  try {
    const { amount, description, category, isIncome, isRecurring, recurringFrequency, date } = req.body;
    const userId = req.user.uid;

    const transaction = {
      userId,
      amount,
      description,
      category,
      isIncome,
      isRecurring,
      recurringFrequency,
      date: new Date(date),
      createdAt: new Date()
    };

    const docRef = await db.collection('transactions').add(transaction);
    res.status(201).json({ id: docRef.id, ...transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.get('/transactions', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('transactions')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .get();

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate()
    }));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;