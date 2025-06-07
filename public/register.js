document.getElementById('registerBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert("Заполните все поля")
    return;
  }

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
      sessionStorage.setItem('userId', data.userId);

        window.location.href = 'index.html';
    } else {
        alert(`⚠️ Ошибка`);
    }
    } catch (error) {
        alert('Ошибка при регистрации');
    }
});
