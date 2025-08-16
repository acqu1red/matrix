/* global supabase */
(() => {
  const tg = window.Telegram?.WebApp || null;
  if (tg) { try { tg.ready(); tg.expand(); } catch(_){} }

  const st = {
    supa: null,
    user: { id: null, username: null, first_name: null },
    conv: { id: null, status: 'open' },
    admin: false,
    polling: { feed: null, adminFeed: null, convs: null },
    curAdminConv: null,
  };

  const els = {
    roleBadge: document.getElementById('roleBadge'),
    hello: document.getElementById('hello'),
    statusBox: document.getElementById('statusBox'),
    // user
    feed: document.getElementById('feed'),
    msgInput: document.getElementById('msgInput'),
    sendBtn: document.getElementById('sendBtn'),
    userError: document.getElementById('userError'),
    userView: document.getElementById('userView'),
    // admin
    adminView: document.getElementById('adminView'),
    convList: document.getElementById('convList'),
    adminFeed: document.getElementById('adminFeed'),
    adminMsgInput: document.getElementById('adminMsgInput'),
    adminSendBtn: document.getElementById('adminSendBtn'),
    adminCloseBtn: document.getElementById('adminCloseBtn'),
    refreshAdmin: document.getElementById('refreshAdmin'),
    adminError: document.getElementById('adminError'),
  };

  function fmtTs(s) { try { return new Date(s).toLocaleString('ru-RU'); } catch(_) { return s; } }
  function setStatus(msg, ok=false){ els.statusBox.textContent = msg; els.statusBox.className = ok ? 'ok' : 'muted'; }
  function show(el){ el.classList.remove('hidden'); }
  function hide(el){ el.classList.add('hidden'); }

  async function initSupabase() {
    const url = window.SUPABASE_URL || window.env?.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY || window.env?.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY не заданы');
    st.supa = supabase.createClient(url, key, { auth: { persistSession: false } });
    return st.supa;
  }

  function getTgUser() {
    const u = tg?.initDataUnsafe?.user;
    return {
      id: u?.id || null,
      username: u?.username || null,
      first_name: u?.first_name || null,
    };
  }

  async function ensureUserRow() {
    if (!st.user.id) throw new Error('Нет Telegram ID (WebApp откройте из бота)');
    const { error } = await st.supa
      .from('users')
      .upsert({
        telegram_id: String(st.user.id),
        username: st.user.username,
        first_name: st.user.first_name,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'telegram_id' });
    if (error) throw error;
  }

  async function ensureConversation() {
    const { data, error } = await st.supa
      .from('conversations')
      .select('id, status')
      .eq('user_id', st.user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    if (data && data.length) {
      st.conv.id = data[0].id;
      st.conv.status = data[0].status;
      return;
    }
    const { data: ins, error: e2 } = await st.supa
      .from('conversations')
      .insert([{ user_id: st.user.id, status: 'open' }])
      .select('id')
      .single();
    if (e2) throw e2;
    st.conv.id = ins.id;
    st.conv.status = 'open';
  }

  async function sendUserMessage() {
    els.userError.textContent = '';
    const text = (els.msgInput.value || '').trim();
    if (!text) return;
    try {
      if (!st.conv.id) await ensureConversation();
      const { error } = await st.supa
        .from('messages')
        .insert([{
          conversation_id: st.conv.id,
          sender_id: st.user.id,
          content: text,
          message_type: 'text',
        }]);
      if (error) throw error;
      els.msgInput.value = '';
      await loadUserFeed();
    } catch (e) {
      console.error(e); els.userError.textContent = 'Не удалось отправить: ' + (e.message || e);
    }
  }

  async function loadUserFeed() {
    if (!st.conv.id) return;
    const { data, error } = await st.supa
      .from('messages')
      .select('id, sender_id, content, message_type, created_at')
      .eq('conversation_id', st.conv.id)
      .order('created_at', { ascending: true });
    if (error) { console.error(error); return; }
    renderFeed(data || [], els.feed, st.user.id);
  }

  function renderFeed(rows, container, myId) {
    container.innerHTML = '';
    rows.forEach(m => {
      const wrap = document.createElement('div');
      const me = String(m.sender_id) === String(myId);
      wrap.className = 'msg ' + (me ? 'me' : 'them') + (me ? '' : ' from-admin');
      wrap.innerHTML = `<div>${escapeHtml(m.content || '')}</div><div class="ts">${fmtTs(m.created_at)}</div>`;
      container.appendChild(wrap);
    });
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(s) { return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

  // --- Admin side ---
  async function detectAdmin() {
    try {
      // tolerate both boolean and row return
      const { data, error } = await st.supa.rpc('is_admin', { user_telegram_id: st.user.id });
      if (error) { console.warn('is_admin RPC error', error); return false; }
      if (typeof data === 'boolean') return data;
      if (Array.isArray(data) && data.length && typeof data[0] === 'boolean') return data[0];
      if (data && typeof data === 'object' && 'is_admin' in data) return !!data.is_admin;
      return !!data;
    } catch (_) { return false; }
  }

  async function loadAdminConversations() {
    const { data, error } = await st.supa.rpc('get_admin_conversations');
    if (error) { console.error(error); els.adminError.textContent = 'Ошибка загрузки диалогов'; return; }
    renderConvList(data || []);
  }

  function renderConvList(rows) {
    els.convList.innerHTML = '';
    rows.forEach(r => {
      const d = document.createElement('div');
      d.className = 'conv';
      d.innerHTML = `<div><b>#${r.conversation_id}</b> — ${escapeHtml(r.username || 'Пользователь')}</div>
        <div class="muted">${escapeHtml(r.last_message || '')}</div>
        <div class="muted">${fmtTs(r.last_message_at || r.created_at)}</div>`;
      d.onclick = () => { st.curAdminConv = r.conversation_id; loadAdminFeed(); };
      els.convList.appendChild(d);
    });
  }

  async function loadAdminFeed() {
    els.adminError.textContent = '';
    if (!st.curAdminConv) { els.adminFeed.innerHTML = '<div class="muted">Выберите диалог слева</div>'; return; }
    const { data, error } = await st.supa.rpc('get_conversation_messages', { conv_id: st.curAdminConv });
    if (error) { console.error(error); els.adminError.textContent = 'Ошибка загрузки сообщений'; return; }
    renderFeed(data || [], els.adminFeed, st.user.id);
  }

  async function adminSend() {
    els.adminError.textContent = '';
    const text = (els.adminMsgInput.value || '').trim();
    if (!text || !st.curAdminConv) return;
    try {
      const { error } = await st.supa
        .from('messages')
        .insert([{
          conversation_id: st.curAdminConv,
          sender_id: st.user.id, // админ тоже отправляет свой tg id
          content: text,
          message_type: 'text',
        }]);
      if (error) throw error;
      els.adminMsgInput.value = '';
      await loadAdminFeed();
    } catch (e) {
      console.error(e); els.adminError.textContent = 'Не удалось отправить: ' + (e.message || e);
    }
  }

  async function adminClose() {
    if (!st.curAdminConv) return;
    try {
      const { error } = await st.supa.from('conversations').update({ status: 'closed' }).eq('id', st.curAdminConv);
      if (error) throw error;
      await loadAdminConversations();
      els.adminFeed.innerHTML = '<div class="muted">Диалог закрыт</div>';
    } catch (e) {
      console.error(e); els.adminError.textContent = 'Не удалось закрыть: ' + (e.message || e);
    }
  }

  // --- Bootstrap ---
  async function boot() {
    try {
      await initSupabase();
      st.user = getTgUser();
      if (!st.user.id) throw new Error('Откройте мини‑приложение из бота (нет Telegram ID)');
      els.hello.textContent = `Здравствуйте${st.user.first_name ? ', ' + st.user.first_name : ''}! Напишите нам — ответим сюда.`;

      await ensureUserRow();
      await ensureConversation();
      await loadUserFeed();

      st.admin = await detectAdmin();
      if (st.admin) {
        els.roleBadge.textContent = 'Администратор';
        hide(els.userView); show(els.adminView);
        await loadAdminConversations();
      } else {
        hide(els.adminView); show(els.userView);
      }

      // polling
      if (st.polling.feed) clearInterval(st.polling.feed);
      st.polling.feed = setInterval(loadUserFeed, 4000);

      if (st.admin) {
        if (st.polling.convs) clearInterval(st.polling.convs);
        st.polling.convs = setInterval(loadAdminConversations, 6000);
        if (st.polling.adminFeed) clearInterval(st.polling.adminFeed);
        st.polling.adminFeed = setInterval(loadAdminFeed, 4000);
      }

      setStatus('Готово', true);
    } catch (e) {
      console.error(e);
      setStatus('Ошибка: ' + (e.message || e), false);
    }
  }

  // Wire
  els.sendBtn.addEventListener('click', sendUserMessage);
  els.msgInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendUserMessage(); });
  els.refreshAdmin.addEventListener('click', loadAdminConversations);
  els.adminSendBtn.addEventListener('click', adminSend);
  els.adminMsgInput.addEventListener('keydown', e => { if (e.key === 'Enter') adminSend(); });
  els.adminCloseBtn.addEventListener('click', adminClose);

  document.addEventListener('DOMContentLoaded', boot);
})();
