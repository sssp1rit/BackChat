const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Введите имя и пароль' });

  const user = await User.findOne({ username });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Неверные имя или пароль' });
  }

  res.json({ message: 'Вход успешен' });
});

module.exports = router;
