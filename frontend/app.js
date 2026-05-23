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
    
    // Обновление состояния аутентификации в UI
    updateUIAuthState();
    
    // Загрузка исполнителей при старте
    loadArtists();
    
    // Проверка токена при загрузке страницы
    if (!getToken()) {
        console.log('Пользователь не аутентифицирован');
    } else {
        console.log('✅ Пользователь аутентифицирован:', getCurrentUser().username);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initializeApp);

// ==================== УПРАВЛЕНИЕ СТРАНИЦАМИ ====================

// Сохранение текущего контекста для навигации
let currentArtistId = null;
let currentTrackId = null;

/**
 * Переключение между разделами приложения
 * @param {string} page - Название страницы (artists, search, history, artist, track, sample)
 */
function showPage(page) {
    // Скрытие всех секций
    document.getElementById('artistsSection').style.display = 'none';
    document.getElementById('artistDetailSection').style.display = 'none';
    document.getElementById('trackDetailSection').style.display = 'none';
    document.getElementById('sampleDetailSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'none';
    document.getElementById('authSection').style.display = 'none';
    
    // Показ необходимой секции
    switch (page) {
        case 'artists':
            document.getElementById('artistsSection').style.display = 'block';
            loadArtists();
            break;
        case 'artist':
            if (currentArtistId) {
                document.getElementById('artistDetailSection').style.display = 'block';
                showArtistDetail(currentArtistId);
            }
            break;
        case 'track':
            if (currentTrackId) {
                document.getElementById('trackDetailSection').style.display = 'block';
                showTrackDetail(currentTrackId);
            }
            break;
        case 'sample':
            document.getElementById('sampleDetailSection').style.display = 'block';
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
        const artist = await getArtistById(id);
        renderArtistDetail(artist);
        
        // Переключение на секцию деталей
        document.getElementById('artistsSection').style.display = 'none';
        document.getElementById('artistDetailSection').style.display = 'block';
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
        const track = await getTrackById(id);
        const samples = await getSamplesByTrack(id);
        renderTrackDetail(track, samples);
        
        // Переключение на секцию деталей трека
        document.getElementById('artistDetailSection').style.display = 'none';
        document.getElementById('trackDetailSection').style.display = 'block';
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
        const sample = await getSampleById(id);
        const track = await getTrackById(sample.trackId);
        renderSampleDetail(track, sample);
        
        // Переключение на секцию деталей сэмпла
        document.getElementById('trackDetailSection').style.display = 'none';
        document.getElementById('sampleDetailSection').style.display = 'block';
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

// ==================== ЛЕНИВАЯ ЗАГРУЗКА IFRAME ====================

/**
 * Ленивая загрузка iframe элементов при прокрутке
 */
window.addEventListener('scroll', function() {
    const iframes = document.querySelectorAll('iframe[data-src]');
    iframes.forEach(iframe => lazyLoadIframe(iframe));
});

// Инициальная проверка при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const iframes = document.querySelectorAll('iframe[data-src]');
    iframes.forEach(iframe => lazyLoadIframe(iframe));
});

// ==================== УТИЛИТЫ ====================

/**
 * Экспортирование функций для глобального использования
 * (для onclick обработчиков в HTML)
 */
window.showPage = showPage;
window.showArtistDetail = showArtistDetail;
window.toggleAuth = toggleAuth;
window.toggleAuthMode = toggleAuthMode;
window.performSearch = performSearch;
window.showSampleEmbed = showSampleEmbed;
window.closeModal = closeModal;
window.logout = logout;

console.log('✅ SampleWiki приложение загружено успешно');
