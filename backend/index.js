const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import all routes
const authRoutes = require("./routes/authRoutes");
const goalRoutes = require('./routes/goalRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const aiChatRoutes = require('./routes/aiChatRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const geminiRoutes = require('./routes/gemini');

const app = express();

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());

// Fixed route declarations
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user', goalRoutes);
app.use('/api/user', transactionRoutes);
app.use('/api/user', budgetRoutes);
app.use('/api/user', aiChatRoutes);
app.use('/api/user', aiRoutes);

// Mount routes AFTER middleware
app.use('/api/ai', geminiRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
