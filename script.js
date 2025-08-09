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
    if (conversationId && !isAdmin) {
        // Загружаем конкретный диалог для пользователя
        loadUserConversation(conversationId);
    }
    
    setupEventListeners();
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
        console.error('Ошибка при создании пользователя:', error);
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
        }
    } catch (error) {
        console.error('Ошибка при проверке прав админа:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обычный чат
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileAttach);
    
    // Админ-панель
    adminPanelBtn.addEventListener('click', showAdminPanel);
    backToChat.addEventListener('click', showChat);
    backToAdmin.addEventListener('click', showAdminPanel);
    
    // Диалог админа
    dialogSendBtn.addEventListener('click', sendAdminMessage);
    dialogMessageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAdminMessage();
        }
    });
    
    dialogAttachBtn.addEventListener('click', () => dialogFileInput.click());
    dialogFileInput.addEventListener('change', handleDialogFileAttach);
}

// Функции отправки сообщений
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentUserId) return;
    
    try {
        // Создаем или получаем диалог
        const conversationId = await createOrGetConversation();
        
        if (!conversationId) {
            throw new Error('Не удалось создать диалог');
        }
        
        // Добавляем сообщение
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
        
        // Отображаем сообщение в чате
        appendMessage({ text, inbound: false });
        messageInput.value = '';
        
        // Имитируем ответ админа (для тестирования)
        setTimeout(() => {
            appendMessage({ 
                text: 'Спасибо за сообщение! Администратор ответит вам в ближайшее время.', 
                inbound: true 
            });
        }, 1000);
        
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        showError('Не удалось отправить сообщение');
    }
}

async function sendAdminMessage() {
    const text = dialogMessageInput.value.trim();
    if (!text || !currentConversationId || !isAdmin) return;
    
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
        
        // Назначаем админа на диалог
        await supabaseClient
            .from('conversations')
            .update({ 
                admin_id: currentUserId, 
                status: 'in_progress' 
            })
            .eq('id', currentConversationId);
        
        // Отображаем сообщение
        appendDialogMessage({ 
            text, 
            isAdmin: true, 
            timestamp: new Date().toLocaleTimeString() 
        });
        
        dialogMessageInput.value = '';
        
        // Отправляем уведомление пользователю (через backend API)
        await notifyUser(currentConversationId);
        
    } catch (error) {
        console.error('Ошибка при отправке ответа:', error);
        showError('Не удалось отправить ответ');
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
        console.error('Ошибка при создании диалога:', error);
        return null;
    }
}

// Загрузка диалогов для админ-панели
async function loadAdminConversations() {
    if (!isAdmin) return;
    
    try {
        const { data, error } = await supabaseClient
            .rpc('get_admin_conversations');
            
        if (error) throw error;
        
        renderConversationsList(data);
        
    } catch (error) {
        console.error('Ошибка при загрузке диалогов:', error);
        conversationsList.innerHTML = '<div class="loading">Ошибка загрузки</div>';
    }
}

// Отображение списка диалогов
function renderConversationsList(conversations) {
    if (!conversations || conversations.length === 0) {
        conversationsList.innerHTML = '<div class="loading">Нет активных диалогов</div>';
        return;
    }
    
    const html = conversations.map(conv => {
        const username = conv.username || conv.first_name || `ID: ${conv.user_id}`;
        const lastMessage = conv.last_message || 'Нет сообщений';
        const messageCount = conv.message_count || 0;
        const date = new Date(conv.last_message_at).toLocaleDateString('ru-RU');
        const time = new Date(conv.last_message_at).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <div class="conversation-item" data-conversation-id="${conv.id}" data-user-id="${conv.user_id}">
                <div class="conversation-user">${username}</div>
                <div class="conversation-meta">
                    <span>${date} ${time}</span>
                    <span>Сообщений: ${messageCount}</span>
                </div>
                <div class="conversation-preview">${lastMessage}</div>
            </div>
        `;
    }).join('');
    
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
        const username = user.username || user.first_name || `ID: ${user.telegram_id}`;
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
    adminPanel.classList.remove('active');
    conversationDialog.classList.remove('active');
    chat.style.display = 'flex';
    userFooter.style.display = 'flex';
    document.querySelector('.conversation-dialog footer').style.display = 'none';
}

function showAdminPanel() {
    if (!isAdmin) return;
    
    currentView = 'admin';
    chat.style.display = 'none';
    conversationDialog.classList.remove('active');
    adminPanel.classList.add('active');
    userFooter.style.display = 'none';
    document.querySelector('.conversation-dialog footer').style.display = 'none';
    
    loadAdminConversations();
}

function showConversationDialog() {
    if (!isAdmin) return;
    
    currentView = 'dialog';
    chat.style.display = 'none';
    adminPanel.classList.remove('active');
    conversationDialog.classList.add('active');
    userFooter.style.display = 'none';
    document.querySelector('.conversation-dialog footer').style.display = 'flex';
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
    if (tg && tg.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);