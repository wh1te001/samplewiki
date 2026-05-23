/**
 * auth.js - Управление аутентификацией
 */

/** API хост (зависит от конфигурации) */
const API_HOST = 'http://localhost:5000/api';

/**
 * Регистрация нового пользователя
 * @param {string} username - Имя пользователя
 * @param {string} email - Email
 * @param {string} password - Пароль
 * @returns {Promise<object>} Ответ от сервера (AuthResponse)
 */
async function register(username, email, password) {
    if (!username || !email || !password) {
        throw new Error('Все поля обязательны');
    }
    
    if (!isValidEmail(email)) {
        throw new Error('Некорректный email');
    }
    
    if (!isValidPassword(password)) {
        throw new Error('Пароль должен быть минимум 6 символов');
    }
    
    const response = await fetch(`${API_HOST}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка регистрации');
    }
    
    return await response.json();
}

/**
 * Вход пользователя
 * @param {string} username - Имя пользователя
 * @param {string} password - Пароль
 * @returns {Promise<object>} Ответ от сервера (AuthResponse)
 */
async function login(username, password) {
    if (!username || !password) {
        throw new Error('Все поля обязательны');
    }
    
    const response = await fetch(`${API_HOST}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка входа');
    }
    
    return await response.json();
}

/**
 * Выход пользователя
 */
function logout() {
    clearToken();
    sessionStorage.removeItem('currentUser');
    updateUIAuthState();
    showPage('artists');
}

/**
 * Обновление состояния UI для аутентификации
 */
function updateUIAuthState() {
    const authNav = document.getElementById('authNav');
    const currentUser = getCurrentUser();
    
    if (isAuthenticated() && currentUser) {
        authNav.innerHTML = `<a href="#" onclick="logout()">Выход (${currentUser.username})</a>`;
    } else {
        authNav.innerHTML = '<a href="#" onclick="toggleAuth()">Вход</a>';
    }
}

/**
 * Проверка если текущий пользователь аудентифицирован
 * @returns {boolean}
 */
function isUserAuthenticated() {
    return isAuthenticated();
}

/**
 * Обработка процесса входа/регистрации
 * @param {string} username - Имя пользователя
 * @param {string} email - Email (для регистрации)
 * @param {string} password - Пароль
 * @param {boolean} isRegister - Регистрация ли это
 */
async function handleAuthSubmit(username, email, password, isRegister) {
    try {
        let response;
        
        if (isRegister) {
            response = await register(username, email, password);
        } else {
            response = await login(username, password);
        }
        
        // Сохранение токена и информации о пользователе
        saveToken(response.token);
        saveCurrentUser({
            id: response.userId,
            username: response.username,
            email: response.email,
            role: response.role
        });
        
        updateUIAuthState();
        showToast(`Успешный ${isRegister ? 'вход' : 'вход'}!`, 'success');
        
        // Скрыть форму аутентификации
        document.getElementById('authSection').style.display = 'none';
        showPage('artists');
        
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    }
}
