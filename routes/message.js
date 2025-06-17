const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const mongoose = require('mongoose');

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

// Получить количество непрочитанных сообщений, сгруппированных по отправителю
router.get('/unreadCounts/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const counts = await Message.aggregate([
      { $match: { to: mongoose.Types.ObjectId(userId), read: false } },
      { $group: { _id: '$from', count: { $sum: 1 } } }
    ]);
    // counts будет вида [{ _id: ObjectId(...), count: N }, ...]
    res.json(counts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении непрочитанных сообщений' });
  }
});

// Пометить все сообщения от определенного пользователя как прочитанные
router.post('/markAsRead', async (req, res) => {
  const { currentUserId, chatUserId } = req.body;

  if (!currentUserId || !chatUserId) {
    return res.status(400).json({ message: 'currentUserId и chatUserId обязательны' });
  }

  try {
    await Message.updateMany(
      { from: chatUserId, to: currentUserId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Сообщения помечены как прочитанные' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при пометке сообщений как прочитанных' });
  }
});

module.exports = router;
