const axios = require('axios');

app.post('/gemini-insight', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY,
      {
        contents: [{ parts: [{ text: message }] }]
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Gemini API call failed', details: err.message });
  }
});
