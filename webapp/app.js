(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.expand();
    tg.setBackgroundColor('#0f1115');
    tg.setHeaderColor('#151823');
  }

  const chatEl = document.getElementById('chat');
  const inputEl = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const fileInput = document.getElementById('fileInput');

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatEl.scrollTop = chatEl.scrollHeight;
    });
  }

  function createMsgEl(text, type = 'out', withBeige = true) {
    const el = document.createElement('div');
    el.className = `msg msg--${type}`;
    el.textContent = text;
    return el;
  }

  function addOutgoing(text) {
    const el = createMsgEl(text, 'out');
    chatEl.appendChild(el);
    scrollToBottom();
  }

  function addIncoming(text) {
    const el = createMsgEl(text, 'in');
    chatEl.appendChild(el);
    scrollToBottom();
  }

  // Placeholder first message from admin (right side, no beige)
  addIncoming('Здравствуйте! Опишите ваш вопрос, и мы ответим в ближайшее время.');

  function handleSend() {
    const text = inputEl.value.trim();
    if (!text && !fileInput.files?.length) return;

    if (text) {
      addOutgoing(text);
    }

    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      addOutgoing(`📎 Файл: ${file.name}`);
      fileInput.value = '';
    }

    inputEl.value = '';

    // Demo echo from admin after a small delay to showcase UI
    setTimeout(() => {
      addIncoming('Приняли. Вернусь с ответом.');
    }, 600);
  }

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });
})();
