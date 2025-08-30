
// Supabase client adapted to your schema
// Tables used: users(telegram_id,...), promocodes(code,type,value,issued_to,issued_at,status,used_at,used_by,expires_at), roulette_history(user_id,prize_type,prize_name,is_free,mulacoin_spent,won_at,promo_code_id)

const SUPABASE_URL = window.__SUPABASE_URL__ || "https://uhhsrtmmuwoxsdquimaa.supabase.co";
const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8";

let supabase = null;

async function initSupabase() {
  if (supabase) return supabase;
  if (SUPABASE_URL.includes("YOUR-PROJECT")) {
    console.warn("⚠️ Supabase URL/KEY не заданы. Установите window.__SUPABASE_URL__ и window.__SUPABASE_ANON_KEY__ в case.html перед скриптом.");
  }
  if (!window.supabase) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, detectSessionInUrl: false }
  });
  return supabase;
}

function ensureLocalId(){
  const key = 'case_local_id';
  let v = localStorage.getItem(key);
  if (!v){
    v = 'anon_' + Math.random().toString(36).slice(2,10);
    localStorage.setItem(key, v);
  }
  return v;
}

function getTelegramInfo(){
  const tg = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) ? window.Telegram.WebApp.initDataUnsafe : null;
  if (!tg || !tg.user) return null;
  return {
    id: 'tg_' + tg.user.id,
    username: tg.user.username || null,
    first_name: tg.user.first_name || null,
    last_name: tg.user.last_name || null
  };
}

async function getOrCreateUser(){
  const sb = await initSupabase();
  const tg = getTelegramInfo();
  const identifier = tg ? tg.id : ensureLocalId();
  const nickname = tg?.username || (tg?.first_name ? (tg.first_name + (tg.last_name ? (' ' + tg.last_name) : '')) : 'guest');

  let userRow = null;
  try {
    let { data, error } = await sb.from('users').select('*').eq('telegram_id', identifier).maybeSingle();
    if (!data){
      const payload = { telegram_id: identifier, username: nickname, first_name: tg?.first_name || null, last_name: tg?.last_name || null };
      const ins = await sb.from('users').insert(payload).select().single();
      if (!ins.error) userRow = ins.data;
    } else { userRow = data; }
  } catch(e){
    console.warn('users access error', e);
  }

  const localKey = 'case_user';
  const local = { id: userRow?.id || null, telegram_id: identifier, nickname, spins: 0, mulacoin: 0 };
  localStorage.setItem(localKey, JSON.stringify(local));
  return local;
}

// Wallet derived from DB
async function computeWallet(user){
  const sb = await initSupabase();
  const uId = user.id;
  const tgId = user.telegram_id;

  let purchased = 0, used = 0, spinActivated = 0, coinsActivated = 0;

  try {
    const { data: rhBuy } = await sb.from('roulette_history').select('id').eq('user_id', uId).eq('prize_type', 'buy_spin');
    purchased = (rhBuy || []).length;

    const { data: rhUsed } = await sb.from('roulette_history').select('id').eq('user_id', uId).neq('prize_type','buy_spin').not('prize_name','is',null);
    used = (rhUsed || []).length;

    const { data: pSpin } = await sb.from('promocodes').select('id').eq('issued_to', tgId).eq('type', 'spin').eq('status','activated');
    spinActivated = (pSpin || []).length;

    const { data: pCoin } = await sb.from('promocodes').select('value').eq('issued_to', tgId).eq('type','currency').eq('status','activated');
    coinsActivated = (pCoin || []).reduce((s,r)=> s + (parseInt(r.value||0,10)||0), 0);
  } catch(e){
    console.warn('wallet compute fallback', e);
  }

  const spins = Math.max(0, purchased + spinActivated - used);
  const mulacoin = Math.max(0, coinsActivated - purchased * 50);

  const localKey = 'case_user';
  const cache = JSON.parse(localStorage.getItem(localKey) || "{}");
  cache.spins = spins; cache.mulacoin = mulacoin;
  localStorage.setItem(localKey, JSON.stringify(cache));
  return { spins, mulacoin };
}

async function listPromocodes(issued_to){
  const sb = await initSupabase();
  try{
    const { data, error } = await sb.from('promocodes').select('*').eq('issued_to', issued_to).order('issued_at', { ascending: false });
    if (error) { console.warn('promocodes list error', error); return []; }
    return data || [];
  } catch(e){ console.warn('promocodes list fallback', e); return []; }
}

async function addPromocode(row){
  const sb = await initSupabase();
  try{
    const payload = {
      code: row.code,
      type: row.type,
      value: row.value,
      issued_to: row.issued_to,
      issued_at: new Date().toISOString(),
      status: row.status || 'issued',
      expires_at: row.expires_at || null,
      used_at: null,
      used_by: null
    };
    await sb.from('promocodes').insert(payload);
  } catch(e){ console.warn('promocodes insert fallback', e); }
}

async function markPromocodeUsed(id, patch){
  const sb = await initSupabase();
  try{
    await sb.from('promocodes').update(patch).eq('id', id);
  } catch(e){ console.warn('promocodes update fallback', e); }
}

async function findPromoByCode(code, issued_to){
  const sb = await initSupabase();
  try{
    const { data } = await sb.from('promocodes').select('*').eq('code', code).eq('issued_to', issued_to).maybeSingle();
    return data || null;
  } catch(e){ console.warn('promocode find fallback', e); return null; }
}

async function addRouletteHistory(entry){
  const sb = await initSupabase();
  try{
    await sb.from('roulette_history').insert(entry);
  } catch(e){ console.warn('roulette_history insert fallback', e); }
}

window.__CASE_API__ = { computeWallet, listPromocodes, addPromocode, markPromocodeUsed, addRouletteHistory, getOrCreateUser, initSupabase };
