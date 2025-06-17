const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Подключено к MongoDB'))
.catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// Маршруты
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const searchRoutes = require('./routes/search');
app.use('/api/search', searchRoutes);

const messageRoutes = require('./routes/message');
app.use('/api/messages', messageRoutes);

const Message = require('./models/Message');

const chatRoutes = require('./routes/chat');
app.use(chatRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));


// Создаём HTTP сервер из Express приложения
const server = http.createServer(app);

// Создаём WebSocket сервер поверх HTTP сервера
const wss = new WebSocket.Server({ server });

// Хранилище подключённых пользователей: userId -> ws
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('Новое WebSocket соединение');

  ws.on('message', (message) => {
    console.log('Получено сообщение через WS:');
    try {
      const data = JSON.parse(message);

      if (data.type === 'register') {
        // Регистрация пользователя
        clients.set(data.userId, ws);
        ws.userId = data.userId;
        console.log(`Пользователь зарегистрирован в WS: ${data.userId}`);
      }

      if (data.type === 'message') {
        const newMessage = new Message({
          from: data.from,
          to: data.to,
          text: data.text
        });
        newMessage.save().then(() => {
    console.log('💾 Сообщение сохранено в MongoDB');

    // 2. Отправляем сообщение получателю через WebSocket
    const toWs = clients.get(data.to);
    if (toWs && toWs.readyState === WebSocket.OPEN) {
      toWs.send(JSON.stringify({
        type: 'message',
        from: data.from,
        text: data.text,
      }));
    }
  }).catch(err => {
    console.error('❌ Ошибка при сохранении сообщения в MongoDB:', err);
  });
      }

    } catch (err) {
      console.error('Ошибка обработки сообщения WS:', err);
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log(`Пользователь ${ws.userId} отключился от WS`);
    }
  });
});

// Запускаем сервер на нужном порту
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
