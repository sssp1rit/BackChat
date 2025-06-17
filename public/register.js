document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // ВАЖНО: отменяем поведение формы

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const avatarInput = document.getElementById('avatar');

    if (!username || !password) {
      alert("⚠️ Пожалуйста, заполните все поля");
      return;
    }else if(password.length < 8){
      alert("Пароль должен содержать не меньше 8 символов");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData,
        // заголовок Content-Type не нужен — браузер его установит автоматически
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

const avatarInput = document.getElementById("avatar");
const avatarPreview = document.getElementById("avatarPreview");

// При клике по кружку — открываем проводник
avatarPreview.addEventListener("click", () => {
  avatarInput.click();
});

// При выборе файла — обновляем фон превью
avatarInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.style.backgroundImage = `url(${e.target.result})`;
    };
    reader.readAsDataURL(file);
  }
});

