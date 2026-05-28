/**
 * app.js - Главный файл приложения SampleWiki
 * 
 * Это интегрирующий модуль, который связывает все части приложения:
 * - управление навигацией
 * - загрузку данных
 * - обработку пользовательских событий
 */

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

// Slug maps for route resolution
let artistSlugMap = {};
let trackSlugMap = {};

async function buildSlugMaps() {
    try {
        const [artists, tracks] = await Promise.all([getArtists(), getTracks()]);
        artists.forEach(a => { artistSlugMap[slugify(a.name)] = a; });
        tracks.forEach(t => {
            const artist = artists.find(a => a.id === t.artistId);
            const key = (artist ? slugify(artist.name) : 'unknown') + '/' + slugify(t.title);
            trackSlugMap[key] = t;
        });
    } catch (e) {
        console.error('Failed to build slug maps:', e);
    }
}

async function initializeApp() {
    console.log('Инициализация приложения SampleWiki...');

    await checkAuth();
    updateUIAuthState();
    await buildSlugMaps();
    handleRoute();
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initializeApp);

// ==================== РОУТИНГ ====================

// Сохранение текущего контекста для навигации
let currentArtistSlug = null;
let currentTrackSlug = null;

/**
 * Навигация (History API)
 * @param {string} path - Путь (artists, search, history, daft-punk, daft-punk/digital-love, sample/2/...)
 */
function navigateTo(path) {
    path = path.replace(/^\/+/, '');
    if (!path) {
        // Home: go to the app root (from <base> href)
        const base = (document.querySelector('base')?.getAttribute('href') || '/').replace(/\/+$/, '') + '/';
        history.pushState({}, '', base);
    } else {
        history.pushState({}, '', path);
    }
    handleRoute();
}

/**
 * Скрыть все секции
 */
function hideAllSections() {
    ['artistsSection', 'artistDetailSection', 'trackDetailSection', 
     'sampleDetailSection', 'searchSection', 'historySection', 'authSection']
        .forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
}

/**
 * Обработка текущего роута (из pathname)
 */
function handleRoute() {
    // Strip base path (from <base> href or script src) to get the app-relative path
    const base = (document.querySelector('base')?.getAttribute('href') || '').replace(/^https?:\/\/[^/]+/, '');
    const basePath = base.replace(/\/+$/, '');
    const rawPath = window.location.pathname.replace(/\/+$/, '') || '';
    const appPath = rawPath.startsWith(basePath) ? rawPath.slice(basePath.length) || '/' : rawPath;
    const path = appPath.replace(/\/+$/, '') || '';
    const parts = path.split('/').filter(Boolean);

    // Sample: /sample/624719/...
    if (parts.length >= 2 && parts[0] === 'sample') {
        showSampleDetail(parseInt(parts[1]));
        return;
    }

    // Track by ID (fallback): /track/5
    if (parts.length === 2 && parts[0] === 'track') {
        showTrackDetail(parseInt(parts[1]));
        return;
    }

    // Artist by ID (fallback): /artist/5
    if (parts.length === 2 && parts[0] === 'artist') {
        showArtistDetail(parseInt(parts[1]));
        return;
    }

    // Track: /artist-slug/track-slug
    if (parts.length === 2) {
        const key = parts[0] + '/' + parts[1];
        const track = trackSlugMap[key];
        if (track) {
            currentArtistSlug = parts[0];
            currentTrackSlug = parts[1];
            showTrackDetail(track.id);
            return;
        }
    }

    // Artist: /artist-slug
    if (parts.length === 1 && parts[0] && parts[0] !== 'artists' && parts[0] !== 'search' && parts[0] !== 'history') {
        const artist = artistSlugMap[parts[0]];
        if (artist) {
            currentArtistSlug = parts[0];
            currentTrackSlug = null;
            showArtistDetail(artist.id);
            return;
        }
    }

    // Static pages
    if (path === '/search') { showPage('search'); return; }
    if (path === '/history') { showPage('history'); return; }

    // Default: artists list
    currentArtistSlug = null;
    currentTrackSlug = null;
    showPage('artists');
}

// Слушаем popstate (кнопки браузера)
window.addEventListener('popstate', handleRoute);

// Hash fallback (старые ссылки /#sample/1 и т.д.)
function handleHashFallback() {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) {
        history.replaceState({}, '', hash);
        handleRoute();
    }
}
window.addEventListener('hashchange', handleHashFallback);
// Также проверить хэш при первой загрузке
handleHashFallback();

/**
 * Переключение между разделами приложения
 * @param {string} page - Название страницы (artists, search, history)
 */
function showPage(page) {
    hideAllSections();

    switch (page) {
        case 'artists':
            document.getElementById('artistsSection').style.display = 'block';
            loadArtists();
            break;
        case 'search':
            document.getElementById('searchSection').style.display = 'block';
            break;
        case 'history':
            if (!isAuthenticated()) {
                showToast('Требуется аутентификация', 'error');
                toggleAuth();
                return;
            }
            document.getElementById('historySection').style.display = 'block';
            loadRevisions();
            break;
        default:
            document.getElementById('artistsSection').style.display = 'block';
    }
}

/**
 * Вернуться к списку исполнителей
 */
function goBackToArtists() { navigateTo(''); }

/**
 * Вернуться к исполнителю из трека
 */
function goBackToArtist() { if (currentArtistSlug) navigateTo(currentArtistSlug); }

/**
 * Вернуться к треку из сэмпла
 */
function goBackToTrack() { if (currentArtistSlug && currentTrackSlug) navigateTo(currentArtistSlug + '/' + currentTrackSlug); }

// ==================== АУТЕНТИФИКАЦИЯ ====================

/** Флаг для отслеживания режима аутентификации (вход/регистрация) */
let isRegisterMode = false;

/**
 * Переключение между формой входа и регистрации
 */
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    setAuthModeUI(isRegisterMode ? 'register' : 'login');
    document.getElementById('authForm').reset();
    document.getElementById('authError').style.display = 'none';
}

/**
 * Переключение видимости формы аутентификации
 */
function toggleAuth() {
    const authSection = document.getElementById('authSection');
    const isVisible = authSection.style.display !== 'none';
    authSection.style.display = isVisible ? 'none' : 'flex';

    if (!isVisible) {
        isRegisterMode = false;
        setAuthModeUI('login');
        document.getElementById('authError').style.display = 'none';
        document.getElementById('authForm').reset();
    }
}

function setAuthModeUI(mode) {
    const authTitle = document.getElementById('authTitle');
    const authButton = document.getElementById('authButton');
    const emailInput = document.getElementById('emailInput');
    const passwordConfirmField = document.getElementById('passwordConfirmField');
    const toggleButton = document.getElementById('toggleAuthMode');

    if (mode === 'register') {
        authTitle.textContent = 'Регистрация';
        authButton.textContent = 'Зарегистрироваться';
        emailInput.placeholder = 'Email';
        emailInput.style.display = 'block';
        emailInput.required = true;
        passwordConfirmField.style.display = 'block';
        toggleButton.textContent = 'У меня уже есть аккаунт';
    } else {
        authTitle.textContent = 'Вход';
        authButton.textContent = 'Вход';
        emailInput.style.display = 'none';
        emailInput.required = false;
        passwordConfirmField.style.display = 'none';
        toggleButton.textContent = 'Зарегистрироваться';
    }
}

// Обработка отправки формы аутентификации
document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const errorEl = document.getElementById('authError');
            errorEl.style.display = 'none';

            const username = document.getElementById('usernameInput').value.trim();
            const email = document.getElementById('emailInput').value.trim();
            const password = document.getElementById('passwordInput').value;

            if (!username || !password) {
                errorEl.textContent = 'Заполните имя пользователя и пароль';
                errorEl.style.display = 'block';
                return;
            }

            if (isRegisterMode) {
                const passwordConfirm = document.getElementById('passwordConfirmInput').value;
                if (password !== passwordConfirm) {
                    errorEl.textContent = 'Пароли не совпадают';
                    errorEl.style.display = 'block';
                    return;
                }
                if (password.length < 8) {
                    errorEl.textContent = 'Пароль должен быть минимум 8 символов';
                    errorEl.style.display = 'block';
                    return;
                }
            }

            await handleAuthSubmit(username, email, password, isRegisterMode);
        });
    }
});

// ==================== ЗАГРУЗКА ДАННЫХ ====================

/**
 * Загрузка и рендеринг списка исполнителей
 */
async function loadArtists() {
    try {
        const artists = await getArtists();
        renderArtists(artists);
    } catch (error) {
        showToast('Ошибка при загрузке исполнителей: ' + error.message, 'error');
        console.error('Error loading artists:', error);
    }
}

/**
 * Показ деталей исполнителя
 * @param {number} id - ID исполнителя
 */
async function showArtistDetail(id) {
    try {
        currentArtistId = id;
        hideAllSections();
        document.getElementById('artistDetailSection').style.display = 'block';
        const artist = await getArtistById(id);
        renderArtistDetail(artist);
    } catch (error) {
        showToast('Ошибка при загрузке деталей исполнителя: ' + error.message, 'error');
        console.error('Error loading artist details:', error);
    }
}

/**
 * Показ деталей трека
 * @param {number} id - ID трека
 */
async function showTrackDetail(id) {
    try {
        currentTrackId = id;
        hideAllSections();
        document.getElementById('trackDetailSection').style.display = 'block';
        const track = await getTrackById(id);
        const samples = await getSamplesByTrack(id);
        renderTrackDetail(track, samples);
    } catch (error) {
        showToast('Ошибка при загрузке деталей трека: ' + error.message, 'error');
        console.error('Error loading track details:', error);
    }
}

/**
 * Показ деталей сэмпла
 * @param {number} id - ID сэмпла
 */
async function showSampleDetail(id) {
    try {
        hideAllSections();
        document.getElementById('sampleDetailSection').style.display = 'block';
        const sample = await getSampleById(id);
        // Track context for back button
        currentArtistSlug = slugify(sample.track.artistName || sample.track.artist?.name || '');
        currentTrackSlug = slugify(sample.track.title);
        renderSampleDetail(sample.track, sample.sampledTrack, sample);
    } catch (error) {
        showToast('Ошибка при загрузке деталей сэмпла: ' + error.message, 'error');
        console.error('Error loading sample details:', error);
    }
}

/**
 * Загрузка и рендеринг истории правок
 */
async function loadRevisions() {
    try {
        const revisions = await getRevisions();
        renderRevisions(revisions);
    } catch (error) {
        showToast('Ошибка при загрузке истории: ' + error.message, 'error');
        console.error('Error loading revisions:', error);
    }
}

// ==================== ПОИСК ====================

/**
 * Выполнение поиска с дебаунсом
 */
const performSearch = debounce(async function() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        document.getElementById('searchResults').innerHTML = 
            '<p class="empty-state">Введите поисковый запрос</p>';
        return;
    }
    
    try {
        const results = await globalSearch(query);
        renderSearchResults(results);
    } catch (error) {
        showToast('Ошибка при поиске: ' + error.message, 'error');
        console.error('Error searching:', error);
    }
}, 300);

// ==================== ОБРАБОТКА СОБЫТИЙ ====================

/**
 * Обработка поиска при вводе в поле
 */
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }
});

/**
 * Обработка Enter для поиска
 */
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
});

// ==================== ЭКСПОРТ ФУНКЦИЙ ====================

window.navigateTo = navigateTo;
window.showPage = showPage;
window.showArtistDetail = showArtistDetail;
window.showTrackDetail = showTrackDetail;
window.showSampleDetail = showSampleDetail;
window.goBackToArtists = goBackToArtists;
window.goBackToArtist = goBackToArtist;
window.goBackToTrack = goBackToTrack;
window.toggleAuth = toggleAuth;
window.toggleAuthMode = toggleAuthMode;
window.performSearch = performSearch;
window.logout = logout;

console.log('✅ SampleWiki приложение загружено успешно');
