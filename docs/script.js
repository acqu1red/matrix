import { SUPABASE_CONFIG, CONFIG, tg } from './config.js';

// Инициализация Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

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

// Состояние приложения
let currentConversationId = null;
let currentView = 'chat'; // 'chat', 'admin', 'dialog'
let isAdmin = false;
let currentUserId = null;
let currentFilter = 'pending'; // 'all', 'pending', 'messages'
let allConversations = []; // Кэш всех диалогов

// Новые переменные для пагинации
let messagePage = 0;
let messagesPerPage = 20;
let hasMoreMessages = true;
let isLoadingMessages = false;
let allMessages = []; // Кэш всех сообщений для текущего диалога
let isScrolledToBottom = true;

// Инициализация приложения
async function initApp() {
    if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
        
        // Получаем данные пользователя
        const user = tg.initDataUnsafe?.user;
        if (user) {
            currentUserId = user.id;
            
            // Создаем или получаем пользователя в базе
            await createOrGetUser(user);
            
            // Проверяем права админа
            await checkAdminRights();
        }
    }
    
    // Проверяем URL параметры для прямого перехода к диалогу
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');
    const adminConversationId = urlParams.get('admin_conversation');
    
    if (conversationId && !isAdmin) {
        // Загружаем конкретный диалог для пользователя
        loadUserConversation(conversationId);
    } else if (adminConversationId && isAdmin) {
        // Загружаем диалог для администратора
        loadAdminConversationDirect(adminConversationId);
    }
    
    setupEventListeners();
    setupScrollTracking();
    
    // Запускаем автоматическое обновление сообщений
    startMessagePolling();
}

// Создание или получение пользователя
async function createOrGetUser(userData) {
    try {
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
            
        if (error) throw error;
        return data;
    } catch (error) {
        // console.error('Ошибка при создании пользователя:', error);
    }
}

// Проверка прав администратора
async function checkAdminRights() {
    if (!currentUserId) return;
    
    try {
        const { data, error } = await supabaseClient
            .rpc('is_admin', { user_telegram_id: currentUserId });
            
        if (error) throw error;
        
        isAdmin = data || false;
        
        if (isAdmin) {
            adminPanelBtn.classList.remove('hidden');
            document.getElementById('adminFooter').classList.add('active');
        }
    } catch (error) {
        // console.error('Ошибка при проверке прав админа:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обычный чат
    sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!sendBtn.disabled) {
            sendMessage();
        }
    });
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) {
                sendMessage();
            }
        }
    });
    
    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileAttach);
    
    // Админ-панель
    adminPanelBtn.addEventListener('click', showAdminPanel);
    backToChat.addEventListener('click', showChat);
    backToAdmin.addEventListener('click', showAdminPanel);
    

    
    // Диалог админа
    dialogSendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!dialogSendBtn.disabled) {
            sendAdminMessage();
        }
    });
    
    dialogMessageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!dialogSendBtn.disabled) {
                sendAdminMessage();
            }
        }
    });
    
    dialogAttachBtn.addEventListener('click', () => dialogFileInput.click());
    dialogFileInput.addEventListener('change', handleDialogFileAttach);
}

// Установка фильтра
function setFilter(filter) {
    currentFilter = filter;
    
    // Обновляем активный класс
    document.querySelectorAll('.stat-item.clickable').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
    
    // Перерисовываем список с новым фильтром
    renderConversationsList(allConversations);
}

// Функции отправки сообщений
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentUserId) return;
    
    // Блокируем кнопку и показываем состояние загрузки
    const sendBtn = document.getElementById('sendBtn');
    const attachBtn = document.getElementById('attachBtn');
    const originalSendContent = sendBtn.innerHTML;
    const originalAttachContent = attachBtn.innerHTML;
    
    // Блокируем обе кнопки
    sendBtn.disabled = true;
    attachBtn.disabled = true;
    
    // Красивая анимация загрузки для кнопки отправки
    sendBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" class="loading-spinner">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
    `;
    
    // Анимация для кнопки прикрепления
    attachBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-pulse">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
    `;
    
    // Добавляем класс для анимации поля ввода
    const inputContainer = messageInput.closest('.input-container');
    inputContainer.classList.add('loading-shimmer');
    
    // Сразу отображаем сообщение для мгновенной обратной связи
    const timestamp = new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    appendMessage({ text, inbound: false, timestamp });
    messageInput.value = '';
    
    try {
        // Создаем или получаем диалог
        const conversationId = await createOrGetConversation();
        
        if (!conversationId) {
            throw new Error('Не удалось создать диалог');
        }
        
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
            
        if (error) throw error;
        
        // Обновляем статус диалога на 'open' (ожидает ответа админа)
        await supabaseClient
            .from('conversations')
            .update({ 
                status: 'open',
                admin_id: null // Сбрасываем админа, так как пользователь написал новое сообщение
            })
            .eq('id', conversationId);
        
        // console.log('Сообщение успешно отправлено:', data);
        
        // Добавляем сообщение в кэш
        const newMessage = {
            id: data.id,
            content: text,
            sender_id: currentUserId,
            message_type: 'text',
            created_at: new Date().toISOString()
        };
        allMessages.push(newMessage);
        
        // Проверяем, нужно ли отправить уведомление администраторам
        await checkAndNotifyAdmins(conversationId, text, currentUserId);
        
    } catch (error) {
        // console.error('Ошибка при отправке сообщения:', error);
        showError('Не удалось отправить сообщение');
        
        // Можно добавить визуальную индикацию ошибки
        const lastMessage = chat.lastElementChild;
        if (lastMessage) {
            lastMessage.style.opacity = '0.7';
            lastMessage.style.borderLeft = '3px solid #ff4444';
        }
    } finally {
        // Восстанавливаем кнопки
        sendBtn.disabled = false;
        attachBtn.disabled = false;
        sendBtn.innerHTML = originalSendContent;
        attachBtn.innerHTML = originalAttachContent;
        
        // Убираем анимацию с поля ввода
        inputContainer.classList.remove('loading-shimmer');
    }
}

async function sendAdminMessage() {
    const text = dialogMessageInput.value.trim();
    if (!text || !currentConversationId || !isAdmin) return;
    
    // Блокируем кнопки и показываем состояние загрузки
    const dialogSendBtn = document.getElementById('dialogSendBtn');
    const dialogAttachBtn = document.getElementById('dialogAttachBtn');
    const originalSendContent = dialogSendBtn.innerHTML;
    const originalAttachContent = dialogAttachBtn.innerHTML;
    
    // Блокируем обе кнопки
    dialogSendBtn.disabled = true;
    dialogAttachBtn.disabled = true;
    
    // Красивая анимация загрузки для кнопки отправки
    dialogSendBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" class="loading-spinner">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
    `;
    
    // Анимация для кнопки прикрепления
    dialogAttachBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-pulse">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
    `;
    
    // Добавляем класс для анимации поля ввода
    const inputContainer = dialogMessageInput.closest('.input-container');
    inputContainer.classList.add('loading-shimmer');
    
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
        
        // console.log('Ответ админа успешно отправлен:', data);
        
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
        // console.error('Ошибка при отправке ответа:', error);
        showError('Не удалось отправить ответ');
        
        // Визуальная индикация ошибки
        const lastMessage = dialogChat.lastElementChild;
        if (lastMessage) {
            lastMessage.style.opacity = '0.7';
            lastMessage.style.borderLeft = '3px solid #ff4444';
        }
    } finally {
        // Восстанавливаем кнопки
        dialogSendBtn.disabled = false;
        dialogAttachBtn.disabled = false;
        dialogSendBtn.innerHTML = originalSendContent;
        dialogAttachBtn.innerHTML = originalAttachContent;
        
        // Убираем анимацию с поля ввода
        inputContainer.classList.remove('loading-shimmer');
    }
}

// Создание или получение диалога
async function createOrGetConversation() {
    try {
        // Проверяем существующий открытый диалог
        const { data: existing, error: existingError } = await supabaseClient
            .from('conversations')
            .select('id')
            .eq('user_id', currentUserId)
            .eq('status', 'open')
            .single();
            
        if (existing) {
            return existing.id;
        }
        
        // Создаем новый диалог
        const { data, error } = await supabaseClient
            .from('conversations')
            .insert({
                user_id: currentUserId,
                status: 'open'
            })
            .select()
            .single();
            
        if (error) throw error;
        return data.id;
        
    } catch (error) {
        // console.error('Ошибка при создании диалога:', error);
        return null;
    }
}

// Загрузка диалогов для админ-панели
async function loadAdminConversations() {
    if (!isAdmin) return;
    
    try {
        // console.log('Загружаем диалоги для админа...');
        
        // Загружаем статистику
        await loadAdminStats();
        
        // Сначала попробуем простой запрос к таблице
        const { data: testData, error: testError } = await supabaseClient
            .from('users')
            .select('*')
            .limit(1);
            
        // console.log('Тест подключения:', { testData, testError });
        
        // Сначала тестируем простую функцию
        const { data: testRpc, error: testRpcError } = await supabaseClient
            .rpc('test_connection');
            
        // console.log('Тест RPC:', { testRpc, testRpcError });
        
        // Проверяем таблицы
        const { data: tableCheck, error: tableError } = await supabaseClient
            .rpc('check_tables');
            
        // console.log('Проверка таблиц:', { tableCheck, tableError });
        
        // Пробуем простую функцию диалогов
        const { data: simpleData, error: simpleError } = await supabaseClient
            .rpc('get_conversations_simple');
            
        // console.log('Простые диалоги:', { simpleData, simpleError });
        
        // Теперь пробуем основную RPC
        const { data, error } = await supabaseClient
            .rpc('get_admin_conversations');
            
        // console.log('RPC результат:', { data, error });
        // console.log('Данные диалогов:', data);
        
        if (error) {
            // console.error('RPC ошибка:', error);
            // Показываем простые диалоги если основная функция не работает
            if (simpleData && simpleData.length > 0) {
                // console.log('Используем простые диалоги');
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
        
        // console.log('Диалоги загружены:', data);
        
        // Проверяем структуру данных
        if (data && data.length > 0) {
            // console.log('Первый диалог:', data[0]);
            // console.log('Поля первого диалога:', Object.keys(data[0]));
            // console.log('Username первого диалога:', data[0].username);
            // console.log('Message count первого диалога:', data[0].message_count);
            // console.log('Last message первого диалога:', data[0].last_message);
        }
        
        renderConversationsList(data);
        
    } catch (error) {
        // console.error('Ошибка при загрузке диалогов:', error);
        conversationsList.innerHTML = '<div class="loading">Ошибка загрузки: ' + error.message + '</div>';
    }
}

// Загрузка статистики для админ-панели
async function loadAdminStats() {
    try {
        const { data, error } = await supabaseClient
            .rpc('get_conversations_stats');
            
        if (error) {
            // console.error('Ошибка при загрузке статистики:', error);
            return;
        }
        
        if (data && data.length > 0) {
            const stats = data[0];
            document.getElementById('totalConversations').textContent = stats.total_conversations || 0;
            document.getElementById('openConversations').textContent = stats.open_conversations || 0;
            document.getElementById('totalMessages').textContent = stats.total_messages || 0;
        }
    } catch (error) {
        // console.error('Ошибка при загрузке статистики:', error);
    }
}

// Фильтрация диалогов
function filterConversations(conversations, filter) {
    if (!conversations) return [];
    
    switch (filter) {
        case 'all':
            return conversations;
        case 'pending':
            // Показываем только диалоги, на которые админ еще не ответил
            return conversations.filter(conv => {
                // Если у диалога нет admin_id или статус 'open', или последнее сообщение от пользователя
                return !conv.admin_id || conv.status === 'open' || conv.status === 'in_progress';
            });
        case 'messages':
            // Показываем диалоги с наибольшим количеством сообщений
            return [...conversations].sort((a, b) => (b.message_count || 0) - (a.message_count || 0));
        default:
            return conversations;
    }
}

// Отображение списка диалогов
function renderConversationsList(conversations) {
    // console.log('renderConversationsList вызвана с:', conversations);
    
    // Сохраняем все диалоги в кэш
    allConversations = conversations || [];
    
    // Применяем фильтр
    const filteredConversations = filterConversations(allConversations, currentFilter);
    
    if (!filteredConversations || filteredConversations.length === 0) {
        // console.log('Нет диалогов для отображения после фильтрации');
        conversationsList.innerHTML = '<div class="loading">Нет диалогов по выбранному фильтру</div>';
        return;
    }
    
    const html = filteredConversations.map(conv => {
        // console.log('Обрабатываем диалог:', conv);
        
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
        
        // console.log('Данные для отображения:', {
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
    
    // console.log('Сгенерированный HTML:', html);
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
    
    // console.log('Открытие диалога:', { conversationId, userId });
    
    try {
        // Получаем информацию о пользователе
        const { data: user, error: userError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();
            
        if (userError) {
            // console.error('Ошибка получения пользователя:', userError);
            throw userError;
        }
        
        // console.log('Пользователь найден:', user);
        
        // Получаем сообщения диалога
        let messages = null;
        let messagesError = null;
        
        try {
            const result = await supabaseClient
                .rpc('get_conversation_messages', { conv_id: conversationId });
            messages = result.data;
            messagesError = result.error;
        } catch (error) {
            // console.error('Ошибка при вызове RPC:', error);
            messagesError = error;
        }
        
        if (messagesError) {
            // console.error('Ошибка RPC get_conversation_messages:', messagesError);
            
            // Попробуем альтернативный способ получения сообщений
            // console.log('Пробуем альтернативный способ получения сообщений...');
            try {
                const { data: altMessages, error: altError } = await supabaseClient
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', conversationId)
                    .order('created_at', { ascending: true });
                
                if (altError) {
                    // console.error('Ошибка альтернативного запроса:', altError);
                    throw messagesError; // Возвращаемся к оригинальной ошибке
                }
                
                // Получаем список администраторов для определения sender_is_admin
                const { data: admins } = await supabaseClient
                    .from('admins')
                    .select('telegram_id')
                    .eq('is_active', true);
                
                const adminIds = admins ? admins.map(a => a.telegram_id) : [];
                
                // Преобразуем данные в нужный формат
                messages = altMessages.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    sender_id: msg.sender_id,
                    sender_is_admin: adminIds.includes(msg.sender_id),
                    message_type: msg.message_type,
                    is_read: msg.is_read,
                    created_at: msg.created_at
                }));
                
                // console.log('Сообщения получены альтернативным способом:', messages);
            } catch (altError) {
                // console.error('Альтернативный способ тоже не сработал:', altError);
                throw messagesError;
            }
        }
        
        // console.log('Сообщения получены:', messages);
        
        // Отображаем информацию о пользователе
        const username = user.username || user.first_name || `Пользователь #${user.telegram_id}`;
        dialogUsername.textContent = username;
        dialogMeta.textContent = `Сообщений: ${messages ? messages.length : 0}`;
        
        // Отображаем сообщения
        if (messages && messages.length > 0) {
            renderDialogMessages(messages);
        } else {
            // Если сообщений нет, показываем пустое состояние
            dialogChat.innerHTML = '<div class="empty-state">Нет сообщений в этом диалоге</div>';
        }
        
        // Отмечаем сообщения как прочитанные
        await markMessagesAsRead(conversationId);
        
        showConversationDialog();
        
    } catch (error) {
        // console.error('Ошибка при открытии диалога:', error);
        showError('Не удалось загрузить диалог');
    }
}

// Отображение сообщений в диалоге
function renderDialogMessages(messages) {
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
        // console.error('Ошибка при отметке сообщений:', error);
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
            // console.error('Ошибка при получении диалога:', error);
            return;
        }
        
        const botToken = '7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc';
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
                            url: `https://acqu1red.github.io/formulaprivate/?conversation=${conversationId}`
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
        
        // console.log('Уведомление отправлено пользователю');
        
    } catch (error) {
        // console.error('Ошибка при отправке уведомления:', error);
    }
}

// Уведомление администраторов о новом сообщении пользователя
async function notifyAdminsNewMessage(conversationId, messageText, userId) {
    try {
        // ID администраторов из bot.py
        const adminIds = [708907063, 7365307696];
        const botToken = '7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc';
        
        // Получаем информацию о пользователе
        const { data: user, error: userError } = await supabaseClient
            .from('users')
            .select('first_name, last_name, username')
            .eq('telegram_id', userId)
            .single();
            
        if (userError) {
            // console.error('Ошибка при получении информации о пользователе:', userError);
            return;
        }
        
        const userName = user.first_name || user.username || `Пользователь #${userId}`;
        const userInfo = user.username ? `@${user.username}` : `ID: ${userId}`;
        
        const message = {
            text: `📨 <b>Новое сообщение от пользователя!</b>\n\n👤 <b>Пользователь:</b> ${userName}\n📝 <b>Сообщение:</b> ${messageText.substring(0, 100)}${messageText.length > 100 ? '...' : ''}\n\n⚠️ <b>Требуется ответ!</b>`,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '💬 Ответить',
                        web_app: {
                            url: `https://acqu1red.github.io/formulaprivate/?admin_conversation=${conversationId}`
                        }
                    }
                ]]
            }
        };
        
        // Отправляем уведомление всем администраторам
        for (const adminId of adminIds) {
            try {
                const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...message,
                        chat_id: adminId
                    })
                });
                
                if (response.ok) {
                    // console.log(`Уведомление отправлено администратору ${adminId}`);
                } else {
                    // console.error(`Ошибка отправки уведомления администратору ${adminId}:`, response.status);
                }
            } catch (error) {
                // console.error(`Ошибка при отправке уведомления администратору ${adminId}:`, error);
            }
        }
        
    } catch (error) {
        // console.error('Ошибка при отправке уведомлений администраторам:', error);
    }
}

// Уведомление администраторов о вопросе на ответ
async function notifyAdminsFollowUpQuestion(conversationId, messageText, userId) {
    try {
        // ID администраторов из bot.py
        const adminIds = [708907063, 7365307696];
        const botToken = '7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc';
        
        // Получаем информацию о пользователе
        const { data: user, error: userError } = await supabaseClient
            .from('users')
            .select('first_name, last_name, username')
            .eq('telegram_id', userId)
            .single();
            
        if (userError) {
            // console.error('Ошибка при получении информации о пользователе:', userError);
            return;
        }
        
        const userName = user.first_name || user.username || `Пользователь #${userId}`;
        const userInfo = user.username ? `@${user.username}` : `ID: ${userId}`;
        
        const message = {
            text: `💻 <b>Долбаеб интересуется:</b>\n\n👤 <b>Зовут пидараса:</b> ${userName}\n📝 <b>Сообщение:</b> ${messageText.substring(0, 100)}${messageText.length > 100 ? '...' : ''}\n\n💬 <b>Пользователь задал дополнительный вопрос!</b>`,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '💬 Ответить',
                        web_app: {
                            url: `https://acqu1red.github.io/formulaprivate/?admin_conversation=${conversationId}`
                        }
                    }
                ]]
            }
        };
        
        // Отправляем уведомление всем администраторам
        for (const adminId of adminIds) {
            try {
                const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...message,
                        chat_id: adminId
                    })
                });
                
                if (response.ok) {
                    // console.log(`Уведомление о вопросе отправлено администратору ${adminId}`);
                } else {
                    // console.error(`Ошибка отправки уведомления администратору ${adminId}:`, response.status);
                }
            } catch (error) {
                // console.error(`Ошибка при отправке уведомления администратору ${adminId}:`, error);
            }
        }
        
    } catch (error) {
        // console.error('Ошибка при отправке уведомлений администраторам:', error);
    }
}

// Проверка и отправка уведомлений администраторам
async function checkAndNotifyAdmins(conversationId, messageText, userId) {
    try {
        // Получаем информацию о диалоге
        const { data: conversation, error: convError } = await supabaseClient
            .from('conversations')
            .select('admin_id, status')
            .eq('id', conversationId)
            .single();
            
        if (convError) {
            // console.error('Ошибка при получении информации о диалоге:', convError);
            return;
        }
        
        // Получаем последние сообщения диалога для определения типа уведомления
        const { data: messages, error: msgError } = await supabaseClient
            .from('messages')
            .select('sender_id, created_at')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (msgError) {
            // console.error('Ошибка при получении сообщений:', msgError);
            return;
        }
        
        // Проверяем, есть ли ответ администратора перед этим сообщением
        let isFollowUpQuestion = false;
        
        if (messages.length > 1) {
            // Ищем последнее сообщение администратора перед текущим
            for (let i = 1; i < messages.length; i++) {
                const message = messages[i];
                // Проверяем, является ли отправитель администратором
                const isAdmin = await checkIfUserIsAdmin(message.sender_id);
                
                if (isAdmin) {
                    // Если нашли сообщение администратора, то это вопрос на ответ
                    isFollowUpQuestion = true;
                    break;
                } else if (message.sender_id === userId) {
                    // Если нашли сообщение от того же пользователя, продолжаем поиск
                    continue;
                } else {
                    // Если нашли сообщение от другого пользователя, это не вопрос на ответ
                    break;
                }
            }
        }
        
        // Отправляем соответствующее уведомление
        if (isFollowUpQuestion) {
            await notifyAdminsFollowUpQuestion(conversationId, messageText, userId);
        } else {
            await notifyAdminsNewMessage(conversationId, messageText, userId);
        }
        
    } catch (error) {
        // console.error('Ошибка при проверке типа уведомления:', error);
    }
}

// Проверка, является ли пользователь администратором
async function checkIfUserIsAdmin(userId) {
    try {
        const { data, error } = await supabaseClient
            .rpc('is_admin', { user_telegram_id: userId });
            
        if (error) {
            // console.error('Ошибка при проверке прав администратора:', error);
            return false;
        }
        
        return data || false;
    } catch (error) {
        // console.error('Ошибка при проверке прав администратора:', error);
        return false;
    }
}

// Навигация между экранами
function showChat() {
    currentView = 'chat';
    adminPanel.classList.remove('active');
    conversationDialog.classList.remove('active');
    chat.style.display = 'flex';
    userFooter.style.display = 'flex';
    document.querySelector('.conversation-dialog footer').style.display = 'none';
    
    // Показываем админ footer только если пользователь админ
    if (isAdmin) {
        document.getElementById('adminFooter').classList.add('active');
    }
}

function showAdminPanel() {
    if (!isAdmin) return;
    
    currentView = 'admin';
    chat.style.display = 'none';
    conversationDialog.classList.remove('active');
    adminPanel.classList.add('active');
    userFooter.style.display = 'none';
    document.getElementById('adminFooter').classList.remove('active');
    document.querySelector('.conversation-dialog footer').style.display = 'none';
    
    // Добавляем обработчики фильтров после показа панели
    setTimeout(() => {
        const filterAll = document.getElementById('filterAll');
        const filterPending = document.getElementById('filterPending');
        const filterMessages = document.getElementById('filterMessages');
        
        if (filterAll && filterPending && filterMessages) {
            // Удаляем старые обработчики, если они есть
            filterAll.removeEventListener('click', () => setFilter('all'));
            filterPending.removeEventListener('click', () => setFilter('pending'));
            filterMessages.removeEventListener('click', () => setFilter('messages'));
            
            // Добавляем новые обработчики
            filterAll.addEventListener('click', () => setFilter('all'));
            filterPending.addEventListener('click', () => setFilter('pending'));
            filterMessages.addEventListener('click', () => setFilter('messages'));
        }
    }, 100);
    
    loadAdminConversations();
}

function showConversationDialog() {
    if (!isAdmin) return;
    
    currentView = 'dialog';
    chat.style.display = 'none';
    adminPanel.classList.remove('active');
    conversationDialog.classList.add('active');
    userFooter.style.display = 'none';
    document.getElementById('adminFooter').classList.remove('active');
    document.querySelector('.conversation-dialog footer').style.display = 'flex';
}

// Загрузка диалога пользователя по ID
async function loadUserConversation(conversationId) {
    try {
        // Сбрасываем состояние пагинации
        messagePage = 0;
        hasMoreMessages = true;
        allMessages = [];
        
        // Загружаем первые сообщения
        await loadMessagesWithPagination(conversationId);
        
        currentConversationId = conversationId;
        
    } catch (error) {
        // console.error('Ошибка при загрузке диалога пользователя:', error);
    }
}

// Прямая загрузка диалога для администратора
async function loadAdminConversationDirect(conversationId) {
    try {
        // Получаем информацию о пользователе в диалоге
        const { data: conversation, error: convError } = await supabaseClient
            .from('conversations')
            .select('user_id')
            .eq('id', conversationId)
            .single();
            
        if (convError) {
            // console.error('Ошибка при получении диалога:', convError);
            return;
        }
        
        // Открываем диалог с пользователем
        await openConversationDialog(conversationId, conversation.user_id);
        
    } catch (error) {
        // console.error('Ошибка при загрузке диалога администратора:', error);
    }
}

// Загрузка сообщений с пагинацией
async function loadMessagesWithPagination(conversationId, loadMore = false) {
    if (isLoadingMessages) return;
    
    isLoadingMessages = true;
    
    try {
        // Показываем индикатор загрузки
        if (loadMore) {
            showLoadMoreIndicator();
        }
        
        // Получаем сообщения с пагинацией
        const { data: messages, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .range(messagePage * messagesPerPage, (messagePage + 1) * messagesPerPage - 1);
            
        if (error) throw error;
        
        // Проверяем, есть ли еще сообщения
        hasMoreMessages = messages.length === messagesPerPage;
        
        // Добавляем новые сообщения в кэш
        if (loadMore) {
            // При загрузке "еще" добавляем в начало
            allMessages = [...messages.reverse(), ...allMessages];
        } else {
            // При первой загрузке или обновлении
            allMessages = messages.reverse();
        }
        
        // Отображаем сообщения
        if (loadMore) {
            // При загрузке "еще" добавляем в начало чата
            prependMessages(messages.reverse());
        } else {
            // При первой загрузке заменяем все
            renderMessages(allMessages);
        }
        
        // Обновляем счетчик страниц
        if (loadMore) {
            messagePage++;
        }
        
        // Показываем/скрываем кнопки навигации
        updateNavigationButtons();
        
    } catch (error) {
        // console.error('Ошибка при загрузке сообщений:', error);
        showError('Не удалось загрузить сообщения');
    } finally {
        isLoadingMessages = false;
        hideLoadMoreIndicator();
    }
}

// Загрузка новых сообщений (для обновления)
async function loadNewMessages(conversationId) {
    if (!allMessages.length) return;
    
    try {
        const lastMessageTime = allMessages[allMessages.length - 1].created_at;
        
        const { data: newMessages, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .gt('created_at', lastMessageTime)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        if (newMessages.length > 0) {
            // Добавляем новые сообщения в конец
            allMessages = [...allMessages, ...newMessages];
            
            // Отображаем новые сообщения
            appendNewMessages(newMessages);
            
            // Прокручиваем к новым сообщениям, если пользователь был внизу
            if (isScrolledToBottom) {
                scrollToBottom();
            } else {
                // Показываем индикатор новых сообщений
                showNewMessagesIndicator(newMessages.length);
            }
        }
        
    } catch (error) {
        // console.error('Ошибка при загрузке новых сообщений:', error);
    }
}

// Отображение сообщений
function renderMessages(messages) {
    chat.innerHTML = '';
    
    // Добавляем кнопку "Загрузить еще" если есть старые сообщения
    if (hasMoreMessages) {
        addLoadMoreButton();
    }
    
    let currentDate = null;
    
    messages.forEach(message => {
        const messageDate = new Date(message.created_at).toDateString();
        
        // Добавляем разделитель даты, если дата изменилась
        if (currentDate !== messageDate) {
            addDateSeparator(new Date(message.created_at));
            currentDate = messageDate;
        }
        
        appendMessage({
            text: message.content,
            inbound: message.sender_id !== currentUserId,
            timestamp: new Date(message.created_at).toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        });
    });
    
    // Прокручиваем вниз
    scrollToBottom();
}

// Добавление разделителя даты
function addDateSeparator(date) {
    const separator = document.createElement('div');
    separator.className = 'date-separator';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateText;
    if (date.toDateString() === today.toDateString()) {
        dateText = 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
        dateText = 'Вчера';
    } else {
        dateText = date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    separator.innerHTML = `<span>${dateText}</span>`;
    chat.appendChild(separator);
}

// Добавление сообщений в начало чата
function prependMessages(messages) {
    const loadMoreBtn = chat.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.remove();
    }
    
    // Сохраняем текущую позицию прокрутки
    const scrollHeight = chat.scrollHeight;
    const scrollTop = chat.scrollTop;
    
    let currentDate = null;
    
    // Добавляем сообщения в начало
    messages.forEach(message => {
        const messageDate = new Date(message.created_at).toDateString();
        
        // Добавляем разделитель даты, если дата изменилась
        if (currentDate !== messageDate) {
            const separator = createDateSeparatorElement(new Date(message.created_at));
            chat.insertBefore(separator, chat.firstChild);
            currentDate = messageDate;
        }
        
        const messageElement = createMessageElement({
            text: message.content,
            inbound: message.sender_id !== currentUserId,
            timestamp: new Date(message.created_at).toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        });
        
        chat.insertBefore(messageElement, chat.firstChild);
    });
    
    // Добавляем кнопку "Загрузить еще" если есть еще сообщения
    if (hasMoreMessages) {
        addLoadMoreButton();
    }
    
    // Восстанавливаем позицию прокрутки
    const newScrollHeight = chat.scrollHeight;
    chat.scrollTop = scrollTop + (newScrollHeight - scrollHeight);
}

// Создание элемента разделителя даты
function createDateSeparatorElement(date) {
    const separator = document.createElement('div');
    separator.className = 'date-separator';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateText;
    if (date.toDateString() === today.toDateString()) {
        dateText = 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
        dateText = 'Вчера';
    } else {
        dateText = date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    separator.innerHTML = `<span>${dateText}</span>`;
    return separator;
}

// Добавление новых сообщений в конец
function appendNewMessages(messages) {
    messages.forEach(message => {
        appendMessage({
            text: message.content,
            inbound: message.sender_id !== currentUserId,
            timestamp: new Date(message.created_at).toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        });
    });
}

// Создание элемента сообщения
function createMessageElement({ text, inbound, timestamp }) {
    const wrap = el('div', `msg ${inbound ? 'msg-in' : 'msg-out'}`);
    const bubble = el('div', 'bubble', text);
    const meta = el('div', 'meta', `${inbound ? 'Администратор' : 'Вы'} • ${timestamp}`);
    wrap.appendChild(bubble);
    wrap.appendChild(meta);
    return wrap;
}

// Добавление кнопки "Загрузить еще"
function addLoadMoreButton() {
    const loadMoreBtn = document.createElement('div');
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.innerHTML = `
        <button onclick="loadMoreMessages()" class="load-more-button">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
            </svg>
            Загрузить еще сообщения
        </button>
    `;
    chat.insertBefore(loadMoreBtn, chat.firstChild);
}

// Функция загрузки дополнительных сообщений
async function loadMoreMessages() {
    if (currentConversationId) {
        await loadMessagesWithPagination(currentConversationId, true);
    }
}

// Показать индикатор загрузки
function showLoadMoreIndicator() {
    const existingIndicator = chat.querySelector('.loading-indicator');
    if (!existingIndicator) {
        const indicator = document.createElement('div');
        indicator.className = 'loading-indicator';
        indicator.innerHTML = `
            <div class="loading-spinner">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </div>
            <span>Загрузка сообщений...</span>
        `;
        chat.insertBefore(indicator, chat.firstChild);
    }
}

// Скрыть индикатор загрузки
function hideLoadMoreIndicator() {
    const indicator = chat.querySelector('.loading-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Обновление кнопок навигации
function updateNavigationButtons() {
    const loadMoreBtn = chat.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        const button = loadMoreBtn.querySelector('button');
        if (hasMoreMessages) {
            button.disabled = false;
            button.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                </svg>
                Загрузить еще сообщения
            `;
        } else {
            button.disabled = true;
            button.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                </svg>
                Больше сообщений нет
            `;
        }
    }
}

// Прокрутка вниз
function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
}

// Отслеживание прокрутки
function setupScrollTracking() {
    chat.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = chat;
        isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10;
    });
}

// Автоматическое обновление сообщений
let messagePollingInterval = null;

function startMessagePolling() {
    // Останавливаем предыдущий интервал, если он есть
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
    
    // Запускаем новый интервал
    messagePollingInterval = setInterval(async () => {
        if (currentConversationId && currentView === 'chat') {
            await loadNewMessages(currentConversationId);
        }
    }, 3000); // Проверяем каждые 3 секунды
}

function stopMessagePolling() {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
        messagePollingInterval = null;
    }
}

// Функция для показа индикатора новых сообщений
function showNewMessagesIndicator(count) {
    // Удаляем существующий индикатор
    const existingIndicator = document.querySelector('.new-messages-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Создаем новый индикатор
    const indicator = document.createElement('div');
    indicator.className = 'new-messages-indicator';
    indicator.innerHTML = `💬 ${count} новое сообщение${count > 1 ? 'я' : ''}`;
    
    // Добавляем обработчик клика
    indicator.addEventListener('click', () => {
        scrollToBottom();
        indicator.remove();
    });
    
    document.body.appendChild(indicator);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.remove();
        }
    }, 5000);
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

function appendMessage({ text, inbound = false, timestamp = null }) {
    const wrap = el('div', `msg ${inbound ? 'msg-in' : 'msg-out'}`);
    const bubble = el('div', 'bubble', text);
    
    // Используем переданное время или текущее
    const timeText = timestamp || new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const meta = el('div', 'meta', `${inbound ? 'Администратор' : 'Вы'} • ${timeText}`);
    
    wrap.appendChild(bubble);
    wrap.appendChild(meta);
    chat.appendChild(wrap);
    
    // Прокручиваем вниз только если пользователь был внизу
    if (isScrolledToBottom) {
        chat.scrollTop = chat.scrollHeight;
    }
}

// Показ ошибок
function showError(message) {
    if (tg && tg.showAlert) {
        tg.showAlert(message);
    } else {
        // alert message
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);