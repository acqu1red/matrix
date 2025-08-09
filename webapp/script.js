const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.enableClosingConfirmation();
}

const chat = document.getElementById('chat');
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const fileInput = document.getElementById('fileInput');

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e;
}

function appendMessage({ text, inbound = false }) {
  const wrap = el('div', `msg ${inbound ? 'msg-in' : 'msg-out'}`);
  const bubble = el('div', 'bubble', text);
  const meta = el('div', 'meta', inbound ? 'Администратор • сейчас' : 'Вы • сейчас');
  wrap.appendChild(bubble);
  wrap.appendChild(meta);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

sendBtn.addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) return;
  appendMessage({ text, inbound: false });
  input.value = '';

  // Simulate admin reply
  setTimeout(() => {
    appendMessage({ text: 'Спасибо за сообщение! Мы ответим вам в ближайшее время.', inbound: true });
  }, 700);
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    appendMessage({ text: `📎 Файл прикреплён: ${fileInput.files[0].name}`, inbound: false });
  }
});
