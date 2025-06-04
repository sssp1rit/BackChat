const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json([]);

  try {
    const users = await User.find({ username: { $regex: query, $options: 'i' } }).limit(10);
    res.json(users.map(user => ({
      id: user._id,
      username: user.username,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при поиске' });
  }
});

module.exports = router;
