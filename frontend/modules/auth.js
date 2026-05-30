const API_HOST = 'http://localhost:5000/api';

function toggleAuth() {
    window.location.href = 'auth.html';
}

function authFetch(endpoint, body) {
    console.log(`[authFetch] POST ${API_HOST}${endpoint}`);
    return fetch(`${API_HOST}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
    });
}

async function register(username, email, password) {
    if (!username || !email || !password) {
        throw new Error('Все поля обязательны');
    }
    if (!isValidEmail(email)) {
        throw new Error('Некорректный email');
    }
    if (password.length < 8 || !/\d/.test(password)) {
        throw new Error('Пароль: минимум 8 символов и хотя бы одна цифра');
    }
    const response = await authFetch('/auth/register', { username, email, password });
    if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Ошибка регистрации' }));
        throw new Error(data.error || 'Ошибка регистрации');
    }
    return await response.json();
}

async function login(username, password) {
    if (!username || !password) {
        throw new Error('Все поля обязательны');
    }
    const response = await authFetch('/auth/login', { username, password });
    if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Ошибка входа' }));
        throw new Error(data.error || 'Ошибка входа');
    }
    return await response.json();
}

async function logout() {
    try {
        await fetch(`${API_HOST}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (e) {
        console.error('Logout error:', e);
    }
    clearCurrentUser();
    updateUIAuthState();
    showToast('Вы вышли из системы', 'info');
    window.location.href = 'index.html';
}

async function checkAuth() {
    try {
        const response = await fetch(`${API_HOST}/auth/me`, {
            credentials: 'include'
        });
        if (response.ok) {
            const user = await response.json();
            saveCurrentUser({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            });
            return true;
        }
    } catch (e) {
        console.error('Auth check error:', e);
    }
    clearCurrentUser();
    return false;
}

function updateUIAuthState() {
    const authNav = document.getElementById('authNav');
    const registerNav = document.getElementById('registerNav');
    const user = getCurrentUser();
    if (isAuthenticated() && user) {
        const roleLabel = user.role === 'Admin' ? ' ⚡' : '';
        authNav.innerHTML = `<a href="javascript:void(0)" onclick="logout()">${user.username.replace(/[<>&"']/g, function(c){return '&#'+c.charCodeAt(0)+';'})}${roleLabel} · Выход</a>`;
        if (registerNav) registerNav.style.display = 'none';
    } else {
        authNav.innerHTML = '<a href="javascript:void(0)" onclick="toggleAuth()">Вход</a>';
        if (registerNav) registerNav.style.display = '';
    }
}

