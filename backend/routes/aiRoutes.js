const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const verifyAuth = require('../middleware/auth');

// Get AI tips for user
router.get('/ai-tips', verifyAuth, async (req, res) => {
  try {
    const tipsSnapshot = await db.collection('ai_tips')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const tips = [];
    tipsSnapshot.forEach(doc => {
      tips.push({ id: doc.id, ...doc.data() });
    });

    res.json(tips);
  } catch (error) {
    console.error('Error fetching AI tips:', error);
    res.status(500).json({ error: 'Failed to fetch AI tips' });
  }
});

// Get chat history
router.get('/chat-history', verifyAuth, async (req, res) => {
  try {
    const chatSnapshot = await db.collection('chat_messages')
      .where('userId', '==', req.user.uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const messages = [];
    chatSnapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send new chat message
router.post('/chat', verifyAuth, async (req, res) => {
  try {
    const { message } = req.body;
    const newMessage = {
      userId: req.user.uid,
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    const docRef = await db.collection('chat_messages').add(newMessage);
    res.status(201).json({ id: docRef.id, ...newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;