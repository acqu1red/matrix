// Конфигурация Supabase
const SUPABASE_CONFIG = {
    url: 'https://uhhsrtmmuwoxsdquimaa.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8'
};

// Инициализация Supabase клиента
let supabase;

// Функция инициализации
function initSupabase() {
    try {
        if (typeof supabase === 'undefined' && window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                },
                realtime: {
                    params: {
                        eventsPerSecond: 2
                    }
                }
            });
            console.log('Supabase клиент инициализирован');
        }
    } catch (error) {
        console.error('Ошибка инициализации Supabase:', error);
    }
}

// Экспорт конфигурации
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.initSupabase = initSupabase;
