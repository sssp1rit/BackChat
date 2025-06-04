const searchInput = document.getElementById('userSearch');
const resultsList = document.getElementById('searchResults');
let socket = null;
window.currentChatUserId = null;
window.currentUserId = null; // установи текущий ID пользователя после логина
let messagesList = document.querySelector('.messages-list');

// Подключение к WebSocket
function connectWebSocket(userId) {
    console.log("web-sock for", userId);
  socket = new WebSocket(`ws://${location.host}`);

  socket.addEventListener('open', () => {
    console.log('✅ WebSocket подключен');
    socket.send(JSON.stringify({ type: 'register', userId }));
  });

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'message') {
      if (data.from === window.currentChatUserId) {
        console.log("fkjsafds");
        const msgEl = document.createElement('div');
        msgEl.className = 'message incoming';
        msgEl.textContent = data.text;
        messagesList.appendChild(msgEl);
      }
    }
  });

  socket.addEventListener('close', () => {
    console.log('❌ WebSocket отключен');
  });
}

window.currentUserId = localStorage.getItem('userId');

if (window.currentUserId) {
    console.log(window.currentUserId);
  connectWebSocket(window.currentUserId);
} else {
  // Если нет userId — редиректим на страницу входа
  window.location.href = 'login.html';
}

// Отправка сообщения
function sendMessage(text, toUserId) {
  if (!socket || socket.readyState !== WebSocket.OPEN){
    console.log('WS не открыт, сообщение не отправлено');
    return;
  } 

  if (!window.currentUserId) {
    console.log('Ошибка: currentUserId не установлен');
    return;
  }

  const message = {
    type: 'message',
    from: window.currentUserId,
    to: toUserId,
    text
  };
  console.log('Отправка сообщения:', { from: window.currentUserId, to: toUserId, text });


  socket.send(JSON.stringify(message));

  // Добавляем своё сообщение в чат
  const msgEl = document.createElement('div');
  msgEl.className = 'message outgoing';
  msgEl.textContent = text;
  messagesList.appendChild(msgEl);
}

// Поиск пользователей
searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (!query) {
    resultsList.innerHTML = '';
    return;
  }

  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    const users = await response.json();

    resultsList.innerHTML = users
      .map(user => `<li data-id="${user.id}">${user.username}</li>`)
      .join('');
  } catch (error) {
    resultsList.innerHTML = '<li>Ошибка поиска</li>';
  }
});

// Клик по пользователю — открыть чат
resultsList.addEventListener('click', async (e) => {
  let target = e.target;
  while (target && target.tagName !== 'LI') {
    target = target.parentElement;
  }
  if (!target) return;

  const userId = target.dataset.id;
  if (!userId) return;
  await openChatWithUser(userId);
});

// Открытие чата
async function openChatWithUser(userId) {
  const resUser = await fetch(`/api/users/${userId}`);
  if (!resUser.ok) {
    const text = await resUser.text();
    console.error('Ошибка запроса /api/user:', text);
    return;
  }

  const userData = await resUser.json();

  document.querySelector('.chat-title').textContent = userData.name;
  document.querySelector('.name-info').textContent = userData.name;

  window.currentChatUserId = userId;
  messagesList.innerHTML = ''; // очищаем сообщения

  // Здесь можно добавить загрузку истории сообщений, если нужно
}

// Привязка к кнопке отправки
document.getElementById('sendButton').addEventListener('click', () => {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (text && window.currentChatUserId) {
    sendMessage(text, window.currentChatUserId);
    input.value = '';
  }
});
