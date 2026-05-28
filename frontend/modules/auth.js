const API_HOST = 'http://localhost:5000/api';

function authFetch(endpoint, body) {
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
    if (password.length < 8) {
        throw new Error('Пароль должен быть минимум 8 символов');
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
    const authSection = document.getElementById('authSection');
    if (authSection) authSection.style.display = 'none';
    showPage('artists');
    showToast('Вы вышли из системы', 'info');
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
    const user = getCurrentUser();
    if (isAuthenticated() && user) {
        const roleLabel = user.role === 'Admin' ? ' ⚡' : '';
        authNav.innerHTML = `<a href="javascript:void(0)" onclick="logout()">${user.username.replace(/[<>&"']/g, function(c){return '&#'+c.charCodeAt(0)+';'})}${roleLabel} · Выход</a>`;
    } else {
        authNav.innerHTML = '<a href="javascript:void(0)" onclick="toggleAuth()">Вход</a>';
    }
}

async function handleAuthSubmit(username, email, password, isRegister) {
    const btn = document.getElementById('authButton');
    const errorEl = document.getElementById('authError');
    errorEl.style.display = 'none';

    try {
        btn.disabled = true;
        btn.textContent = isRegister ? 'Регистрирую…' : 'Вхожу…';

        let response;
        if (isRegister) {
            response = await register(username, email, password);
        } else {
            response = await login(username, password);
        }

        saveCurrentUser({
            id: response.userId,
            username: response.username,
            email: response.email,
            role: response.role
        });

        updateUIAuthState();
        showToast(`Добро пожаловать, ${response.username}!`, 'success');

        const authSection = document.getElementById('authSection');
        if (authSection) authSection.style.display = 'none';
        showPage('artists');
        return true;
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
        return false;
    } finally {
        btn.disabled = false;
        btn.textContent = isRegister ? 'Зарегистрироваться' : 'Вход';
    }
}