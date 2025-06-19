document.getElementById('themeSwitch').addEventListener('change', (e) => {
  if (e.target.checked) {
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
});

// Загрузка темы при старте
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  document.getElementById('themeSwitch').checked = true;
}

// Обработка формы смены ника
document.getElementById('nicknameForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newNick = document.getElementById('newNickname').value.trim();
  if (newNick) {
    try {
      const userId = sessionStorage.getItem('userId');
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newNick })
      });
      if (res.ok) alert('Ник успешно обновлён');
      else alert('Ошибка при обновлении ника');
    } catch (err) {
      alert('Сетевая ошибка');
    }
  }
});

// // Обработка формы смены пароля
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const oldPass = document.getElementById('oldPassword').value.trim();
  const newPass = document.getElementById('newPassword').value.trim();

  if (oldPass && newPass) {
    try {
      const userId = sessionStorage.getItem('userId');
      const res = await fetch(`/api/users/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
      });
      if (res.ok) alert('Пароль обновлён');
      else alert('Ошибка при смене пароля');
    } catch (err) {
      alert('Ошибка сети');
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const themeSwitch = document.getElementById('themeSwitch');

  // Установить состояние переключателя по сохранённой теме
  const savedTheme = localStorage.getItem('theme');
  themeSwitch.checked = savedTheme === 'dark';

  // При переключении — сохраняем тему
  themeSwitch.addEventListener('change', () => {
    const theme = themeSwitch.checked ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  });

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      sessionStorage.clear(); // очищаем все данные сессии
      window.location.href = 'login.html'; // перенаправляем на вход
    });
  }
});