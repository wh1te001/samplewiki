const API_BASE = 'http://localhost:5000/api';

async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    const config = {
        ...options,
        headers,
        credentials: 'include'
    };
    
    try {
        const response = await fetch(url, config);
        
        if (response.status === 401) {
            clearCurrentUser();
            if (typeof updateUIAuthState === 'function') {
                updateUIAuthState();
            }
        }
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== ALBUMS ====================

/**
 * Получить все альбомы
 * @returns {Promise<Array>} Список альбомов
 */
async function getAllAlbums() {
    return apiFetch('/albums');
}

// ==================== ARTISTS ====================

/**
 * Получить всех исполнителей
 * @returns {Promise<Array>} Список исполнителей
 */
async function getArtists() {
    return apiFetch('/artists');
}

/**
 * Получить исполнителя по ID
 * @param {number} id - ID исполнителя
 * @returns {Promise<object>} Информация об исполнителе с альбомами и треками
 */
async function getArtistById(id) {
    return apiFetch(`/artists/${id}`);
}

/**
 * Создать нового исполнителя
 * @param {string} name - Название исполнителя
 * @param {string} description - Описание
 * @param {string} wikiLink - Ссылка на Wikipedia
 * @returns {Promise<object>} Созданный исполнитель
 */
async function createArtist(name, description, wikiLink) {
    return apiFetch('/artists', {
        method: 'POST',
        body: JSON.stringify({ name, description, wikiLink })
    });
}

/**
 * Обновить исполнителя
 * @param {number} id - ID исполнителя
 * @param {object} data - Данные для обновления { name, description, wikiLink }
 * @returns {Promise<object>} Обновленный исполнитель
 */
async function updateArtist(id, data) {
    return apiFetch(`/artists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Удалить исполнителя
 * @param {number} id - ID исполнителя
 * @returns {Promise<object>} Результат удаления
 */
async function deleteArtist(id) {
    return apiFetch(`/artists/${id}`, { method: 'DELETE' });
}

// ==================== TRACKS ====================

/**
 * Получить все треки
 * @returns {Promise<Array>} Список треков
 */
async function getTracks() {
    return apiFetch('/tracks');
}

/**
 * Получить трек по ID
 * @param {number} id - ID трека
 * @returns {Promise<object>} Информация о треке с полной иерархией
 */
async function getTrackById(id) {
    return apiFetch(`/tracks/${id}`);
}

/**
 * Получить альбом по ID
 * @param {number} id - ID альбома
 * @returns {Promise<object>} Информация об альбоме с треками
 */
async function getAlbumById(id) {
    return apiFetch(`/albums/${id}`);
}

/**
 * Получить треки альбома
 * @param {number} albumId - ID альбома
 * @returns {Promise<Array>} Список треков в альбоме
 */
async function getTracksByAlbum(albumId) {
    return apiFetch(`/tracks/album/${albumId}`);
}

/**
 * Создать новый трек
 * @param {object} trackData - Данные трека
 * @returns {Promise<object>} Созданный трек
 */
async function createTrack(trackData) {
    return apiFetch('/tracks', {
        method: 'POST',
        body: JSON.stringify(trackData)
    });
}

/**
 * Обновить трек
 * @param {number} id - ID трека
 * @param {object} trackData - Данные для обновления
 * @returns {Promise<object>} Обновленный трек
 */
async function updateTrack(id, trackData) {
    return apiFetch(`/tracks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(trackData)
    });
}

/**
 * Удалить трек
 * @param {number} id - ID трека
 * @returns {Promise<object>} Результат удаления
 */
async function deleteTrack(id) {
    return apiFetch(`/tracks/${id}`, { method: 'DELETE' });
}

// ==================== SAMPLES ====================

/**
 * Получить все сэмплы
 * @returns {Promise<Array>} Список сэмплов
 */
async function getSamples() {
    return apiFetch('/samples');
}

/**
 * Получить сэмпл по ID
 * @param {number} id - ID сэмпла
 * @returns {Promise<object>} Информация о сэмпле
 */
async function getSampleById(id) {
    return apiFetch(`/samples/${id}`);
}

/**
 * Получить сэмплы трека
 * @param {number} trackId - ID трека
 * @returns {Promise<Array>} Список сэмплов в треке
 */
async function getSamplesByTrack(trackId) {
    return apiFetch(`/samples/track/${trackId}`);
}

/**
 * Создать новый сэмпл
 * @param {object} sampleData - Данные сэмпла
 * @returns {Promise<object>} Созданный сэмпл
 */
async function createSample(sampleData) {
    return apiFetch('/samples', {
        method: 'POST',
        body: JSON.stringify(sampleData)
    });
}

/**
 * Обновить сэмпл
 * @param {number} id - ID сэмпла
 * @param {object} sampleData - Данные для обновления
 * @returns {Promise<object>} Обновленный сэмпл
 */
async function updateSample(id, sampleData) {
    return apiFetch(`/samples/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sampleData)
    });
}

/**
 * Удалить сэмпл
 * @param {number} id - ID сэмпла
 * @returns {Promise<object>} Результат удаления
 */
async function deleteSample(id) {
    return apiFetch(`/samples/${id}`, { method: 'DELETE' });
}

// ==================== REVISIONS ====================

/**
 * Получить все правки (историю изменений)
 * @returns {Promise<Array>} Список правок
 */
async function getRevisions() {
    return apiFetch('/revisions');
}

/**
 * Получить правки трека
 * @param {number} trackId - ID трека
 * @returns {Promise<Array>} Список правок трека
 */
async function getRevisionsByTrack(trackId) {
    return apiFetch(`/revisions/track/${trackId}`);
}

/**
 * Получить правки пользователя
 * @param {number} userId - ID пользователя
 * @returns {Promise<Array>} Список правок пользователя
 */
async function getRevisionsByUser(userId) {
    return apiFetch(`/revisions/user/${userId}`);
}

// ==================== SEARCH ====================

/**
 * Поиск исполнителей
 * @param {string} query - Поисковый запрос
 * @param {number} limit - Максимум результатов
 * @returns {Promise<Array>} Результаты поиска
 */
async function searchArtists(query, limit = 10) {
    // Может быть реализовано через отдельный endpoint или фильтрацию на клиенте
    if (!query) return [];
    const artists = await getArtists();
    return artists.filter(a => a.name.toLowerCase().includes(query.toLowerCase())).slice(0, limit);
}

/**
 * Поиск треков
 * @param {string} query - Поисковый запрос
 * @param {number} limit - Максимум результатов
 * @returns {Promise<Array>} Результаты поиска
 */
async function searchTracks(query, limit = 10) {
    if (!query) return [];
    const tracks = await getTracks();
    return tracks.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        (t.genre && t.genre.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, limit);
}

/**
 * Глобальный поиск
 * @param {string} query - Поисковый запрос
 * @returns {Promise<object>} Результаты по всем типам
 */
async function globalSearch(query) {
    if (!query) return { artists: [], tracks: [], samples: [] };
    
    try {
        const         [artists, tracks, samples] = await Promise.all([
            searchArtists(query, 5),
            searchTracks(query, 5),
            getSamples().then(s => s.filter(sample =>
                (sample.sampledTrackTitle && sample.sampledTrackTitle.toLowerCase().includes(query.toLowerCase())) ||
                (sample.description && sample.description.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 5))
        ]);
        
        return { artists, tracks, samples };
    } catch (error) {
        console.error('Search error:', error);
        return { artists: [], tracks: [], samples: [] };
    }
}
