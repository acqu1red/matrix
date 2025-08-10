import { SUPABASE_CONFIG, CONFIG, tg } from './config.js';

// Инициализация Supabase
const supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// Элементы DOM
const chat = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const fileInput = document.getElementById('fileInput');
const attachBtn = document.getElementById('attachBtn');

// Админ-панель элементы
const adminPanelBtn = document.getElementById('adminPanelBtn');
const adminPanel = document.getElementById('adminPanel');
const backToChat = document.getElementById('backToChat');
const conversationsList = document.getElementById('conversationsList');

// Диалог элементы
const conversationDialog = document.getElementById('conversationDialog');
const dialogUsername = document.getElementById('dialogUsername');
const dialogMeta = document.getElementById('dialogMeta');
const dialogChat = document.getElementById('dialogChat');
const dialogMessageInput = document.getElementById('dialogMessageInput');
const dialogSendBtn = document.getElementById('dialogSendBtn');
const dialogFileInput = document.getElementById('dialogFileInput');
const dialogAttachBtn = document.getElementById('dialogAttachBtn');
const backToAdmin = document.getElementById('backToAdmin');

const userFooter = document.getElementById('userFooter');
const mainContent = document.getElementById('mainContent');

// Проверяем наличие критических элементов
console.log('Проверка DOM элементов:', {
    chat: !!chat,
    messageInput: !!messageInput,
    sendBtn: !!sendBtn,
    adminPanelBtn: !!adminPanelBtn,
    adminPanel: !!adminPanel
});

// Состояние приложения
let currentConversationId = null;
let currentView = 'chat'; // 'chat', 'admin', 'dialog'
let isAdmin = false;
let currentUserId = null;
let currentFilter = 'pending'; // 'all', 'pending', 'messages'
let allConversations = []; // Кэш всех диалогов

// Инициализация приложения
async function initApp() {
    // Ждем загрузки Supabase
    if (typeof supabase === 'undefined') {
        console.log('Supabase еще не загружен, ждем...');
        setTimeout(initApp, 100);
        return;
    }
    
    console.log('Supabase загружен, инициализируем приложение...');
    
    if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
        
        // Получаем данные пользователя
        const user = tg.initDataUnsafe?.user;
        if (user) {
            currentUserId = user.id;
            console.log('Пользователь определен:', user);
            
            try {
                // Создаем или получаем пользователя в базе
                await createOrGetUser(user);
                
                // Проверяем права админа
                await checkAdminRights();
            } catch (error) {
                console.error('Ошибка при инициализации пользователя:', error);
                showError('Ошибка инициализации: ' + error.message);
            }
        } else {
            console.log('Пользователь не определен в Telegram WebApp');
        }
    } else {
        console.log('Telegram WebApp не доступен');
    }
    
    // Проверяем URL параметры для прямого перехода к диалогу
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');
    if (conversationId && !isAdmin) {
        // Загружаем конкретный диалог для пользователя
        loadUserConversation(conversationId);
    }
    
    setupEventListeners();
}

// Создание или получение пользователя
async function createOrGetUser(userData) {
    try {
        console.log('Создаем или получаем пользователя:', userData);
        
        const { data, error } = await supabaseClient
            .from('users')
            .upsert({
                telegram_id: userData.id,
                username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name
            })
            .select()
            .single();
            
        if (error) {
            console.error('Ошибка при создании/получении пользователя:', error);
            throw error;
        }
        
        console.log('Пользователь создан/получен:', data);
        return data;
    } catch (error) {
        console.error('Ошибка при создании пользователя:', error);
        throw error;
    }
}

// Проверка прав администратора
async function checkAdminRights() {
    if (!currentUserId) {
        console.log('Нет currentUserId для проверки прав админа');
        return;
    }
    
    try {
        console.log('Проверяем права админа для пользователя:', currentUserId);
        
        const { data, error } = await supabaseClient
            .rpc('is_admin', { user_telegram_id: currentUserId });
            
        if (error) {
            console.error('Ошибка RPC is_admin:', error);
            throw error;
        }
        
        console.log('Результат проверки прав админа:', data);
        isAdmin = data || false;
        
        if (isAdmin) {
            console.log('Пользователь является администратором');
            if (adminPanelBtn) {
                adminPanelBtn.classList.remove('hidden');
            }
            const adminFooter = document.getElementById('adminFooter');
            if (adminFooter) {
                adminFooter.classList.add('active');
            }
        } else {
            console.log('Пользователь не является администратором');
        }
    } catch (error) {
        console.error('Ошибка при проверке прав админа:', error);
        isAdmin = false;
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('Настраиваем обработчики событий...');
    
    // Обычный чат
    if (sendBtn) {
        sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!sendBtn.disabled) {
                sendMessage();
            }
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!sendBtn.disabled) {
                    sendMessage();
                }
            }
        });
    }
    
    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileAttach);
    }
    
    // Админ-панель
    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', showAdminPanel);
    }
    if (backToChat) {
        backToChat.addEventListener('click', showChat);
    }
    if (backToAdmin) {
        backToAdmin.addEventListener('click', showAdminPanel);
    }
    
    // Диалог админа
    if (dialogSendBtn) {
        dialogSendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!dialogSendBtn.disabled) {
                sendAdminMessage();
            }
        });
    }
    
    if (dialogMessageInput) {
        dialogMessageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!dialogSendBtn.disabled) {
                    sendAdminMessage();
                }
            }
        });
    }
    
    if (dialogAttachBtn && dialogFileInput) {
        dialogAttachBtn.addEventListener('click', () => dialogFileInput.click());
        dialogFileInput.addEventListener('change', handleDialogFileAttach);
    }
    
    console.log('Обработчики событий настроены');
}

// Установка фильтра
function setFilter(filter) {
    console.log('Установка фильтра:', filter);
    currentFilter = filter;
    
    // Обновляем активный класс
    document.querySelectorAll('.stat-item.clickable').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
    
    console.log('Всего диалогов в кэше:', allConversations.length);
    
    // Перерисовываем список с новым фильтром
    renderConversationsList(allConversations);
}

// Функции отправки сообщений
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) {
        console.log('Пустое сообщение, не отправляем');
        return;
    }
    
    if (!currentUserId) {
        console.error('Нет currentUserId для отправки сообщения');
        showError('Ошибка: пользователь не определен');
        return;
    }
    
    console.log('Отправляем сообщение:', text, 'от пользователя:', currentUserId);
    
    // Блокируем кнопку и показываем состояние загрузки
    const sendBtn = document.getElementById('sendBtn');
    const originalContent = sendBtn.innerHTML;
    sendBtn.disabled = true;
    sendBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
    `;
    
    // Сразу отображаем сообщение для мгновенной обратной связи
    appendMessage({ text, inbound: false });
    messageInput.value = '';
    
    try {
        // Создаем или получаем диалог
        const conversationId = await createOrGetConversation();
        
        if (!conversationId) {
            throw new Error('Не удалось создать диалог');
        }
        
        console.log('Диалог создан/получен:', conversationId);
        
        // Добавляем сообщение в базу данных
        const { data, error } = await supabaseClient
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: currentUserId,
                content: text,
                message_type: 'text'
            })
            .select()
            .single();
            
        if (error) {
            console.error('Ошибка при добавлении сообщения в БД:', error);
            throw error;
        }
        
        console.log('Сообщение добавлено в БД:', data);
        
        // Обновляем статус диалога на 'open' (ожидает ответа админа)
        const { error: updateError } = await supabaseClient
            .from('conversations')
            .update({ 
                status: 'open',
                admin_id: null // Сбрасываем админа, так как пользователь написал новое сообщение
            })
            .eq('id', conversationId);
            
        if (updateError) {
            console.error('Ошибка при обновлении статуса диалога:', updateError);
        } else {
            console.log('Статус диалога обновлен');
        }
        
        console.log('Сообщение успешно отправлено:', data);
        
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        showError('Не удалось отправить сообщение: ' + error.message);
        
        // Можно добавить визуальную индикацию ошибки
        const lastMessage = chat.lastElementChild;
        if (lastMessage) {
            lastMessage.style.opacity = '0.7';
            lastMessage.style.borderLeft = '3px solid #ff4444';
        }
    } finally {
        // Восстанавливаем кнопку
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalContent;
    }
}

async function sendAdminMessage() {
    const text = dialogMessageInput.value.trim();
    if (!text || !currentConversationId || !isAdmin) return;
    
    // Блокируем кнопку и показываем состояние загрузки
    const dialogSendBtn = document.getElementById('dialogSendBtn');
    const originalContent = dialogSendBtn.innerHTML;
    dialogSendBtn.disabled = true;
    dialogSendBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
    `;
    
    // Сразу отображаем сообщение для мгновенной обратной связи
    appendDialogMessage({ 
        text, 
        isAdmin: true, 
        timestamp: new Date().toLocaleTimeString() 
    });
    
    dialogMessageInput.value = '';
    
    try {
        // Добавляем сообщение в базу
        const { data, error } = await supabaseClient
            .from('messages')
            .insert({
                conversation_id: currentConversationId,
                sender_id: currentUserId,
                content: text,
                message_type: 'text'
            })
            .select()
            .single();
            
        if (error) throw error;
        
        // Назначаем админа на диалог и помечаем как отвеченный
        await supabaseClient
            .from('conversations')
            .update({ 
                admin_id: currentUserId, 
                status: 'answered' 
            })
            .eq('id', currentConversationId);
        
        console.log('Ответ админа успешно отправлен:', data);
        
        // Отправляем уведомление пользователю (через backend API)
        await notifyUser(currentConversationId);
        
        // Скрываем диалог из списка (если фильтр "Ожидают ответа")
        if (currentFilter === 'pending') {
            // Удаляем диалог из кэша
            allConversations = allConversations.filter(conv => conv.id !== currentConversationId);
            // Перерисовываем список
            renderConversationsList(allConversations);
        }
        
    } catch (error) {
        console.error('Ошибка при отправке ответа:', error);
        showError('Не удалось отправить ответ');
        
        // Визуальная индикация ошибки
        const lastMessage = dialogChat.lastElementChild;
        if (lastMessage) {
            lastMessage.style.opacity = '0.7';
            lastMessage.style.borderLeft = '3px solid #ff4444';
        }
    } finally {
        // Восстанавливаем кнопку
        dialogSendBtn.disabled = false;
        dialogSendBtn.innerHTML = originalContent;
    }
}

// Создание или получение диалога
async function createOrGetConversation() {
    try {
        console.log('Создаем или получаем диалог для пользователя:', currentUserId);
        
        // Проверяем существующий открытый диалог
        const { data: existing, error: existingError } = await supabaseClient
            .from('conversations')
            .select('id')
            .eq('user_id', currentUserId)
            .eq('status', 'open')
            .single();
            
        if (existingError && existingError.code !== 'PGRST116') {
            // PGRST116 - "не найдено", это нормально
            console.error('Ошибка при поиске существующего диалога:', existingError);
            throw existingError;
        }
        
        if (existing) {
            console.log('Найден существующий диалог:', existing.id);
            return existing.id;
        }
        
        console.log('Создаем новый диалог...');
        
        // Создаем новый диалог
        const { data, error } = await supabaseClient
            .from('conversations')
            .insert({
                user_id: currentUserId,
                status: 'open'
            })
            .select()
            .single();
            
        if (error) {
            console.error('Ошибка при создании нового диалога:', error);
            throw error;
        }
        
        console.log('Новый диалог создан:', data.id);
        return data.id;
        
    } catch (error) {
        console.error('Ошибка при создании диалога:', error);
        return null;
    }
}

// Загрузка диалогов для админ-панели
async function loadAdminConversations() {
    if (!isAdmin) return;
    
    try {
        console.log('Загружаем диалоги для админа...');
        
        // Загружаем статистику
        await loadAdminStats();
        
        // Сначала попробуем простой запрос к таблице
        const { data: testData, error: testError } = await supabaseClient
            .from('users')
            .select('*')
            .limit(1);
            
        console.log('Тест подключения:', { testData, testError });
        
        // Сначала тестируем простую функцию
        const { data: testRpc, error: testRpcError } = await supabaseClient
            .rpc('test_connection');
            
        console.log('Тест RPC:', { testRpc, testRpcError });
        
        // Проверяем таблицы
        const { data: tableCheck, error: tableError } = await supabaseClient
            .rpc('check_tables');
            
        console.log('Проверка таблиц:', { tableCheck, tableError });
        
        // Пробуем простую функцию диалогов
        const { data: simpleData, error: simpleError } = await supabaseClient
            .rpc('get_conversations_simple');
            
        console.log('Простые диалоги:', { simpleData, simpleError });
        
        // Теперь пробуем основную RPC
        const { data, error } = await supabaseClient
            .rpc('get_admin_conversations');
            
        console.log('RPC результат:', { data, error });
        console.log('Данные диалогов:', data);
        
        if (error) {
            console.error('RPC ошибка:', error);
            // Показываем простые диалоги если основная функция не работает
            if (simpleData && simpleData.length > 0) {
                console.log('Используем простые диалоги');
                renderConversationsList(simpleData.map(conv => ({
                    ...conv,
                    username: `Пользователь #${conv.user_id}`,
                    first_name: `Пользователь #${conv.user_id}`,
                    last_name: null,
                    last_message_at: conv.created_at,
                    message_count: 0,
                    last_message: 'Нет сообщений',
                    status: 'open'
                })));
                return;
            }
            // Если нет диалогов вообще - показываем пустое состояние
            conversationsList.innerHTML = '<div class="loading">Нет активных диалогов</div>';
            return;
        }
        
        console.log('Диалоги загружены:', data);
        
        // Проверяем структуру данных
        if (data && data.length > 0) {
            console.log('Первый диалог:', data[0]);
            console.log('Поля первого диалога:', Object.keys(data[0]));
            console.log('Username первого диалога:', data[0].username);
            console.log('Message count первого диалога:', data[0].message_count);
            console.log('Last message первого диалога:', data[0].last_message);
        }
        
        renderConversationsList(data);
        
    } catch (error) {
        console.error('Ошибка при загрузке диалогов:', error);
        conversationsList.innerHTML = '<div class="loading">Ошибка загрузки: ' + error.message + '</div>';
    }
}

// Загрузка статистики для админ-панели
async function loadAdminStats() {
    try {
        const { data, error } = await supabaseClient
            .rpc('get_conversations_stats');
            
        if (error) {
            console.error('Ошибка при загрузке статистики:', error);
            return;
        }
        
        if (data && data.length > 0) {
            const stats = data[0];
            document.getElementById('totalConversations').textContent = stats.total_conversations || 0;
            document.getElementById('openConversations').textContent = stats.open_conversations || 0;
            document.getElementById('totalMessages').textContent = stats.total_messages || 0;
        }
    } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
    }
}

// Фильтрация диалогов
function filterConversations(conversations, filter) {
    console.log('Фильтрация диалогов:', { conversations: conversations?.length, filter });
    
    if (!conversations) return [];
    
    let filtered;
    switch (filter) {
        case 'all':
            filtered = conversations;
            console.log('Фильтр "all": показываем все диалоги');
            break;
        case 'pending':
            // Показываем только диалоги, где последнее сообщение от пользователя (не админа)
            filtered = conversations.filter(conv => {
                // Проверяем, есть ли сообщения в диалоге
                if (!conv.last_message || conv.last_message === 'Нет сообщений') {
                    return false; // Диалоги без сообщений не показываем
                }
                
                // Проверяем, от кого последнее сообщение
                // Если last_message_sender_id не равен admin_id, то последнее сообщение от пользователя
                const lastMessageFromUser = !conv.last_message_sender_is_admin;
                console.log(`Диалог ${conv.id}: последнее сообщение от пользователя=${lastMessageFromUser}, показываем=${lastMessageFromUser}`);
                return lastMessageFromUser;
            });
            console.log('Фильтр "pending": показываем диалоги с последним сообщением от пользователя');
            break;
        default:
            filtered = conversations;
            console.log('Неизвестный фильтр, показываем все');
    }
    
    console.log(`Результат фильтрации: ${filtered.length} диалогов из ${conversations.length}`);
    return filtered;
}

// Отображение списка диалогов
function renderConversationsList(conversations) {
    console.log('renderConversationsList вызвана с:', conversations);
    
    if (!conversationsList) {
        console.error('Элемент списка диалогов не найден');
        return;
    }
    
    // Сохраняем все диалоги в кэш
    allConversations = conversations || [];
    
    // Применяем фильтр
    const filteredConversations = filterConversations(allConversations, currentFilter);
    
    if (!filteredConversations || filteredConversations.length === 0) {
        console.log('Нет диалогов для отображения после фильтрации');
        conversationsList.innerHTML = '<div class="loading">Нет диалогов по выбранному фильтру</div>';
        return;
    }
    
    const html = filteredConversations.map(conv => {
        console.log('Обрабатываем диалог:', conv);
        
        // Используем username из базы данных (уже обработанный в SQL)
        const username = conv.username || 'Неизвестный пользователь';
        const lastMessage = conv.last_message || 'Нет сообщений';
        const messageCount = conv.message_count || 0;
        const date = new Date(conv.last_message_at).toLocaleDateString('ru-RU');
        const time = new Date(conv.last_message_at).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Создаем аватар с первой буквой имени
        const avatarText = username.charAt(0).toUpperCase();
        
        // Определяем статус диалога
        const statusClass = conv.status === 'open' ? 'pending' : 
                           conv.status === 'in_progress' ? '' : 'closed';
        
        // Формируем текст для предварительного просмотра
        const previewText = messageCount > 0 ? `${messageCount} сообщений` : 'Нет сообщений';
        
        console.log('Данные для отображения:', {
            username,
            lastMessage,
            messageCount,
            date,
            time,
            avatarText,
            statusClass,
            previewText
        });
        
        return `
            <div class="conversation-item" data-conversation-id="${conv.id}" data-user-id="${conv.user_id}">
                <div class="conversation-status ${statusClass}"></div>
                <div class="conversation-header">
                    <div class="conversation-user">
                        <div class="user-avatar">${avatarText}</div>
                        ${username}
                    </div>
                    <div class="conversation-time">${date} ${time}</div>
                </div>
                <div class="conversation-meta">
                    <span>ID: ${conv.user_id}</span>
                    <span class="message-count">${messageCount} сообщений</span>
                </div>
                <div class="conversation-preview">${previewText}</div>
            </div>
        `;
    }).join('');
    
    console.log('Сгенерированный HTML:', html);
    conversationsList.innerHTML = html;
    
    // Добавляем обработчики клика
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
            const conversationId = item.dataset.conversationId;
            const userId = item.dataset.userId;
            openConversationDialog(conversationId, userId);
        });
    });
}

// Открытие диалога с пользователем
async function openConversationDialog(conversationId, userId) {
    currentConversationId = conversationId;
    
    try {
        // Получаем информацию о пользователе
        const { data: user, error: userError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();
            
        if (userError) throw userError;
        
        // Получаем сообщения диалога
        const { data: messages, error: messagesError } = await supabaseClient
            .rpc('get_conversation_messages', { conv_id: conversationId });
            
        if (messagesError) throw messagesError;
        
        // Отображаем информацию о пользователе
        const username = user.username || user.first_name || `Пользователь #${user.telegram_id}`;
        dialogUsername.textContent = username;
        dialogMeta.textContent = `Сообщений: ${messages.length}`;
        
        // Отображаем сообщения
        renderDialogMessages(messages);
        
        // Отмечаем сообщения как прочитанные
        await markMessagesAsRead(conversationId);
        
        showConversationDialog();
        
    } catch (error) {
        console.error('Ошибка при открытии диалога:', error);
        showError('Не удалось загрузить диалог');
    }
}

// Отображение сообщений в диалоге
function renderDialogMessages(messages) {
    if (!dialogChat) {
        console.error('Элемент диалога не найден');
        return;
    }
    
    dialogChat.innerHTML = '';
    
    messages.forEach(message => {
        appendDialogMessage({
            text: message.content,
            isAdmin: message.sender_is_admin,
            timestamp: new Date(message.created_at).toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        });
    });
    
    dialogChat.scrollTop = dialogChat.scrollHeight;
}

// Добавление сообщения в диалог
function appendDialogMessage({ text, isAdmin, timestamp }) {
    if (!dialogChat) {
        console.error('Элемент диалога не найден');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isAdmin ? 'admin' : 'user'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.textContent = text;
    
    const timeDiv = document.createElement('div');
    timeDiv.style.fontSize = '11px';
    timeDiv.style.opacity = '0.7';
    timeDiv.style.marginTop = '4px';
    timeDiv.textContent = timestamp;
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    
    dialogChat.appendChild(messageDiv);
    dialogChat.scrollTop = dialogChat.scrollHeight;
}

// Отметка сообщений как прочитанных
async function markMessagesAsRead(conversationId) {
    try {
        await supabaseClient
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', currentUserId);
    } catch (error) {
        console.error('Ошибка при отметке сообщений:', error);
    }
}

// Уведомление пользователя через Telegram Bot API
async function notifyUser(conversationId) {
    try {
        // Получаем информацию о диалоге
        const { data: conversation, error } = await supabaseClient
            .from('conversations')
            .select('user_id')
            .eq('id', conversationId)
            .single();
            
        if (error || !conversation) {
            console.error('Ошибка при получении диалога:', error);
            return;
        }
        
        const botToken = '8354723250:AAEWcX6OojEi_fN-RAekppNMVTAsQDU0wvo';
        const userId = conversation.user_id;
        
        const message = {
            chat_id: userId,
            text: '💬 <b>У вас новый ответ от администратора!</b>\n\nАдминистратор ответил на ваш вопрос.',
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '👀 Посмотреть ответ',
                        web_app: {
                            url: `https://acqu1red.github.io/tourmalineGG/?conversation=${conversationId}`
                        }
                    }
                ]]
            }
        };
        
        // Отправляем уведомление через Telegram Bot API
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });
        
        if (!response.ok) {
            throw new Error('Failed to send notification');
        }
        
        console.log('Уведомление отправлено пользователю');
        
    } catch (error) {
        console.error('Ошибка при отправке уведомления:', error);
    }
}

// Навигация между экранами
function showChat() {
    currentView = 'chat';
    if (adminPanel) adminPanel.classList.remove('active');
    if (conversationDialog) conversationDialog.classList.remove('active');
    if (chat) chat.style.display = 'flex';
    if (userFooter) userFooter.style.display = 'flex';
    
    const dialogFooter = document.querySelector('.conversation-dialog footer');
    if (dialogFooter) dialogFooter.style.display = 'none';
    
    // Показываем админ footer только если пользователь админ
    if (isAdmin) {
        const adminFooter = document.getElementById('adminFooter');
        if (adminFooter) adminFooter.classList.add('active');
    }
}

function showAdminPanel() {
    if (!isAdmin) return;
    
    currentView = 'admin';
    if (chat) chat.style.display = 'none';
    if (conversationDialog) conversationDialog.classList.remove('active');
    if (adminPanel) adminPanel.classList.add('active');
    if (userFooter) userFooter.style.display = 'none';
    
    const adminFooter = document.getElementById('adminFooter');
    if (adminFooter) adminFooter.classList.remove('active');
    
    const dialogFooter = document.querySelector('.conversation-dialog footer');
    if (dialogFooter) dialogFooter.style.display = 'none';
    
    // Добавляем обработчики фильтров после показа панели
    setTimeout(() => {
        const filterAll = document.getElementById('filterAll');
        const filterPending = document.getElementById('filterPending');
        
        if (filterAll && filterPending) {
            // Удаляем старые обработчики, если они есть
            filterAll.removeEventListener('click', () => setFilter('all'));
            filterPending.removeEventListener('click', () => setFilter('pending'));
            
            // Добавляем новые обработчики
            filterAll.addEventListener('click', () => setFilter('all'));
            filterPending.addEventListener('click', () => setFilter('pending'));
        }
    }, 100);
    
    loadAdminConversations();
}

function showConversationDialog() {
    if (!isAdmin) return;
    
    currentView = 'dialog';
    if (chat) chat.style.display = 'none';
    if (adminPanel) adminPanel.classList.remove('active');
    if (conversationDialog) conversationDialog.classList.add('active');
    if (userFooter) userFooter.style.display = 'none';
    
    const adminFooter = document.getElementById('adminFooter');
    if (adminFooter) adminFooter.classList.remove('active');
    
    const dialogFooter = document.querySelector('.conversation-dialog footer');
    if (dialogFooter) dialogFooter.style.display = 'flex';
}

// Загрузка диалога пользователя по ID
async function loadUserConversation(conversationId) {
    try {
        const { data: messages, error } = await supabaseClient
            .rpc('get_conversation_messages', { conv_id: conversationId });
            
        if (error) throw error;
        
        // Отображаем сообщения
        chat.innerHTML = '';
        messages.forEach(message => {
            appendMessage({
                text: message.content,
                inbound: message.sender_is_admin
            });
        });
        
        currentConversationId = conversationId;
        
    } catch (error) {
        console.error('Ошибка при загрузке диалога пользователя:', error);
    }
}

// Обработка прикрепления файлов
function handleFileAttach() {
    if (fileInput.files.length > 0) {
        appendMessage({ 
            text: `📎 Файл прикреплён: ${fileInput.files[0].name}`, 
            inbound: false 
        });
    }
}

function handleDialogFileAttach() {
    if (dialogFileInput.files.length > 0) {
        appendDialogMessage({ 
            text: `📎 Файл прикреплён: ${dialogFileInput.files[0].name}`, 
            isAdmin: true,
            timestamp: new Date().toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        });
    }
}

// Функции для совместимости с оригинальным script.js
function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text) e.textContent = text;
    return e;
}

function appendMessage({ text, inbound = false }) {
    if (!chat) {
        console.error('Элемент чата не найден');
        return;
    }
    
    const wrap = el('div', `msg ${inbound ? 'msg-in' : 'msg-out'}`);
    const bubble = el('div', 'bubble', text);
    const meta = el('div', 'meta', inbound ? 'Администратор • сейчас' : 'Вы • сейчас');
    wrap.appendChild(bubble);
    wrap.appendChild(meta);
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
}

// Показ ошибок
function showError(message) {
    console.error('Ошибка:', message);
    if (tg && tg.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);