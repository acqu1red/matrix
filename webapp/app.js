(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.expand();
    tg.setBackgroundColor('#0c0f14');
    tg.setHeaderColor('#141825');
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

  function createMsgEl(text, type = 'out') {
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

  // Initial admin greeting (right side)
  addIncoming('Здравствуйте! Опишите ваш вопрос, и мы ответим в ближайшее время.');

  function handleSend() {
    const text = inputEl.value.trim();
    if (!text && !fileInput.files?.length) return;

    if (text) addOutgoing(text);

    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      addOutgoing(`📎 Файл: ${file.name}`);
      fileInput.value = '';
    }

    inputEl.value = '';

    // Demo echo from admin after a small delay
    setTimeout(() => {
      addIncoming('Приняли. Вернусь с ответом.');
    }, 500);
  }

  function attachPressRipple(el){
    let pressTimer;
    el.addEventListener('pointerdown', () => {
      el.classList.add('is-pressing');
      clearTimeout(pressTimer);
    });
    el.addEventListener('pointerup', () => {
      pressTimer = setTimeout(() => el.classList.remove('is-pressing'), 250);
    });
    el.addEventListener('pointerleave', () => {
      pressTimer = setTimeout(() => el.classList.remove('is-pressing'), 250);
    });
  }

  attachPressRipple(sendBtn);
  const attachLabel = document.querySelector('.attach');
  if (attachLabel) attachPressRipple(attachLabel);

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });
})();
