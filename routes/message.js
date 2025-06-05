const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Получить историю сообщений между двумя пользователями
router.get('/:userId', async (req, res) => {
  const currentUserId = req.query.currentUserId;
  const otherUserId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages.map(m => ({
      text: m.text,
      from: m.from.toString()
    })));
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении сообщений' });
  }
});

// Отправка сообщения
router.post('/', async (req, res) => {
  const { from, to, text } = req.body;

  try {
    const message = await Message.create({ from, to, text });
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});

module.exports = router;
