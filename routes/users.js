const express = require('express');
const router = express.Router();
const User = require('../models/User'); // модель пользователя



router.get('api/search', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.json([]); // если строка поиска пустая — возвращаем пустой массив
  }

  try {
    // Поиск пользователей, где username содержит query (регистронезависимо)
    const users = await User.find({ username: { $regex: query, $options: 'i' } }).limit(10);

    // Отправляем только нужные поля
    res.json(users.map(user => ({
      id: user._id,
      username: user.username,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при поиске пользователей' });
  }
});

router.get('/:id', async (req, res) => {
  console.log("fbdsk");
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user._id,
      name: user.username,
      avatarUrl: user.avatarUrl || '',
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

//nickname update
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Имя не может быть пустым' });
    }

    const user = await User.findByIdAndUpdate(userId, { username: name }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ message: 'Ник обновлён', user });
  } catch (err) {
    console.error('Ошибка при обновлении ника:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
