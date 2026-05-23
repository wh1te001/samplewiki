/**
 * render.js - Рендеринг компонентов интерфейса
 */

/**
 * Отрендерить список исполнителей
 * @param {Array} artists - Массив исполнителей
 */
async function renderArtists(artists) {
    const artistsList = document.getElementById('artistsList');
    
    if (!artists || artists.length === 0) {
        artistsList.innerHTML = '<p class="empty-state">Исполнители не найдены</p>';
        return;
    }
    
    artistsList.innerHTML = artists.map(artist => `
        <div class="card" onclick="showArtistDetail(${artist.id})">
            <h3>${escapeHtml(artist.name)}</h3>
            <p>${artist.description ? truncateText(artist.description, 80) : 'Нет описания'}</p>
            <p style="font-size: 0.8rem; color: #777;">
                📅 ${formatDate(artist.createdAt)}
            </p>
            ${artist.wikipediaLink ? `<a href="${artist.wikipediaLink}" target="_blank" style="color: #ff5500;">Подробнее →</a>` : ''}
        </div>
    `).join('');
}

/**
 * Отрендерить детали исполнителя
 * @param {object} artist - Информация об исполнителе
 */
function renderArtistDetail(artist) {
    const detail = document.getElementById('artistDetail');
    
    const albumsHtml = artist.albums && artist.albums.length > 0
        ? `<div class="detail-section">
            <h3>Альбомы (${artist.albums.length})</h3>
            <div class="grid">
                ${artist.albums.map(album => `
                    <div class="card">
                        <h4>${escapeHtml(album.title)}</h4>
                        <p>${album.releaseYear ? `📅 ${album.releaseYear}` : 'Год не указан'}</p>
                        <p style="font-size: 0.85rem; color: #777;">${album.tracks ? album.tracks.length : 0} треков</p>
                    </div>
                `).join('')}
            </div>
        </div>`
        : '';
    
    detail.innerHTML = `
        <div class="detail-header">
            <h2>${escapeHtml(artist.name)}</h2>
            <p class="detail-meta">
                📅 Добавлено: ${formatDate(artist.createdAt)}
            </p>
        </div>
        
        <div class="detail-body">
            ${artist.description ? `
                <p>${escapeHtml(artist.description)}</p>
            ` : '<p style="color: #777;">Описание не добавлено</p>'}
        </div>
        
        ${artist.wikipediaLink ? `
            <div class="detail-section">
                <a href="${artist.wikipediaLink}" target="_blank" class="btn-primary">
                    Открыть в Wikipedia →
                </a>
            </div>
        ` : ''}
        
        ${albumsHtml}
        
        ${artist.tracks && artist.tracks.length > 0 ? `
            <div class="detail-section">
                <h3>Треки (${artist.tracks.length})</h3>
                <div class="grid">
                    ${artist.tracks.map(track => `
                        <div class="card" onclick="showTrackDetail(${track.id})" style="cursor: pointer; transition: transform 0.2s;">
                            <h4>${escapeHtml(track.title)}</h4>
                            <p>⏱️ ${formatTime(track.durationSeconds)}</p>
                            <p style="font-size: 0.85rem; color: #777;">${track.genre || 'Жанр не указан'}</p>
                            <p style="font-size: 0.85rem; color: #ff5500;">Нажми для подробнее →</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

/**
 * Отрендерить результаты поиска
 * @param {object} results - Результаты поиска
 */
function renderSearchResults(results) {
    const container = document.getElementById('searchResults');
    
    if (!results || (results.artists?.length === 0 && results.tracks?.length === 0 && results.samples?.length === 0)) {
        container.innerHTML = '<p class="empty-state">Ничего не найдено</p>';
        return;
    }
    
    let html = '';
    
    if (results.artists && results.artists.length > 0) {
        html += `<h3 style="grid-column: 1 / -1; color: #ff5500;">Исполнители</h3>`;
        html += results.artists.map(artist => `
            <div class="card" onclick="showArtistDetail(${artist.id})">
                <h4>${escapeHtml(artist.name)}</h4>
                <p style="font-size: 0.85rem; color: #777;">Исполнитель</p>
            </div>
        `).join('');
    }
    
    if (results.tracks && results.tracks.length > 0) {
        html += `<h3 style="grid-column: 1 / -1; color: #ff5500;">Треки</h3>`;
        html += results.tracks.map(track => `
            <div class="card" onclick="showTrackDetail(${track.id})">
                <h4>${escapeHtml(track.title)}</h4>
                <p>⏱️ ${formatTime(track.durationSeconds)}</p>
                <p style="font-size: 0.85rem; color: #777;">${track.genre || 'Жанр не указан'}</p>
            </div>
        `).join('');
    }
    
    if (results.samples && results.samples.length > 0) {
        html += `<h3 style="grid-column: 1 / -1; color: #ff5500;">Сэмплы</h3>`;
        html += results.samples.map(sample => `
            <div class="card" onclick="showSampleDetail(${sample.id})">
                <h4>${escapeHtml(sample.title)}</h4>
                <p style="font-size: 0.85rem;">Тип: ${sample.type}</p>
            </div>
        `).join('');
    }
    
    container.innerHTML = html;
}

/**
 * Отрендерить историю правок
 * @param {Array} revisions - Список правок
 */
function renderRevisions(revisions) {
    const history = document.getElementById('historyList');
    
    if (!revisions || revisions.length === 0) {
        history.innerHTML = '<p class="empty-state">История пуста</p>';
        return;
    }
    
    history.innerHTML = revisions.map(revision => `
        <div class="history-item">
            <div class="history-item-title">
                ${getChangeTypeEmoji(revision.changeType)} ${escapeHtml(revision.entityName)} 
                ${revision.changeType === 'Created' ? 'создана' : revision.changeType === 'Updated' ? 'обновлена' : 'удалена'}
            </div>
            <div class="history-item-date">
                ${formatDate(revision.createdAt)}
            </div>
            <div class="history-item-changes">
                ${escapeHtml(revision.description)}
            </div>
        </div>
    `).join('');
}

/**
 * Получить эмодзи для типа изменения
 * @param {string} changeType - Тип изменения (Created, Updated, Deleted)
 * @returns {string} Эмодзи
 */
function getChangeTypeEmoji(changeType) {
    switch (changeType) {
        case 'Created': return '✅';
        case 'Updated': return '🔄';
        case 'Deleted': return '❌';
        default: return '📝';
    }
}

/**
 * Экранирование HTML специальных символов
 * @param {string} text - Текст
 * @returns {string} Экранированный текст
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Отрендерить детали трека
 * @param {object} track - Информация о треке
 * @param {Array} samples - Массив сэмплов трека
 */
function renderTrackDetail(track, samples) {
    const detail = document.getElementById('trackDetail');
    
    const samplesHtml = samples && samples.length > 0
        ? `<div class="detail-section">
            <h3>Сэмплы в этом треке (${samples.length})</h3>
            <p style="color: #999; margin-bottom: 1rem;">Нажми на сэмпл, чтобы увидеть детали</p>
            <div class="samples-list">
                ${samples.map(sample => `
                    <div class="sample-card" onclick="showSampleDetail(${sample.id})" style="cursor: pointer;">
                        <h4>${escapeHtml(sample.title)}</h4>
                        <p style="font-size: 0.85rem; color: #777;">
                            Тип: ${sample.type}
                        </p>
                        <p style="font-size: 0.85rem; color: #ff5500;">Подробнее →</p>
                    </div>
                `).join('')}
            </div>
        </div>`
        : '<div class="detail-section"><p style="color: #999;">Сэмплы не добавлены</p></div>';
    
    detail.innerHTML = `
        <div class="track-detail-layout">
            <div class="track-artwork">
                ${track.album && track.album.imageUrl ? `
                    <img src="${escapeHtml(track.album.imageUrl)}" alt="Album Artwork" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 8px 20px rgba(0,0,0,0.5);">
                ` : `
                    <div style="width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #777; font-size: 3rem;">🎵</div>
                `}
            </div>
            
            <div class="track-info-section">
                <div class="detail-header">
                    <h2>${escapeHtml(track.title)}</h2>
                    <p class="detail-meta">
                        Исполнитель: <strong>${escapeHtml(track.artist ? track.artist.name : 'Неизвестен')}</strong>
                    </p>
                </div>
                
                <div class="detail-body">
                    <div class="track-info">
                        ${track.album ? `<p><strong>Альбом:</strong> ${escapeHtml(track.album.title)}</p>` : ''}
                        <p><strong>Жанр:</strong> ${track.genre || 'Не указан'}</p>
                        <p><strong>Длительность:</strong> ⏱️ ${formatTime(track.durationSeconds)}</p>
                        ${track.album && track.album.releaseYear ? `<p><strong>Год выпуска:</strong> 📅 ${track.album.releaseYear}</p>` : ''}
                        ${track.album && track.album.description ? `<p><strong>Описание альбома:</strong> ${escapeHtml(track.album.description)}</p>` : ''}
                        ${track.resourceUrl ? `
                            <p>
                                <strong>Ссылка на трек:</strong> 
                                <a href="${escapeHtml(track.resourceUrl)}" target="_blank" style="color: #ff5500; text-decoration: none; font-weight: 500;">
                                    Слушать →
                                </a>
                            </p>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
        
        ${samplesHtml}
    `;
}

/**
 * Отрендерить детали сэмпла
 * @param {object} originalTrack - Трек, в котором использован сэмпл
 * @param {object} sample - Информация о сэмпле
 */
function renderSampleDetail(originalTrack, sample) {
    const detail = document.getElementById('sampleDetail');
    
    detail.innerHTML = `
        <div class="track-detail-layout">
            <div class="track-artwork">
                ${originalTrack.album && originalTrack.album.imageUrl ? `
                    <img src="${escapeHtml(originalTrack.album.imageUrl)}" alt="Album Artwork" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 8px 20px rgba(0,0,0,0.5);">
                ` : `
                    <div style="width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #777; font-size: 3rem;">🎵</div>
                `}
            </div>
            
            <div class="track-info-section">
                <div class="detail-header">
                    <h2>${escapeHtml(originalTrack.title)}</h2>
                    <p class="detail-meta">
                        Исполнитель: <strong>${escapeHtml(originalTrack.artist ? originalTrack.artist.name : 'Неизвестен')}</strong>
                    </p>
                </div>
                
                <div class="detail-body">
                    <div class="track-info">
                        <p><strong style="color: #ff5500;">🔊 В ЭТОЙ ПЕСНЕ ИСПОЛЬЗУЕТСЯ СЭМПЛ</strong></p>
                        ${originalTrack.album ? `<p><strong>Альбом:</strong> ${escapeHtml(originalTrack.album.title)}</p>` : ''}
                        <p><strong>Жанр:</strong> ${originalTrack.genre || 'Не указан'}</p>
                        <p><strong>Длительность:</strong> ⏱️ ${formatTime(originalTrack.durationSeconds)}</p>
                        ${originalTrack.album && originalTrack.album.releaseYear ? `<p><strong>Год выпуска:</strong> 📅 ${originalTrack.album.releaseYear}</p>` : ''}
                        ${originalTrack.resourceUrl ? `
                            <div style="margin-top: 1rem;">
                                <a href="${escapeHtml(originalTrack.resourceUrl)}" target="_blank" style="display: inline-block; padding: 0.7rem 1.2rem; background-color: #ff5500; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; transition: background-color 0.2s;">
                                    🎵 Слушать трек →
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="detail-section" style="margin-top: 2rem;">
                    <h3 style="color: #999;">ОТКУДА ПОЗАИМСТВОВАНО</h3>
                    <div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ff5500;">
                        <h4 style="color: #ff5500; margin-bottom: 0.5rem;">${escapeHtml(sample.title)}</h4>
                        <p style="color: #999; margin-bottom: 0.5rem;"><strong>Тип сэмпла:</strong> ${sample.type}</p>
                        ${sample.description ? `<p style="color: #b0b0b0; line-height: 1.6;">${escapeHtml(sample.description)}</p>` : '<p style="color: #777;">Описание не добавлено</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}


