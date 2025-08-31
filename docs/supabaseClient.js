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
    const key = 'quests_local_id_num';
    let v = localStorage.getItem(key);
    if (!v){
      v = String(100000000 + Math.floor(Math.random()*900000000));
      localStorage.setItem(key, v);
    }
    return v;
  }

  function installOffline(){
    console.warn("⚠️ Supabase не сконфигурирован. Включён оффлайн-режим.");
    window.__QUEST_API__ = {
      async getUserProfile(){
        const tg = getTelegramInfo();
        const idNum = tg ? String(tg.id) : ensureLocalId();
        // Для оффлайн-режима, симулируем нового пользователя один раз
        const localProfile = localStorage.getItem('quests_user_profile');
        if (localProfile) return JSON.parse(localProfile);
        return null;
      },
      async createUserProfile(profile){
        localStorage.setItem('quests_user_profile', JSON.stringify(profile));
        return profile;
      },
      initSupabase: ()=>null
    };
  }

  if (MISCONFIG){ installOffline(); return; }

  (async function init(){
    await ensureSdk();
    const sb = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, detectSessionInUrl: false } });

    async function getUserProfile(telegramId) {
      try {
        const { data, error } = await sb
          .from('user_profiles')
          .select('*')
          .eq('telegram_id', telegramId)
          .single();
        if (error && error.code !== 'PGRST116') { // PGRST116 = 0 rows
          console.error('Ошибка получения профиля:', error);
          return null;
        }
        return data;
      } catch (e) {
        console.error('Сбой при получении профиля:', e);
        return null;
      }
    }

    async function createUserProfile(profileData) {
      try {
        const { data, error } = await sb
          .from('user_profiles')
          .insert(profileData)
          .select()
          .single();
        if (error) {
          console.error('Ошибка создания профиля:', error);
          return null;
        }
        return data;
      } catch (e) {
        console.error('Сбой при создании профиля:', e);
        return null;
      }
    }

    window.__QUEST_API__ = { getUserProfile, createUserProfile, getTelegramInfo, initSupabase: ()=>sb };
    window.__QUEST_DEBUG__ = { URL, hasKey: !!KEY };
  })();
})();