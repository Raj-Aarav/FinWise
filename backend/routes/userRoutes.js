// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const verifyAuth = require('../middleware/auth');

// Add verifyAuth middleware to protected routes
router.post('/profile', verifyAuth, async (req, res) => {
  const { uid, monthlyIncome, riskTolerance, goals, onboardingCompleted } = req.body;
  try {
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await db.collection('users').doc(uid).set({
      monthlyIncome: parseFloat(monthlyIncome),
      riskTolerance,
      goals,
      onboardingCompleted,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({ message: 'Profile saved successfully' });
  } catch (err) {
    console.error('Profile creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add new expense
router.post('/expense', verifyAuth, async (req, res) => {
  const { uid, category, amount, date } = req.body;
  try {
    await db.collection('users').doc(uid).collection('expenses').add({
      category, amount, date
    });
    res.status(201).send('Expense added');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get all expenses
router.get('/expenses/:uid', verifyAuth, async (req, res) => {
  const { uid } = req.params;
  try {
    const snapshot = await db.collection('users').doc(uid).collection('expenses').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get user profile with all data
router.get('/profile/:uid', verifyAuth, async (req, res) => {
  const { uid } = req.params;
  try {
    const userProfile = await db.collection('users').doc(uid).get();
    if (!userProfile.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get expenses for budget calculation
    const expensesSnapshot = await db.collection('users').doc(uid).collection('expenses')
      .orderBy('date', 'desc')
      .get();

    const expenses = expensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate budget summary
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categories = {};
    
    expenses.forEach(exp => {
      if (!categories[exp.category]) {
        categories[exp.category] = { spent: 0, limit: 1000 }; // Default limit
      }
      categories[exp.category].spent += exp.amount;
    });

    const budgetSummary = {
      totalSpent,
      totalIncome: userProfile.data()?.monthlyIncome || 0,
      categories: Object.entries(categories).map(([category, data]) => ({
        category,
        spent: data.spent,
        limit: data.limit
      }))
    };

    res.status(200).json({
      ...userProfile.data(),
      expenses,
      budgetSummary,
      savingsGoals: [],
      aiTips: []
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/profile/:uid', verifyAuth, async (req, res) => {
  const { uid } = req.params;
  const updateData = req.body;
  try {
    await db.collection('users').doc(uid).update(updateData);
    const updatedProfile = await db.collection('users').doc(uid).get();
    res.status(200).json(updatedProfile.data());
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
