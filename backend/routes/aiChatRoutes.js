const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const verifyAuth = require('../middleware/auth');

router.post('/chat', verifyAuth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.uid;

    const chatMessage = {
      userId,
      message,
      type: 'user',
      timestamp: new Date()
    };

    // Store user message
    await db.collection('aiChats').add(chatMessage);

    // Generate AI response (you can integrate with OpenAI or similar service here)
    const aiResponse = {
      userId,
      message: "AI response based on financial context",
      type: 'ai',
      timestamp: new Date()
    };

    // Store AI response
    const aiDocRef = await db.collection('aiChats').add(aiResponse);

    res.json({
      userMessage: chatMessage,
      aiResponse: { id: aiDocRef.id, ...aiResponse }
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

router.get('/chat/history', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('aiChats')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    }));

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Fix the export at the bottom
module.exports = router;  // Changed from 'aiChatRoutes' to 'router'