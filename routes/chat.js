const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// Создание чата (если нет)
router.post('/api/chats', async (req, res) => {
  const { user1, user2 } = req.body;
  if (!user1 || !user2) {
    return res.status(400).json({ error: 'Missing user IDs' });
  }

  const existingChat = await Chat.findOne({
    participants: { $all: [user1, user2] }
  });

  if (!existingChat) {
    await Chat.create({ participants: [user1, user2] });
  }

  res.json({ success: true });
});

// Получить все чаты пользователя
router.get('/api/chats', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const chats = await Chat.find({ participants: userId }).sort({ updatedAt: -1 });
  res.json(chats);
});

module.exports = router;
