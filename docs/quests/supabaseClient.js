// Minimal client wrapper. Fill in your credentials below.
const SUPABASE_URL = window.__SUPABASE_URL__ || "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || "YOUR-ANON-KEY";

let supabase = null;

async function initSupabase() {
  if (supabase) return supabase;
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, detectSessionInUrl: false },
    });
    return supabase;
  }
  // lazy load
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, detectSessionInUrl: false },
  });
  return supabase;
}

// Get or create a user row in `users` (by Telegram user id if available).
async function getOrCreateUser() {
  const tg = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) ? window.Telegram.WebApp.initDataUnsafe : null;
  const tgId = tg && tg.user ? tg.user.id : null;
  const nickname = tg && tg.user ? (tg.user.username || (tg.user.first_name + (tg.user.last_name ? ' ' + tg.user.last_name : ''))) : 'anon';
  const localKey = 'case_user';
  let local = JSON.parse(localStorage.getItem(localKey) || "null");
  if (!local) {
    local = { id: null, tg_id: tgId, nickname, mulacoin: 0, spins: 1 };
    localStorage.setItem(localKey, JSON.stringify(local));
  }

  try {
    const sb = await initSupabase();
    if (!tgId) return local; // fallback to local only

    // try fetch
    let { data, error } = await sb.from('users').select('*').eq('tg_id', tgId).maybeSingle();
    if (error) console.warn('users fetch error', error);
    if (!data) {
      // Create with defaults (make sure your table has these columns or adjust here)
      const insert = { tg_id: tgId, nickname, mulacoin: 0, spins: 1 };
      const { data: created, error: insErr } = await sb.from('users').insert(insert).select().single();
      if (insErr) { console.warn('users insert error', insErr); return local; }
      data = created;
    }
    // merge local cache
    local = { ...local, ...data };
    localStorage.setItem(localKey, JSON.stringify(local));
    return local;
  } catch (e) {
    console.warn('Supabase unavailable, using local only', e);
    return local;
  }
}

async function updateUserPatch(patch) {
  const localKey = 'case_user';
  let local = JSON.parse(localStorage.getItem(localKey) || "null") || {};
  local = { ...local, ...patch };
  localStorage.setItem(localKey, JSON.stringify(local));
  try {
    const sb = await initSupabase();
    if (local.tg_id) {
      const { error } = await sb.from('users').update(patch).eq('tg_id', local.tg_id);
      if (error) console.warn('users update error', error);
    }
  } catch (e) { console.warn('updateUserPatch fallback', e); }
  return local;
}

async function addRouletteHistory(entry) {
  try {
    const sb = await initSupabase();
    // columns expected: tg_id, prize_id, prize_name, code, meta (json), created_at
    const { error } = await sb.from('roulette_history').insert(entry);
    if (error) console.warn('roulette_history insert error', error);
  } catch(e){ console.warn('roulette_history fallback', e); }
}

async function addPromocode(row) {
  try {
    const sb = await initSupabase();
    // columns expected: tg_id, code, type, value, status, meta
    const { error } = await sb.from('promocodes').insert(row);
    if (error) console.warn('promocodes insert error', error);
  } catch(e){ console.warn('promocodes insert fallback', e); }
}

async function listPromocodes(tg_id) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.from('promocodes').select('*').eq('tg_id', tg_id).order('created_at', { ascending: false });
    if (error) { console.warn('promocodes list error', error); return []; }
    return data || [];
  } catch(e){ console.warn('promocodes list fallback', e); return []; }
}

async function markPromocodeUsed(id, patch) {
  try {
    const sb = await initSupabase();
    const { error } = await sb.from('promocodes').update(patch).eq('id', id);
    if (error) console.warn('promocode update error', error);
  } catch(e){ console.warn('promocode update fallback', e); }
}