// supabaseClient.js — numeric Telegram IDs (BIGINT-safe)

(function(){
  const URL = window.__SUPABASE_URL__ || "https://uhhsrtmmuwoxsdquimaa.supabase.co";
  const KEY = window.__SUPABASE_ANON_KEY__ || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8";
  const MISCONFIG = !URL || !KEY;

  function ensureSdk(){
    if (window.supabase) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }

  function getTelegramInfo(){
    const tg = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) ? window.Telegram.WebApp.initDataUnsafe : null;
    if (!tg || !tg.user) return null;
    return tg.user;
  }

  function ensureLocalId(){
    const key = 'case_local_id_num';
    let v = localStorage.getItem(key);
    if (!v){
      // fallback локальный ID как число (в пределах безопасного int), чтобы BIGINT колонки не падали
      v = String(100000000 + Math.floor(Math.random()*900000000));
      localStorage.setItem(key, v);
    }
    return v;
  }

  function installOffline(){
    console.warn("⚠️ Supabase не сконфигурирован. Включён оффлайн-режим.");
    window.__CASE_API__ = {
      async getOrCreateUser(){
        const tg = getTelegramInfo();
        const idNum = tg ? String(tg.id) : ensureLocalId();
        const nickname = tg?.username || tg?.first_name || "guest";
        const local = { id:null, telegram_id: idNum, nickname, spins: 1, mulacoin: 0 };
        localStorage.setItem('case_user', JSON.stringify(local));
        return local;
      },
      async computeWallet(){ 
        const cache = JSON.parse(localStorage.getItem('case_user')||'{}');
        return { spins: cache.spins ?? 1, mulacoin: cache.mulacoin ?? 0 };
      },
      async listPromocodes(){ return []; },
      async addPromocode(){}, async markPromocodeUsed(){}, async addRouletteHistory(){}, initSupabase: ()=>null
    };
  }

  if (MISCONFIG){ installOffline(); return; }

  (async function init(){
    await ensureSdk();
    const sb = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, detectSessionInUrl: false } });

    async function getOrCreateUser(){
      const tg = getTelegramInfo();
      const identifier = tg ? String(tg.id) : ensureLocalId(); // <- ЧИСЛО В СТРОКЕ, БЕЗ "tg_"
      const nickname = tg?.username || (tg?.first_name ? (tg.first_name + (tg.last_name?(' '+tg.last_name):'')) : 'guest');

      let userRow = null;
      try{
        let { data, error } = await sb.from('users').select('*').eq('telegram_id', identifier).maybeSingle();
        if (!error && !data){
          const payload = { telegram_id: identifier, username: nickname, first_name: tg?.first_name || null, last_name: tg?.last_name || null };
          const ins = await sb.from('users').insert(payload).select().single();
          if (!ins.error) userRow = ins.data;
        } else if (!error) { userRow = data; }
      }catch(e){ console.warn('users access error', e); }

      const local = { id: userRow?.id || null, telegram_id: identifier, nickname, spins: 0, mulacoin: 0 };
      localStorage.setItem('case_user', JSON.stringify(local));
      return local;
    }

    async function computeWallet(user){
      const uId = user.id;
      const tgId = user.telegram_id; // строка-число
      let purchased = 0, used = 0, spinActivated = 0, coinsActivated = 0;
      try{
        const { data: rhBuy } = await sb.from('roulette_history').select('id').eq('user_id', uId).eq('prize_type','buy_spin');
        purchased = (rhBuy||[]).length;
        const { data: rhUsed } = await sb.from('roulette_history').select('id').eq('user_id', uId).neq('prize_type','buy_spin').not('prize_name','is',null);
        used = (rhUsed||[]).length;
        const { data: pSpin } = await sb.from('promocodes').select('id').eq('issued_to', tgId).eq('type','spin').eq('status','activated');
        spinActivated = (pSpin||[]).length;
        const { data: pCoin } = await sb.from('promocodes').select('value').eq('issued_to', tgId).eq('type','currency').eq('status','activated');
        coinsActivated = (pCoin||[]).reduce((s,r)=> s + (parseInt(r.value||0,10)||0), 0);
      }catch(e){ console.warn('wallet compute fallback', e); }
      const spins = Math.max(0, purchased + spinActivated - used);
      const mulacoin = Math.max(0, coinsActivated - purchased * 50);
      const cache = JSON.parse(localStorage.getItem('case_user') || "{}");
      cache.spins = spins; cache.mulacoin = mulacoin;
      localStorage.setItem('case_user', JSON.stringify(cache));
      return { spins, mulacoin };
    }

    async function listPromocodes(issued_to){
      try{
        const { data, error } = await sb.from('promocodes').select('*').eq('issued_to', issued_to).order('issued_at', { ascending:false });
        if (error){ console.warn('promocodes list error', error); return []; }
        return data || [];
      }catch(e){ console.warn('promocodes list fallback', e); return []; }
    }

    async function addPromocode(row){
      try{
        const payload = {
          code: row.code, type: row.type, value: row.value,
          issued_to: String(row.issued_to), issued_at: new Date().toISOString(),
          status: row.status || 'issued', expires_at: row.expires_at || null,
          used_at: null, used_by: null
        };
        const { error } = await sb.from('promocodes').insert(payload);
        if (error) console.warn('promocodes insert error', error);
      } catch(e){ console.warn('promocodes insert fallback', e); }
    }

    async function markPromocodeUsed(id, patch){
      try{
        const { error } = await sb.from('promocodes').update(patch).eq('id', id);
        if (error) console.warn('promocodes update error', error);
      } catch(e){ console.warn('promocodes update fallback', e); }
    }

    async function addRouletteHistory(entry){
      try{
        const payload = Object.assign({}, entry, { user_id: entry.user_id });
        const { error } = await sb.from('roulette_history').insert(payload);
        if (error) console.warn('roulette_history insert error', error);
      } catch(e){ console.warn('roulette_history insert fallback', e); }
    }
    
    async function getOrCreateUserProfile(telegram_id) {
      try {
        let { data, error } = await sb.from('user_profiles').select('*').eq('telegram_id', telegram_id).maybeSingle();
        if (error) throw error;
        return { user: data, isNew: !data };
      } catch(e) {
        console.warn('getOrCreateUserProfile error', e);
        return { user: null, isNew: true }; // Assume new user on error
      }
    }

    async function saveUserArchetype(telegram_id, archetype) {
      try {
        const { error } = await sb.from('user_profiles').upsert({ telegram_id, quest_archetype: archetype }, { onConflict: 'telegram_id' });
        if (error) throw error;
      } catch(e) {
        console.warn('saveUserArchetype error', e);
      }
    }

    window.__CASE_API__ = { 
      computeWallet, listPromocodes, addPromocode, 
      markPromocodeUsed, addRouletteHistory, getOrCreateUser, 
      getOrCreateUserProfile, saveUserArchetype,
      initSupabase: ()=>sb 
    };
    window.__CASE_DEBUG__ = { URL, hasKey: !!KEY };
  })();
})();