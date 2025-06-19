document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // ВАЖНО: отменяем поведение формы

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
      alert("⚠️ Пожалуйста, заполните все поля");
      return;
    }else if(password.length < 8){
      alert("Пароль должен содержать не меньше 8 символов");
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
        console.log('Регистрация успешна. userId:', data.userId);
        window.location.href = 'index.html';
      } else {
        alert(`⚠️ Ошибка: ${data.message || 'Не удалось зарегистрироваться'}`);
      }
    } catch (error) {
      console.error(error);
      alert('⚠️ Ошибка при регистрации. Попробуйте позже.');
    }
  });
});