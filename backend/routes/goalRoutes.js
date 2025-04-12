const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const verifyAuth = require('../middleware/auth');

// Get all goals for a user with optional filtering
router.get('/goals', verifyAuth, async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = db.collection('goals').where('userId', '==', req.user.uid);

    if (status === 'completed') {
      query = query.where('isCompleted', '==', true);
    } else if (status === 'ongoing') {
      query = query.where('isCompleted', '==', false);
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    const goalsSnapshot = await query.get();
    const goals = [];
    
    goalsSnapshot.forEach(doc => {
      const data = doc.data();
      goals.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        deadline: data.deadline ? data.deadline.toDate().toISOString() : null
      });
    });

    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals', details: error.message });
  }
});

// Create a new goal
router.post('/goals', verifyAuth, async (req, res) => {
  try {
    console.log('Creating goal with user:', req.user);
    console.log('Goal data:', req.body);
    
    const { name, targetAmount, deadline, category, priority } = req.body;
    
    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'Name and target amount are required' });
    }

    const newGoal = {
      userId: req.user.uid,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      deadline: deadline ? new Date(deadline) : null,
      category: category || 'other',
      priority: priority || 'medium',
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('goals').add(newGoal);
    
    res.status(201).json({ 
      id: docRef.id, 
      ...newGoal,
      createdAt: newGoal.createdAt.toISOString(),
      updatedAt: newGoal.updatedAt.toISOString(),
      deadline: newGoal.deadline ? newGoal.deadline.toISOString() : null
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal', details: error.message });
  }
});

// Get goal statistics
router.get('/goals/stats', verifyAuth, async (req, res) => {
  try {
    const goalsSnapshot = await db.collection('goals')
      .where('userId', '==', req.user.uid)
      .get();

    const stats = {
      total: 0,
      completed: 0,
      ongoing: 0,
      totalTargetAmount: 0,
      totalSavedAmount: 0,
      categoryCount: {}
    };

    goalsSnapshot.forEach(doc => {
      const goal = doc.data();
      stats.total++;
      stats.totalTargetAmount += goal.targetAmount;
      stats.totalSavedAmount += goal.currentAmount;
      
      if (goal.isCompleted) {
        stats.completed++;
      } else {
        stats.ongoing++;
      }

      stats.categoryCount[goal.category] = (stats.categoryCount[goal.category] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching goal statistics:', error);
    res.status(500).json({ error: 'Failed to fetch goal statistics' });
  }
});

// Update goal progress
router.patch('/goals/:goalId', verifyAuth, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { amount } = req.body;

    const goalRef = db.collection('goals').doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goalData = goalDoc.data();
    
    // Verify user owns this goal
    if (goalData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const newAmount = goalData.currentAmount + Number(amount);
    const isCompleted = newAmount >= goalData.targetAmount;
    const updatedAt = new Date();

    await goalRef.update({
      currentAmount: newAmount,
      isCompleted,
      updatedAt
    });

    // Return updated goal with proper date formatting
    res.json({
      id: goalId,
      ...goalData,
      currentAmount: newAmount,
      isCompleted,
      updatedAt: updatedAt.toISOString(),
      createdAt: goalData.createdAt.toDate().toISOString(),
      deadline: goalData.deadline ? goalData.deadline.toDate().toISOString() : null
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal progress' });
  }
});

// Delete a goal
router.delete('/goals/:goalId', verifyAuth, async (req, res) => {
  try {
    const { goalId } = req.params;
    const goalRef = db.collection('goals').doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goalDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    await goalRef.delete();
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Add these routes to handle transactions and budgets temporarily
router.get('/transactions', verifyAuth, async (req, res) => {
  try {
    // For now, return empty array until transactions are implemented
    res.json([]);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/budgets', verifyAuth, async (req, res) => {
  try {
    // For now, return empty array until budgets are implemented
    res.json([]);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

module.exports = router;