document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    alert("⚠️ Пожалуйста, заполните все поля");
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem('userId', data.userId);
      console.log('Сохраняем userId:', data.userId);
      window.location.href = 'index.html';
    } else {
      alert(`⚠️ Ошибка: ${data.message || 'Неверный логин или пароль'}`);
    }
  } catch (error) {
    console.error(error);
    alert('⚠️ Ошибка при попытке входа. Попробуйте позже.');
  }
});
