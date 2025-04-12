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

// Get all transactions
router.get('/transactions', verifyAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('transactions')
      .where('userId', '==', req.user.uid)
      .orderBy('date', 'desc')
      .get();

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString()
    }));
    
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

router.delete('/transactions/:id', verifyAuth, async (req, res) => {
  try {
    await db.collection('transactions').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;