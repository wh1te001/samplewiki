/**
 * app.js - Главный файл приложения SampleWiki
 * 
 * Это интегрирующий модуль, который связывает все части приложения:
 * - управление навигацией
 * - загрузку данных
 * - обработку пользовательских событий
 */

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

/**
 * Инициализация приложения при загрузке страницы
 */
async function initializeApp() {
    console.log('🚀 Инициализация приложения SampleWiki...');
    
    updateUIAuthState();
    handleRoute();
    
    if (!getToken()) {
        console.log('Пользователь не аутентифицирован');
    } else {
        console.log('✅ Пользователь аутентифицирован:', getCurrentUser().username);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initializeApp);

// ==================== РОУТИНГ ====================

// Сохранение текущего контекста для навигации
let currentArtistId = null;
let currentTrackId = null;

/**
 * Навигация по hash-роуту
 * @param {string} path - Путь (artists, search, history, artist/5, track/3, sample/2)
 */
function navigateTo(path) {
    window.location.hash = path;
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
 * Обработка текущего hash-роута
 */
function handleRoute() {
    const hash = window.location.hash.slice(1) || 'artists';
    
    const artistMatch = hash.match(/^artist\/(\d+)$/);
    const trackMatch = hash.match(/^track\/(\d+)$/);
    const sampleMatch = hash.match(/^sample\/(\d+)$/);
    
    if (artistMatch) {
        currentArtistId = parseInt(artistMatch[1]);
        showArtistDetail(currentArtistId);
    } else if (trackMatch) {
        currentTrackId = parseInt(trackMatch[1]);
        showTrackDetail(currentTrackId);
    } else if (sampleMatch) {
        showSampleDetail(parseInt(sampleMatch[1]));
    } else if (hash === 'search') {
        showPage('search');
    } else if (hash === 'history') {
        showPage('history');
    } else {
        showPage('artists');
    }
}

// Слушаем изменения hash в URL
window.addEventListener('hashchange', handleRoute);

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
function goBackToArtists() { navigateTo('artists'); }

/**
 * Вернуться к исполнителю из трека
 */
function goBackToArtist() { if (currentArtistId) navigateTo('artist/' + currentArtistId); }

/**
 * Вернуться к треку из сэмпла
 */
function goBackToTrack() { if (currentTrackId) navigateTo('track/' + currentTrackId); }

// ==================== АУТЕНТИФИКАЦИЯ ====================

/** Флаг для отслеживания режима аутентификации (вход/регистрация) */
let isRegisterMode = false;

/**
 * Переключение между формой входа и регистрации
 */
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    
    const authTitle = document.getElementById('authTitle');
    const authButton = document.getElementById('authButton');
    const emailInput = document.getElementById('emailInput');
    const toggleButton = document.getElementById('toggleAuthMode');
    
    if (isRegisterMode) {
        authTitle.textContent = 'Регистрация';
        authButton.textContent = 'Зарегистрироваться';
        emailInput.style.display = 'block';
        emailInput.required = true;
        toggleButton.textContent = 'У меня уже есть аккаунт';
    } else {
        authTitle.textContent = 'Вход';
        authButton.textContent = 'Вход';
        emailInput.style.display = 'none';
        emailInput.required = false;
        toggleButton.textContent = 'Зарегистрироваться';
    }
    
    // Очистка формы
    document.getElementById('authForm').reset();
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
        toggleAuthMode(); // Сброс в режим входа
    }
}

// Обработка отправки формы аутентификации
document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('usernameInput').value;
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            
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
        const track = await getTrackById(sample.trackId);
        renderSampleDetail(track, sample);
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
