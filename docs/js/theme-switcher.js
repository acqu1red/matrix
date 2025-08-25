// Theme Switcher
class ThemeSwitcher {
  constructor() {
    this.currentTheme = 'modern';
    this.themes = ['modern', 'conspiracy'];
    this.init();
  }

  init() {
    // Получаем сохраненную тему
    this.currentTheme = localStorage.getItem('theme') || 'modern';
    this.applyTheme(this.currentTheme);
    
    // Создаем переключатель тем
    this.createThemeToggle();
    
    // Слушаем изменения системной темы
    this.watchSystemTheme();
  }

  // Применение темы
  applyTheme(themeName) {
    const root = document.documentElement;
    
    // Убираем все атрибуты тем
    this.themes.forEach(theme => {
      root.removeAttribute(`data-theme-${theme}`);
    });
    
    // Устанавливаем выбранную тему
    root.setAttribute('data-theme', themeName);
    
    // Сохраняем в localStorage
    localStorage.setItem('theme', themeName);
    
    // Обновляем текущую тему
    this.currentTheme = themeName;
    
    // Уведомляем о смене темы
    this.dispatchThemeChange(themeName);
    
    console.log(`Theme applied: ${themeName}`);
  }

  // Создание переключателя тем
  createThemeToggle() {
    // Ищем существующий переключатель
    let toggle = document.getElementById('theme-toggle');
    
    if (!toggle) {
      // Создаем переключатель
      toggle = document.createElement('button');
      toggle.id = 'theme-toggle';
      toggle.className = 'btn btn--ghost';
      toggle.setAttribute('aria-label', 'Переключить тему');
      toggle.innerHTML = '🎨';
      
      // Добавляем в header
      const header = document.querySelector('header');
      if (header) {
        const actions = header.querySelector('.cluster:last-child');
        if (actions) {
          actions.appendChild(toggle);
        }
      }
    }
    
    // Обработчик клика
    toggle.addEventListener('click', () => {
      this.cycleTheme();
    });
    
    // Обновляем иконку
    this.updateToggleIcon();
  }

  // Переключение на следующую тему
  cycleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    const nextTheme = this.themes[nextIndex];
    
    this.applyTheme(nextTheme);
    this.updateToggleIcon();
    
    // Haptic feedback
    if (window.telegramApp?.haptic) {
      window.telegramApp.haptic.light();
    }
  }

  // Обновление иконки переключателя
  updateToggleIcon() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    
    const icons = {
      'modern': '🎨',
      'conspiracy': '🔮'
    };
    
    toggle.innerHTML = icons[this.currentTheme] || '🎨';
    toggle.setAttribute('aria-label', `Текущая тема: ${this.currentTheme}. Кликните для смены.`);
  }

  // Наблюдение за системной темой
  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (this.currentTheme === 'modern') {
        // Автоматически применяем системную тему для modern
        this.applySystemTheme(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Применяем текущую системную тему
    this.applySystemTheme(mediaQuery.matches);
  }

  // Применение системной темы
  applySystemTheme(isDark) {
    const root = document.documentElement;
    
    if (isDark) {
      root.setAttribute('data-system-theme', 'dark');
    } else {
      root.setAttribute('data-system-theme', 'light');
    }
  }

  // Получение текущей темы
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Получение доступных тем
  getAvailableThemes() {
    return [...this.themes];
  }

  // Проверка поддержки темы
  isThemeSupported(themeName) {
    return this.themes.includes(themeName);
  }

  // Сброс к теме по умолчанию
  resetToDefault() {
    this.applyTheme('modern');
    this.updateToggleIcon();
  }

  // Уведомление о смене темы
  dispatchThemeChange(themeName) {
    const event = new CustomEvent('themechange', {
      detail: {
        theme: themeName,
        previousTheme: this.currentTheme
      }
    });
    
    document.dispatchEvent(event);
  }

  // Получение информации о теме
  getThemeInfo(themeName) {
    const themeInfo = {
      modern: {
        name: 'Modern Neon',
        description: 'Современный неоновый дизайн с лаймовым акцентом',
        accent: '#A8FF61',
        secondary: '#22E1FF'
      },
      conspiracy: {
        name: 'Conspiracy',
        description: 'Тема тайного мирового правительства',
        accent: '#DAA520',
        secondary: '#CD853F'
      }
    };
    
    return themeInfo[themeName] || null;
  }

  // Применение кастомной темы
  applyCustomTheme(colors) {
    const root = document.documentElement;
    
    if (colors.accent) {
      root.style.setProperty('--accent', colors.accent);
    }
    
    if (colors.accent2) {
      root.style.setProperty('--accent-2', colors.accent2);
    }
    
    if (colors.bg) {
      root.style.setProperty('--bg', colors.bg);
    }
    
    if (colors.surface) {
      root.style.setProperty('--surface', colors.surface);
    }
    
    if (colors.text) {
      root.style.setProperty('--text', colors.text);
    }
  }

  // Сброс кастомных цветов
  resetCustomColors() {
    const root = document.documentElement;
    
    // Убираем кастомные цвета
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-2');
    root.style.removeProperty('--bg');
    root.style.removeProperty('--surface');
    root.style.removeProperty('--text');
    
    // Применяем текущую тему заново
    this.applyTheme(this.currentTheme);
  }
}

// Создаем глобальный экземпляр
const themeSwitcher = new ThemeSwitcher();

// Экспортируем для использования в других модулях
window.themeSwitcher = themeSwitcher;

// Слушаем события смены темы
document.addEventListener('themechange', (e) => {
  console.log(`Theme changed from ${e.detail.previousTheme} to ${e.detail.theme}`);
  
  // Можно добавить дополнительную логику при смене темы
  // Например, обновление анимаций, перерисовка графиков и т.д.
});

// Экспорт для ES6 модулей
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeSwitcher;
}
