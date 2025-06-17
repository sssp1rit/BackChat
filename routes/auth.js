const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/register', upload.single('avatar'), async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarBuffer = req.file ? req.file.buffer : null;
    const newUser = new User({ username, password: hashedPassword, avatar: avatarBuffer });

    await newUser.save();
    
    res.status(201).json({ 
      message: 'Регистрация успешна', 
      userId: newUser._id.toString() 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Введите имя и пароль' });

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Пользователь не найден' });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return res.status(401).json({ message: 'Неверный пароль' });
    res.json({
      message: 'login success',
      userId: user._id.toString()  // обязательно отправь ID
    });
});

module.exports = router;
