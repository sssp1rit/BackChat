/**
 * @jest-environment jsdom
 */

beforeAll(() => {
  // Мокаем sessionStorage
  const sessionStorageMock = (() => {
    let store = {};
    return {
      getItem: key => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      clear: () => { store = {}; },
    };
  })();
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

  // Мокаем window.location
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' },
  });
});

beforeEach(() => {
  document.body.innerHTML = `
    <input id="username" type="text" />
    <input id="password" type="password" />
    <button id="registerBtn">Зарегистрироваться</button>
  `;

  global.fetch = jest.fn();
  window.alert = jest.fn();
  window.sessionStorage.clear();

  // Подключаем обработчик (импортируем register.js)
  require('../public/register');
});

afterEach(() => {
  jest.restoreAllMocks();
});

const triggerDOMContentLoaded = () => {
  const event = document.createEvent('Event');
  event.initEvent('DOMContentLoaded', true, true);
  window.dispatchEvent(event);
};

describe('Register form — based on register.js', () => {
  it('сохраняет userId и делает редирект при успешной регистрации', async () => {
    triggerDOMContentLoaded();

    document.getElementById('username').value = 'testuser';
    document.getElementById('password').value = 'testpass';

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ userId: 'user-123' }),
    });

    document.getElementById('registerBtn').click();
    await Promise.resolve();

    expect(window.sessionStorage.getItem('userId')).toBe('user-123');
    expect(window.location.href).toBe('index.html');
  });

  it('показывает alert при неудачной регистрации от сервера', async () => {
    triggerDOMContentLoaded();

    document.getElementById('username').value = 'testuser';
    document.getElementById('password').value = 'testpass';

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    document.getElementById('registerBtn').click();
    await Promise.resolve();

    expect(window.alert).toHaveBeenCalledWith('⚠️ Ошибка');
    expect(window.sessionStorage.getItem('userId')).toBeNull();
  });
});
