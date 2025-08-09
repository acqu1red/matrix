// Конфигурация для подключения к Supabase
const SUPABASE_CONFIG = {
    url: 'https://uhhsrtmmuwoxsdquimaa.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8'
};

// Telegram WebApp API
const tg = window.Telegram?.WebApp;

// Конфигурация приложения
const CONFIG = {
    isAdmin: false,
    currentUserId: null,
    currentConversationId: null,
    
    // Функция инициализации
    init() {
        if (tg) {
            tg.expand();
            tg.enableClosingConfirmation();
            
            // Получаем данные пользователя из Telegram
            this.currentUserId = tg.initDataUnsafe?.user?.id;
            
            // Проверяем права администратора
            this.checkAdminRights();
        }
    },
    
    async checkAdminRights() {
        // Здесь будет проверка через Supabase
        // Пока сделаем заглушку
        this.isAdmin = true; // Временно для тестирования
    }
};

export { SUPABASE_CONFIG, CONFIG, tg };