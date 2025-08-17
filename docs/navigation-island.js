import { SUPABASE_CONFIG, CONFIG, tg } from './config.js';

// Инициализация Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// Состояние приложения
let currentScene = 'island'; // 'island', 'library', 'book'
let selectedTemple = null;
let selectedBook = null;
let currentUserId = null;
let isAdmin = false;

// Элементы DOM
const introOverlay = document.getElementById('introOverlay');
const introClose = document.getElementById('introClose');
const islandScene = document.getElementById('islandScene');
const libraryScene = document.getElementById('libraryScene');
const bookScene = document.getElementById('bookScene');
const instructions = document.getElementById('instructions');
const libraryInstructions = document.getElementById('libraryInstructions');
const backButton = document.getElementById('backButton');
const libraryBackButton = document.getElementById('libraryBackButton');
const bookBackButton = document.getElementById('bookBackButton');
const bookshelf = document.getElementById('bookshelf');
const bookTitle = document.getElementById('bookTitle');
const bookDescription = document.getElementById('bookDescription');
const readButton = document.getElementById('readButton');

// Данные для тем и постов
const templeData = {
    1: {
        name: 'Тема 1',
        description: 'Первая тематическая категория знаний',
        books: [
            { id: 1, title: 'Пост 1', description: 'Увлекательное исследование первой темы' },
            { id: 2, title: 'Пост 2', description: 'Глубокий анализ ключевых аспектов' },
            { id: 3, title: 'Пост 3', description: 'Практическое руководство по применению' },
            { id: 4, title: 'Пост 4', description: 'Продвинутые техники и методы' },
            { id: 5, title: 'Пост 5', description: 'Экспертные советы и рекомендации' }
        ]
    },
    2: {
        name: 'Тема 2',
        description: 'Вторая тематическая категория знаний',
        books: [
            { id: 6, title: 'Пост 6', description: 'Основы второй темы' },
            { id: 7, title: 'Пост 7', description: 'Продвинутые концепции' },
            { id: 8, title: 'Пост 8', description: 'Практические примеры' },
            { id: 9, title: 'Пост 9', description: 'Секретные техники' },
            { id: 10, title: 'Пост 10', description: 'Мастер-класс эксперта' }
        ]
    },
    3: {
        name: 'Тема 3',
        description: 'Третья тематическая категория знаний',
        books: [
            { id: 11, title: 'Пост 11', description: 'Введение в третью тему' },
            { id: 12, title: 'Пост 12', description: 'Детальный разбор концепций' },
            { id: 13, title: 'Пост 13', description: 'Практические упражнения' },
            { id: 14, title: 'Пост 14', description: 'Продвинутые стратегии' },
            { id: 15, title: 'Пост 15', description: 'Экспертные методики' }
        ]
    },
    4: {
        name: 'Тема 4',
        description: 'Четвертая тематическая категория знаний',
        books: [
            { id: 16, title: 'Пост 16', description: 'Основы четвертой темы' },
            { id: 17, title: 'Пост 17', description: 'Углубленное изучение' },
            { id: 18, title: 'Пост 18', description: 'Практические кейсы' },
            { id: 19, title: 'Пост 19', description: 'Инновационные подходы' },
            { id: 20, title: 'Пост 20', description: 'Мастерство в действии' }
        ]
    },
    5: {
        name: 'Тема 5',
        description: 'Пятая тематическая категория знаний',
        books: [
            { id: 21, title: 'Пост 21', description: 'Введение в пятую тему' },
            { id: 22, title: 'Пост 22', description: 'Ключевые принципы' },
            { id: 23, title: 'Пост 23', description: 'Практические техники' },
            { id: 24, title: 'Пост 24', description: 'Продвинутые методы' },
            { id: 25, title: 'Пост 25', description: 'Экспертное руководство' }
        ]
    }
};

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
    
    setupEventListeners();
    setupIntroTimer();
    createBookshelf();
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
            .select();

        if (error) {
            console.error('Ошибка создания пользователя:', error);
        }
    } catch (error) {
        console.error('Ошибка работы с пользователем:', error);
    }
}

// Проверка прав администратора
async function checkAdminRights() {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('is_admin')
            .eq('telegram_id', currentUserId)
            .single();

        if (data && data.is_admin) {
            isAdmin = true;
        }
    } catch (error) {
        console.error('Ошибка проверки прав администратора:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Интро окно
    introClose.addEventListener('click', closeIntro);
    
    // Храмы
    document.querySelectorAll('.temple').forEach(temple => {
        temple.addEventListener('click', handleTempleClick);
    });
    
    // Кнопки назад
    backButton.addEventListener('click', goBack);
    libraryBackButton.addEventListener('click', goBack);
    bookBackButton.addEventListener('click', goBack);
    
    // Кнопка чтения
    readButton.addEventListener('click', handleReadClick);
}

// Настройка таймера для интро окна
function setupIntroTimer() {
    setTimeout(() => {
        if (introOverlay.style.display !== 'none') {
            closeIntro();
        }
    }, 15000); // 15 секунд
}

// Закрытие интро окна
function closeIntro() {
    introOverlay.style.display = 'none';
    introOverlay.style.animation = 'fadeOut 0.5s ease forwards';
    
    setTimeout(() => {
        introOverlay.style.display = 'none';
    }, 500);
}

// Обработка клика по храму
function handleTempleClick(event) {
    const temple = event.currentTarget;
    const templeId = parseInt(temple.dataset.temple);
    
    if (selectedTemple === templeId) {
        // Второй клик - подтверждение выбора
        confirmTempleSelection(templeId);
    } else {
        // Первый клик - выбор храма
        selectTemple(templeId);
    }
}

// Выбор храма
function selectTemple(templeId) {
    // Снимаем выделение с предыдущего храма
    if (selectedTemple) {
        const prevTemple = document.querySelector(`[data-temple="${selectedTemple}"]`);
        prevTemple.classList.remove('selected');
    }
    
    // Выделяем новый храм
    selectedTemple = templeId;
    const temple = document.querySelector(`[data-temple="${templeId}"]`);
    temple.classList.add('selected');
    
    // Обновляем инструкции
    instructions.textContent = 'Нажми еще раз для подтверждения выбора';
    instructions.classList.add('confirm');
    
    // Показываем кнопку назад
    backButton.style.display = 'block';
}

// Подтверждение выбора храма
function confirmTempleSelection(templeId) {
    // Анимация входа в храм
    islandScene.classList.add('transitioning');
    
    setTimeout(() => {
        // Переход к библиотеке
        showLibraryScene(templeId);
    }, 1500);
}

// Показать сцену библиотеки
function showLibraryScene(templeId) {
    islandScene.style.display = 'none';
    libraryScene.classList.add('active');
    
    // Заполняем книжную полку книгами для выбранной темы
    populateBookshelf(templeId);
    
    // Обновляем инструкции
    libraryInstructions.textContent = 'Выберите книгу для изучения';
}

// Создание книжной полки
function createBookshelf() {
    // Создаем 20 книг (5x4 сетка)
    for (let i = 1; i <= 20; i++) {
        const book = document.createElement('div');
        book.className = 'book';
        book.dataset.bookId = i;
        book.textContent = `Книга ${i}`;
        book.addEventListener('click', handleBookClick);
        bookshelf.appendChild(book);
    }
}

// Заполнение книжной полки книгами для темы
function populateBookshelf(templeId) {
    const templeBooks = templeData[templeId].books;
    const allBooks = bookshelf.querySelectorAll('.book');
    
    // Скрываем все книги
    allBooks.forEach(book => {
        book.style.display = 'none';
    });
    
    // Показываем только книги для выбранной темы
    templeBooks.forEach((bookData, index) => {
        if (allBooks[index]) {
            allBooks[index].style.display = 'flex';
            allBooks[index].textContent = bookData.title;
            allBooks[index].dataset.bookId = bookData.id;
            allBooks[index].dataset.bookTitle = bookData.title;
            allBooks[index].dataset.bookDescription = bookData.description;
        }
    });
}

// Обработка клика по книге
function handleBookClick(event) {
    const book = event.currentTarget;
    const bookId = parseInt(book.dataset.bookId);
    const bookTitle = book.dataset.bookTitle;
    const bookDescription = book.dataset.bookDescription;
    
    if (selectedBook === bookId) {
        // Второй клик - открытие книги
        openBook(bookId, bookTitle, bookDescription);
    } else {
        // Первый клик - выбор книги
        selectBook(bookId);
    }
}

// Выбор книги
function selectBook(bookId) {
    // Снимаем выделение с предыдущей книги
    if (selectedBook) {
        const prevBook = bookshelf.querySelector(`[data-book-id="${selectedBook}"]`);
        prevBook.classList.remove('selected');
    }
    
    // Выделяем новую книгу
    selectedBook = bookId;
    const book = bookshelf.querySelector(`[data-book-id="${bookId}"]`);
    book.classList.add('selected');
    
    // Обновляем инструкции
    libraryInstructions.textContent = 'Нажми еще раз для открытия книги';
    libraryInstructions.classList.add('confirm');
}

// Открытие книги
function openBook(bookId, title, description) {
    // Анимация перехода
    libraryScene.classList.remove('active');
    
    setTimeout(() => {
        // Показываем сцену книги
        showBookScene(bookId, title, description);
    }, 1500);
}

// Показать сцену книги
function showBookScene(bookId, title, description) {
    libraryScene.style.display = 'none';
    bookScene.classList.add('active');
    
    // Заполняем информацию о книге
    bookTitle.textContent = title;
    bookDescription.textContent = description;
    
    // Сохраняем ID книги для кнопки чтения
    readButton.dataset.bookId = bookId;
}

// Обработка клика по кнопке чтения
function handleReadClick() {
    const bookId = readButton.dataset.bookId;
    
    // Переход на ссылку поста
    const postUrl = 'https://t.me/c/1928787715/128';
    
    if (tg) {
        tg.openTelegramLink(postUrl);
    } else {
        window.open(postUrl, '_blank');
    }
}

// Функция возврата назад
function goBack() {
    switch (currentScene) {
        case 'library':
            // Возврат к острову
            libraryScene.classList.remove('active');
            setTimeout(() => {
                libraryScene.style.display = 'none';
                islandScene.style.display = 'block';
                islandScene.classList.remove('transitioning');
                
                // Сбрасываем выбор храма
                if (selectedTemple) {
                    const temple = document.querySelector(`[data-temple="${selectedTemple}"]`);
                    temple.classList.remove('selected');
                    selectedTemple = null;
                }
                
                // Обновляем инструкции
                instructions.textContent = 'Нажми на постройку для выбора темы';
                instructions.classList.remove('confirm');
                
                // Скрываем кнопку назад
                backButton.style.display = 'none';
                
                currentScene = 'island';
            }, 1500);
            break;
            
        case 'book':
            // Возврат к библиотеке
            bookScene.classList.remove('active');
            setTimeout(() => {
                bookScene.style.display = 'none';
                libraryScene.style.display = 'block';
                libraryScene.classList.add('active');
                
                // Сбрасываем выбор книги
                if (selectedBook) {
                    const book = bookshelf.querySelector(`[data-book-id="${selectedBook}"]`);
                    book.classList.remove('selected');
                    selectedBook = null;
                }
                
                // Обновляем инструкции
                libraryInstructions.textContent = 'Выберите книгу для изучения';
                libraryInstructions.classList.remove('confirm');
                
                currentScene = 'library';
            }, 1500);
            break;
    }
}

// Добавление CSS анимации для fadeOut
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
