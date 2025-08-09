// Глобальные переменные
const tg = window.Telegram?.WebApp;
let supabase;
let currentUser = null;
let isAdmin = false;
let currentDialogId = null;
let currentChatUserId = null;

// Список администраторов (жёстко прописан в коде)
const ADMIN_IDS = [
    708907063,    // @acqu1red
    7365307696    // @cas3method
];

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
    }

    // Инициализация Supabase
    if (window.supabase && window.SUPABASE_CONFIG) {
        try {
            supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url, 
                window.SUPABASE_CONFIG.anonKey,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false
                    }
                }
            );
            console.log('✅ Supabase инициализирован');
            
            // Тестируем подключение
            const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
            if (error) {
                console.error('❌ Ошибка подключения к Supabase:', error);
            } else {
                console.log('✅ Подключение к базе работает, пользователей:', data);
            }
        } catch (error) {
            console.error('❌ Ошибка инициализации Supabase:', error);
        }
        
        // Получение данных пользователя из Telegram
        await initUser();
    } else {
        console.warn('⚠️ Supabase или конфигурация недоступны');
        await initUser();
    }

    // Инициализация обработчиков
    initEventListeners();
});

// Инициализация пользователя
async function initUser() {
    try {
        if (tg?.initDataUnsafe?.user) {
            const telegramUser = tg.initDataUnsafe.user;
            currentUser = telegramUser;
            
            // Проверка админских прав по жёстко прописанному списку
            isAdmin = ADMIN_IDS.includes(telegramUser.id);
            console.log(`Пользователь ${telegramUser.id} (${telegramUser.username}), isAdmin: ${isAdmin}`);
            
            if (supabase) {
                try {
                    // Создание или обновление пользователя в БД
                    const { data, error } = await supabase
                        .from('users')
                        .upsert({
                            telegram_id: telegramUser.id,
                            username: telegramUser.username || null,
                            first_name: telegramUser.first_name || null,
                            last_name: telegramUser.last_name || null,
                            is_admin: isAdmin  // Устанавливаем админские права
                        })
                        .select()
                        .single();

                    if (error) {
                        console.error('Ошибка при сохранении пользователя:', error);
                    } else {
                        console.log('Пользователь успешно сохранён в БД');
                    }
                } catch (dbError) {
                    console.error('Ошибка работы с БД:', dbError);
                    // Продолжаем работу даже если БД недоступна
                }
            }

            // Показываем админскую кнопку для админов
            if (isAdmin) {
                document.getElementById('adminButton').style.display = 'block';
                console.log('Админская панель активирована');
            }
        } else {
            // Для тестирования без Telegram
            console.log('Режим разработки - используем тестового пользователя');
            currentUser = { id: 708907063, first_name: 'Test Admin', username: 'acqu1red' };
            isAdmin = true;
            document.getElementById('adminButton').style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка инициализации пользователя:', error);
        // Даже при ошибке показываем админку для админов
        if (currentUser && ADMIN_IDS.includes(currentUser.id)) {
            isAdmin = true;
            document.getElementById('adminButton').style.display = 'block';
        }
    }
}

// Инициализация обработчиков событий
function initEventListeners() {
    const chat = document.getElementById('chat');
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const fileInput = document.getElementById('fileInput');
    const adminButton = document.getElementById('adminButton');
    const adminPanel = document.getElementById('adminPanel');
    const closeAdminPanel = document.getElementById('closeAdminPanel');
    const adminChatModal = document.getElementById('adminChatModal');
    const closeAdminChat = document.getElementById('closeAdminChat');
    const adminMessageInput = document.getElementById('adminMessageInput');
    const adminSendBtn = document.getElementById('adminSendBtn');
    const markInProgressBtn = document.getElementById('markInProgressBtn');
    const markClosedBtn = document.getElementById('markClosedBtn');

    // Основной чат
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    fileInput.addEventListener('change', handleFileUpload);

    // Панель администратора
    adminButton.addEventListener('click', openAdminPanel);
    closeAdminPanel.addEventListener('click', () => {
        adminPanel.style.display = 'none';
    });

    // Админский чат
    closeAdminChat.addEventListener('click', () => {
        adminChatModal.style.display = 'none';
    });
    
    adminSendBtn.addEventListener('click', sendAdminMessage);
    adminMessageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAdminMessage();
        }
    });

    // Контролы диалога
    markInProgressBtn.addEventListener('click', () => updateDialogStatus('in_progress'));
    markClosedBtn.addEventListener('click', () => updateDialogStatus('closed'));
}

// Отправка сообщения пользователем
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text) return;

    // Отображаем сообщение локально
    appendMessage({ text, inbound: false });
    input.value = '';

    // Если нет пользователя, работаем локально
    if (!currentUser) {
        setTimeout(() => {
            appendMessage({ 
                text: 'Спасибо за сообщение! Для полной функциональности откройте через Telegram бота.', 
                inbound: true 
            });
        }, 1000);
        return;
    }

    try {
        if (supabase && currentUser) {
            console.log('📤 Отправка сообщения от пользователя:', currentUser.id);
            
            // Создаем или находим активный диалог
            if (!currentDialogId) {
                console.log('📋 Создание нового диалога...');
                
                // Простое создание диалога без RPC функции
                const { data: dialogData, error: dialogError } = await supabase
                    .from('dialogs')
                    .insert({
                        user_id: currentUser.id,
                        status: 'open'
                    })
                    .select()
                    .single();

                if (dialogError) {
                    console.error('❌ Ошибка создания диалога:', dialogError);
                } else {
                    currentDialogId = dialogData.id;
                    console.log('✅ Диалог создан с ID:', currentDialogId);
                    
                    // Добавляем первое сообщение
                    console.log('💬 Добавление первого сообщения...');
                    const { error: messageError } = await supabase
                        .from('messages')
                        .insert({
                            dialog_id: currentDialogId,
                            sender_id: currentUser.id,
                            content: text,
                            is_from_admin: false
                        });

                    if (messageError) {
                        console.error('❌ Ошибка отправки сообщения:', messageError);
                    } else {
                        console.log('✅ Сообщение сохранено в БД');
                    }
                }
            } else {
                console.log('💬 Добавление сообщения к диалогу:', currentDialogId);
                
                // Добавляем сообщение к существующему диалогу
                const { error } = await supabase
                    .from('messages')
                    .insert({
                        dialog_id: currentDialogId,
                        sender_id: currentUser.id,
                        content: text,
                        is_from_admin: false
                    });

                if (error) {
                    console.error('❌ Ошибка отправки сообщения:', error);
                } else {
                    console.log('✅ Сообщение сохранено в БД');
                }
            }
        } else {
            console.warn('⚠️ Supabase или пользователь недоступны, работаем локально');
        }

        // Симуляция ответа админа
        setTimeout(() => {
            appendMessage({ 
                text: 'Спасибо за сообщение! Администратор ответит в ближайшее время.', 
                inbound: true 
            });
        }, 1000);

    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        // Продолжаем работу локально
    }
}

// Обработка загрузки файлов
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        appendMessage({ text: `📎 Файл прикреплён: ${fileName}`, inbound: false });
        // Здесь можно добавить загрузку файла в Supabase Storage
    }
}

// Отображение сообщения в чате
function appendMessage({ text, inbound = false }) {
    const chat = document.getElementById('chat');
    const wrap = document.createElement('div');
    wrap.className = `msg ${inbound ? 'msg-in' : 'msg-out'}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = inbound ? 'Администратор • сейчас' : 'Вы • сейчас';
    
    wrap.appendChild(bubble);
    wrap.appendChild(meta);
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
}

// === АДМИНСКИЕ ФУНКЦИИ ===

// Открытие панели администратора
async function openAdminPanel() {
    if (!isAdmin) return;

    try {
        if (!supabase) {
            document.getElementById('dialogsList').innerHTML = '<p style="color: #a6a8ad; text-align: center; padding: 40px;">База данных недоступна</p>';
            document.getElementById('adminPanel').style.display = 'block';
            return;
        }

        // Простой запрос диалогов без RPC функции
        const { data: dialogs, error: dialogsError } = await supabase
            .from('dialogs')
            .select(`
                id,
                user_id,
                status,
                created_at,
                updated_at
            `)
            .in('status', ['open', 'in_progress'])
            .order('updated_at', { ascending: false });

        if (dialogsError) {
            console.error('Ошибка загрузки диалогов:', dialogsError);
            document.getElementById('dialogsList').innerHTML = '<p style="color: #a6a8ad; text-align: center; padding: 40px;">Ошибка загрузки диалогов</p>';
            document.getElementById('adminPanel').style.display = 'block';
            return;
        }

        // Получаем информацию о пользователях
        const userIds = [...new Set(dialogs.map(d => d.user_id))];
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('telegram_id, username, first_name, last_name')
            .in('telegram_id', userIds);

        if (usersError) {
            console.error('Ошибка загрузки пользователей:', usersError);
        }

        // Получаем количество сообщений для каждого диалога
        const dialogsWithStats = await Promise.all(dialogs.map(async (dialog) => {
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('dialog_id', dialog.id);

            const user = users?.find(u => u.telegram_id === dialog.user_id) || {};

            return {
                dialog_id: dialog.id,
                user_telegram_id: dialog.user_id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                status: dialog.status,
                message_count: count || 0,
                last_message_at: dialog.updated_at,
                created_at: dialog.created_at
            };
        }));

        const dialogsList = document.getElementById('dialogsList');
        dialogsList.innerHTML = '';

        if (dialogsWithStats.length === 0) {
            dialogsList.innerHTML = '<p style="color: #a6a8ad; text-align: center; padding: 40px;">Нет активных диалогов</p>';
        } else {
            dialogsWithStats.forEach(dialog => {
                const dialogItem = createDialogItem(dialog);
                dialogsList.appendChild(dialogItem);
            });
        }

        document.getElementById('adminPanel').style.display = 'block';
    } catch (error) {
        console.error('Ошибка загрузки диалогов:', error);
        document.getElementById('dialogsList').innerHTML = '<p style="color: #a6a8ad; text-align: center; padding: 40px;">Ошибка загрузки диалогов</p>';
        document.getElementById('adminPanel').style.display = 'block';
    }
}

// Создание элемента диалога в списке
function createDialogItem(dialog) {
    const item = document.createElement('div');
    item.className = 'dialog-item';
    item.onclick = () => openAdminChat(dialog);

    const userName = dialog.username 
        ? `@${dialog.username}` 
        : `${dialog.first_name || 'Пользователь'} ${dialog.last_name || ''}`.trim();

    const lastMessageDate = dialog.last_message_at 
        ? new Date(dialog.last_message_at).toLocaleString('ru-RU')
        : new Date(dialog.created_at).toLocaleString('ru-RU');

    item.innerHTML = `
        <div class="dialog-user">${userName}</div>
        <div class="dialog-meta">
            <span>${lastMessageDate}</span>
            <span class="dialog-status ${dialog.status}">${
                dialog.status === 'open' ? 'Новый' : 
                dialog.status === 'in_progress' ? 'На рассмотрении' : 'Закрыт'
            }</span>
        </div>
        <div style="color: #a6a8ad; font-size: 12px; margin-top: 4px;">
            Сообщений: ${dialog.message_count}
        </div>
    `;

    return item;
}

// Открытие чата с пользователем
async function openAdminChat(dialog) {
    currentDialogId = dialog.dialog_id;
    currentChatUserId = dialog.user_telegram_id;

    const userName = dialog.username 
        ? `@${dialog.username}` 
        : `${dialog.first_name || 'Пользователь'} ${dialog.last_name || ''}`.trim();

    document.getElementById('chatUserName').textContent = `Диалог с ${userName}`;

    // Загрузка сообщений
    await loadChatMessages();

    // Скрытие панели и показ чата
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminChatModal').style.display = 'block';
}

// Загрузка сообщений диалога
async function loadChatMessages() {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('dialog_id', currentDialogId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const messagesContainer = document.getElementById('adminChatMessages');
        messagesContainer.innerHTML = '';

        data.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `admin-message ${message.is_from_admin ? 'admin' : 'user'}`;
            messageDiv.textContent = message.content;
            messagesContainer.appendChild(messageDiv);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
    }
}

// Отправка сообщения от админа
async function sendAdminMessage() {
    const input = document.getElementById('adminMessageInput');
    const text = input.value.trim();
    if (!text || !currentDialogId || !currentUser) return;

    try {
        const { error } = await supabase
            .from('messages')
            .insert({
                dialog_id: currentDialogId,
                sender_id: currentUser.id,
                content: text,
                is_from_admin: true
            });

        if (error) throw error;

        // Отображение сообщения
        const messagesContainer = document.getElementById('adminChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'admin-message admin';
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        input.value = '';
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
    }
}

// Обновление статуса диалога
async function updateDialogStatus(status) {
    if (!currentDialogId) return;

    try {
        const { error } = await supabase
            .from('dialogs')
            .update({ 
                status,
                admin_id: currentUser.id,
                ...(status === 'closed' && { closed_at: new Date().toISOString() })
            })
            .eq('id', currentDialogId);

        if (error) throw error;

        if (status === 'closed') {
            document.getElementById('adminChatModal').style.display = 'none';
            alert('Диалог завершён');
        } else {
            alert('Статус диалога обновлён');
        }
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
    }
}