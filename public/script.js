const searchInput = document.getElementById('userSearch');
const resultsList = document.getElementById('searchResults');
let socket = null;
window.currentChatUserId = null;
window.currentUserId = null; // установи текущий ID пользователя после логина
let messagesList = document.querySelector('.messages-list');
const unreadCounts = {};

async function markMessagesAsRead(chatUserId) {
  try {
    await fetch('/api/messages/markAsRead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId: window.currentUserId, chatUserId })
    });
    unreadCounts[chatUserId] = 0;
    updateUnreadBadge(chatUserId);
  } catch (err) {
    console.error('Ошибка при пометке сообщений как прочитанными', err);
  }
}


async function loadUnreadCounts(userId) {
  try {
    const res = await fetch(`/api/messages/unreadCounts/${userId}`);
    const counts = await res.json();
    counts.forEach(({ _id, count }) => {
      unreadCounts[_id] = count;
      updateUnreadBadge(_id);
      moveUserToTop(_id);
    });
  } catch (err) {
    console.error('Ошибка загрузки непрочитанных сообщений', err);
  }
}


function updateUnreadBadge(userId) {
  const chatItem = document.querySelector(`#chat-list li[data-id="${userId}"]`);
  if (!chatItem) return;

  let badge = chatItem.querySelector('.unread-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'unread-badge';
    chatItem.appendChild(badge);
  }

  badge.textContent = unreadCounts[userId];
  badge.style.display = unreadCounts[userId] > 0 ? 'inline-block' : 'none';
}

function moveUserToTop(userId) {
  const chatList = document.getElementById('chat-list');
  const chatItem = document.querySelector(`#chat-list li[data-id="${userId}"]`);
  if (chatItem) {
    chatList.prepend(chatItem);
  }
}


// Подключение к WebSocket
function connectWebSocket(userId) {
    console.log("web-sock for", userId);
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  socket = new WebSocket(`${protocol}://${location.host}`);

  socket.addEventListener('open', () => {
    console.log('✅ WebSocket подключен');
    console.log(userId);
    socket.send(JSON.stringify({ type: 'register', userId }));
  });

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'message') {
      if (data.from === window.currentChatUserId) {
        moveUserToTop(data.from);
        console.log("fkjsafds");
        const msgEl = document.createElement('div');
        msgEl.className = 'message incoming';
        msgEl.textContent = data.text;
        messagesList.appendChild(msgEl);
        messagesList.scrollTop = messagesList.scrollHeight;
      }else {
        // Чат не открыт — увеличиваем счётчик
        unreadCounts[data.from] = (unreadCounts[data.from] || 0) + 1;
        updateUnreadBadge(data.from);
        moveUserToTop(data.from);
      }
    }
  });

  socket.addEventListener('close', () => {
    console.log('❌ WebSocket отключен');
  });
}

window.currentUserId = sessionStorage.getItem('userId');
console.log(window.currentUserId);

if (window.currentUserId) {
  const lastChatUserId = sessionStorage.getItem('lastChatUserId');
  if (lastChatUserId) {
    openChatWithUser(lastChatUserId);
  }
  console.log(window.currentUserId);
  connectWebSocket(window.currentUserId);
} else {
  // Если нет userId — редиректим на страницу входа
  window.location.href = 'login.html';
}

// Отправка сообщения
async function sendMessage(text, toUserId) {
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
  moveUserToTop(toUserId);
  const chatList = document.getElementById('chat-list');
  const existingChat = document.querySelector(`#chat-list li[data-id="${toUserId}"]`);

  if (!existingChat) {
    try {
      const res = await fetch(`/api/users/${toUserId}`);
      const userData = await res.json();

      const newChatItem = document.createElement('li');
      newChatItem.dataset.id = toUserId;
      newChatItem.innerHTML = `
        <img src="${userData.avatarUrl || 'default-avatar.png'}" alt="avatar" class="chat-avatar" />
        <span>${userData.name}</span>
      `;
      newChatItem.className = 'chat-item';

      newChatItem.addEventListener('click', () => {
        openChatWithUser(toUserId);
      });

      chatList.appendChild(newChatItem);
    } catch (err) {
      console.error('Ошибка при загрузке имени пользователя:', err);
    }
  }

  fetch('/api/chats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user1: window.currentUserId,
    user2: toUserId
  })
}).catch(err => console.error('Ошибка создания чата:', err)); 

  socket.send(JSON.stringify(message));

  // Добавляем своё сообщение в чат
  const msgEl = document.createElement('div');
  msgEl.className = 'message outgoing';
  msgEl.textContent = text;
  messagesList.appendChild(msgEl);

  messagesList.scrollTop = messagesList.scrollHeight;
}

document.getElementById('messageInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // Чтобы не было переноса строки
    const input = event.target;
    const text = input.value.trim();
    if (text && window.currentChatUserId) {
      sendMessage(text, window.currentChatUserId);
      input.value = '';
    }
  }
});

const messageInput = document.getElementById('messageInput');

// Фокус по умолчанию при загрузке страницы
messageInput.focus();

// Повторно ставим фокус при любом клике по странице,
// кроме самого поля ввода, чтобы не сбивалось вручную
document.addEventListener('click', (e) => {
  if (
    e.target.closest('input')
  ) {
    return;
  }else{
    messageInput.focus();
  }

  
});

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
  try {
    sessionStorage.setItem('lastChatUserId', userId);
    const resUser = await fetch(`/api/users/${userId}`);
    if (!resUser.ok) {
      const text = await resUser.text();
      console.error('Ошибка запроса /api/user:', text);
      return;
    }

    const userData = await resUser.json();

    document.querySelector('.chat-title').textContent = userData.name;
    const companionLogo = document.querySelector('.companion-logo');
    companionLogo.innerHTML = `<img src="${userData.avatarUrl || 'saved.png'}" alt="avatar" class="chat-avatar-large" />`;

    document.querySelector('.chat-title').textContent = userData.name;


    window.currentChatUserId = userId;
    messagesList.innerHTML = ''; // очищаем сообщения

    // Загрузка истории сообщений
    const res = await fetch(`/api/messages/${userId}?currentUserId=${window.currentUserId}`);
    const history = await res.json();

    history.forEach(msg => {
      const msgEl = document.createElement('div');
      msgEl.className = 'message ' + (String(msg.from) === String(window.currentUserId) ? 'outgoing' : 'incoming');
      msgEl.textContent = msg.text;
      console.log(msg.from, window.currentUserId);
      messagesList.appendChild(msgEl);
    });
    unreadCounts[userId] = 0;
    updateUnreadBadge(userId);  

    await markMessagesAsRead(userId);


    messagesList.scrollTop = messagesList.scrollHeight;
    

  } catch (err) {
    console.error('Ошибка в openChatWithUser:', err);
  }
  
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

window.addEventListener('DOMContentLoaded', async () => {
  if (!window.currentUserId) return;

  try {
    const res = await fetch(`/api/chats?userId=${window.currentUserId}`);
    const chats = await res.json();

    for (const chat of chats) {
      // объявляем переменную здесь, чтобы использовать дальше
      const currentUserIdStr = String(window.currentUserId);
      const otherUserId = chat.participants.find(id => String(id) !== currentUserIdStr);
      console.log(otherUserId);
      if (!otherUserId) {
        console.error('Не удалось определить собеседника:', chat);
        continue;
      }

      const userRes = await fetch(`/api/users/${otherUserId}`);
      if (!userRes.ok) {
        console.error('Ошибка при запросе пользователя', otherUserId);
        continue;
      }
      const userData = await userRes.json();

      const newChatItem = document.createElement('li');
      newChatItem.dataset.id = otherUserId;
      newChatItem.textContent = userData.name;
      newChatItem.className = 'chat-item';

      newChatItem.addEventListener('click', () => {
        openChatWithUser(otherUserId);
      });

      document.getElementById('chat-list').appendChild(newChatItem);
    }
    await loadUnreadCounts(window.currentUserId);
  } catch (err) {
    console.error('Ошибка загрузки чатов:', err);
  }
});

