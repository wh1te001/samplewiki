/**
 * utils.js - Утилиты и вспомогательные функции
 */

const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000;

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function saveCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

function isAuthenticated() {
    return !!getCurrentUser();
}

/**
 * Трункирование текста
 * @param {string} text - Текст
 * @param {number} maxLength - Максимальная длина
 * @returns {string} Усеченный текст
 */
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Проверка валидности email
 * @param {string} email - Email адрес
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Проверка валидности пароля (минимум 6 символов)
 * @param {string} password - Пароль
 * @returns {boolean}
 */
function isValidPassword(password) {
    return password && password.length >= 6;
}

/**
 * Дебаунс функции
 * @param {function} func - Функция
 * @param {number} delay - Задержка в миллисекундах
 * @returns {function} Дебаунсированная функция
 */
function debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Проверка видимости элемента на экране
 * @param {HTMLElement} element - Элемент
 * @returns {boolean}
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Ленивая загрузка для iframe (по видимости)
 * @param {HTMLElement} element - iframe элемент
 */
function lazyLoadIframe(element) {
    if (isInViewport(element) && element.dataset.src && !element.src) {
        element.src = element.dataset.src;
    }
}
