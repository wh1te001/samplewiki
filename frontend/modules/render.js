function embedUrlFromUrl(url) {
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
        const origin = window.location.origin;
        return {
            type: 'youtube',
            id: ytMatch[1],
            embed: `https://www.youtube.com/embed/${ytMatch[1]}?origin=${encodeURIComponent(origin)}`
        };
    }
    // Bandcamp
    if (url.includes('bandcamp.com')) {
        const bcMatch = url.match(/bandcamp\.com\/track\/([a-zA-Z0-9_-]+)/);
        if (bcMatch) return { type: 'bandcamp', id: bcMatch[1], embed: `https://bandcamp.com/EmbeddedPlayer/track=${bcMatch[1]}/size=large/bgcol=ffffff/linkcol=7c3aed/tracklist=false/transparent=true/` };
        return { type: 'bandcamp', id: url, embed: `https://bandcamp.com/EmbeddedPlayer/track=${encodeURIComponent(url)}/size=large/bgcol=ffffff/linkcol=7c3aed/tracklist=false/transparent=true/` };
    }
    return null;
}

function embedHtml(url, title, startSeconds = 0) {
    const info = embedUrlFromUrl(url);
    if (!info) return '';
    if (info.type === 'youtube') {
        const src = startSeconds > 0
            ? info.embed + '&start=' + startSeconds
            : info.embed;
        return `<iframe width="100%" height="100%" src="${src}" title="${escapeHtml(title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    }
    if (info.type === 'bandcamp') {
        return `<iframe style="border:0;width:100%;height:120px;" src="${info.embed}" seamless></iframe>`;
    }
    return '';
}

function jumpToTime(containerId, url, title, seconds) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = embedHtml(url, title, seconds);
}

function jumpTrackEmbed(el) {
    const url = el.getAttribute('data-url');
    const title = el.getAttribute('data-title');
    const seconds = parseInt(el.getAttribute('data-seconds'), 10);
    if (url && !isNaN(seconds)) {
        jumpToTime('track-embed-container', url, title, seconds);
    }
}

async function renderArtists(artists) {
    const artistsList = document.getElementById('artistsList');
    if (!artists || artists.length === 0) {
        artistsList.innerHTML = '<p class="empty-state">Исполнители не найдены</p>';
        return;
    }
    artistsList.innerHTML = artists.map(artist => `
        <div class="card" onclick="navigateTo('artist/${artist.id}')">
            <h3>${escapeHtml(artist.name)}</h3>
            <p>${artist.description ? truncateText(artist.description, 80) : 'Нет описания'}</p>
            <p style="font-size: 0.8rem; color: #8888a0;">
                📅 ${formatDate(artist.createdAt)}
            </p>
            ${artist.wikipediaLink ? `<a href="${artist.wikipediaLink}" target="_blank" style="color: #7c3aed;">Подробнее →</a>` : ''}
        </div>
    `).join('');
}

function renderArtistDetail(artist) {
    const detail = document.getElementById('artistDetail');
    const albumsHtml = artist.albums && artist.albums.length > 0
        ? `<div class="detail-section"><h3>Альбомы (${artist.albums.length})</h3><div class="grid">${artist.albums.map(album => `
            <div class="card">
                <h4>${escapeHtml(album.title)}</h4>
                <p>${album.releaseYear ? `📅 ${album.releaseYear}` : 'Год не указан'}</p>
                <p style="font-size: 0.85rem; color: #8888a0;">${album.tracks ? album.tracks.length : 0} треков</p>
            </div>`).join('')}</div></div>` : '';
    detail.innerHTML = `
        <div class="track-detail-layout">
            <div class="track-info-card">
                <div class="detail-header">
                    <h2>${escapeHtml(artist.name)}</h2>
                    <p class="detail-meta">📅 Добавлено: ${formatDate(artist.createdAt)}</p>
                </div>
                <div class="detail-body">
                    ${artist.description ? `<p>${escapeHtml(artist.description)}</p>` : '<p style="color: #8888a0;">Описание не добавлено</p>'}
                </div>
                ${artist.wikipediaLink ? `<a href="${artist.wikipediaLink}" target="_blank" class="btn-primary">Открыть в Wikipedia →</a>` : ''}
            </div>
            ${albumsHtml}
            ${artist.tracks && artist.tracks.length > 0 ? `
                <div class="detail-section">
                    <h3>Треки (${artist.tracks.length})</h3>
                    <div class="grid">
                        ${artist.tracks.map(track => `
                            <div class="card" onclick="navigateTo('track/${track.id}')">
                                <h4>${escapeHtml(track.title)}</h4>
                                <p>⏱️ ${formatTime(track.durationSeconds)}</p>
                                <p style="font-size: 0.85rem; color: #8888a0;">${track.genre || 'Жанр не указан'}</p>
                                <p style="font-size: 0.85rem; color: #7c3aed;">Нажми для подробнее →</p>
                            </div>`).join('')}
                    </div>
                </div>` : ''}
        </div>`;
}

function renderSearchResults(results) {
    const container = document.getElementById('searchResults');
    if (!results || (results.artists?.length === 0 && results.tracks?.length === 0 && results.samples?.length === 0)) {
        container.innerHTML = '<p class="empty-state">Ничего не найдено</p>';
        return;
    }
    let html = '';
    if (results.artists?.length > 0) {
        html += `<h3 style="grid-column:1/-1;color:#7c3aed;">Исполнители</h3>`;
        html += results.artists.map(a => `<div class="card" onclick="navigateTo('artist/${a.id}')"><h4>${escapeHtml(a.name)}</h4><p style="font-size:0.85rem;color:#8888a0;">Исполнитель</p></div>`).join('');
    }
    if (results.tracks?.length > 0) {
        html += `<h3 style="grid-column:1/-1;color:#7c3aed;">Треки</h3>`;
        html += results.tracks.map(t => `<div class="card" onclick="navigateTo('track/${t.id}')"><h4>${escapeHtml(t.title)}</h4><p>⏱️ ${formatTime(t.durationSeconds)}</p><p style="font-size:0.85rem;color:#8888a0;">${t.genre || 'Жанр не указан'}</p></div>`).join('');
    }
    if (results.samples?.length > 0) {
        html += `<h3 style="grid-column:1/-1;color:#7c3aed;">Сэмплы</h3>`;
        html += results.samples.map(s => `<div class="card" onclick="navigateTo('sample/${s.id}')"><h4>${escapeHtml(s.title)}</h4><p style="font-size:0.85rem;">Тип: ${s.type}</p></div>`).join('');
    }
    container.innerHTML = html;
}

function renderRevisions(revisions) {
    const history = document.getElementById('historyList');
    if (!revisions || revisions.length === 0) {
        history.innerHTML = '<p class="empty-state">История пуста</p>';
        return;
    }
    history.innerHTML = revisions.map(r => `
        <div class="history-item">
            <div class="history-item-title">
                ${changeTypeEmoji(r.changeType)} ${escapeHtml(r.entityName)}
                ${r.changeType === 'Created' ? 'создана' : r.changeType === 'Updated' ? 'обновлена' : 'удалена'}
            </div>
            <div class="history-item-date">${formatDate(r.createdAt)}</div>
            <div class="history-item-changes">${escapeHtml(r.description)}</div>
        </div>`).join('');
}

function changeTypeEmoji(type) {
    switch (type) { case 'Created': return '✅'; case 'Updated': return '🔄'; case 'Deleted': return '❌'; default: return '📝'; }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getSampleTypeBadge(type) {
    const map = { 'Sample': 'Сэмпл', 'Interpolation': 'Интерполяция', 'Cover': 'Кавер', 'Remix': 'Ремикс' };
    return `<span class="sample-type-badge">${map[type] || type}</span>`;
}

function renderTrackDetail(track, samples) {
    const detail = document.getElementById('trackDetail');
    const hasTrackEmbed = !!embedUrlFromUrl(track.resourceUrl);
    const samplesHtml = samples && samples.length > 0
        ? `<div class="samples-section">
            <h3>Сэмплы в этом треке (${samples.length})</h3>
            <p style="color: #8888a0; margin-bottom: 1rem;">Нажми на сэмпл, чтобы увидеть детали</p>
            <div class="samples-list">
                ${samples.map(s => `
                    <div class="sample-card" onclick="navigateTo('sample/${s.id}')">
                        <h4>${escapeHtml(s.title)} ${getSampleTypeBadge(s.type)}</h4>
                        ${s.startTimeSeconds != null
                            ? `<span class="sample-timecode" data-url="${escapeHtml(track.resourceUrl)}" data-title="${escapeHtml(track.title)}" data-seconds="${s.startTimeSeconds}" onclick="event.stopPropagation(); jumpTrackEmbed(this)">⏱ ${formatTime(s.startTimeSeconds)}</span>`
                            : ''}
                        ${s.description ? `<p>${truncateText(s.description, 100)}</p>` : ''}
                        <p style="font-size:0.85rem;color:#7c3aed;">Подробнее →</p>
                    </div>`).join('')}
            </div>
        </div>`
        : '<div class="samples-section"><p style="color: #8888a0; text-align:center;">Сэмплы не добавлены</p></div>';

    detail.innerHTML = `
        <div class="track-detail-layout">
            <div class="track-info-card">
                <div class="track-artwork-row">
                    ${track.album && track.album.imageUrl
                        ? `<img src="${escapeHtml(track.album.imageUrl)}" alt="Album Artwork">`
                        : `<div class="track-artwork-placeholder">🎵</div>`}
                    <div class="track-meta">
                        <h2>${escapeHtml(track.title)}</h2>
                        <p>Исполнитель: <strong>${escapeHtml(track.artist ? track.artist.name : 'Неизвестен')}</strong></p>
                        ${track.album ? `<p>Альбом: <strong>${escapeHtml(track.album.title)}</strong></p>` : ''}
                        <p>Жанр: <strong>${track.genre || 'Не указан'}</strong></p>
                        <p>Длительность: <strong>⏱️ ${formatTime(track.durationSeconds)}</strong></p>
                        ${track.album && track.album.releaseYear ? `<p>Год выпуска: <strong>📅 ${track.album.releaseYear}</strong></p>` : ''}
                        ${track.album && track.album.description ? `<p style="margin-top:0.5rem;color:#6b6b80;font-size:0.9rem;">${escapeHtml(track.album.description)}</p>` : ''}
                        ${track.resourceUrl ? `<div style="margin-top:0.75rem;"><a href="${escapeHtml(track.resourceUrl)}" target="_blank" class="listen-btn">🎵 Слушать на YouTube →</a></div>` : ''}
                    </div>
                </div>
                ${hasTrackEmbed ? `<div class="embed-16-9" id="track-embed-container">${embedHtml(track.resourceUrl, track.title)}</div>` : ''}
            </div>
            ${samplesHtml}
        </div>`;
}

function renderSampleDetail(originalTrack, sample) {
    const detail = document.getElementById('sampleDetail');
    const hasSourceEmbed = sample.sourceUrl && !!embedUrlFromUrl(sample.sourceUrl);

    detail.innerHTML = `
        <div class="track-detail-layout">
            <div class="track-info-card">
                <h2 style="text-align:center;margin-bottom:1.5rem;">${escapeHtml(originalTrack.title)} заимствует из ${escapeHtml(sample.title)}</h2>
                <div class="sample-video-grid">
                    <div class="sample-video-col">
                        <h3 class="sample-video-label">В ЭТОМ ТРЕКЕ</h3>
                        <div class="embed-16-9" id="track-embed-container">${embedHtml(originalTrack.resourceUrl, originalTrack.title)}</div>
                        <div style="margin-top:0.75rem;">
                            <p style="font-weight:600;">${escapeHtml(originalTrack.title)}</p>
                            <p style="color:#8888a0;font-size:0.85rem;">${escapeHtml(originalTrack.artist ? originalTrack.artist.name : 'Неизвестен')}</p>
                            ${sample.startTimeSeconds != null
                                ? `<span class="sample-timecode-big" data-url="${escapeHtml(originalTrack.resourceUrl)}" data-title="${escapeHtml(originalTrack.title)}" data-seconds="${sample.startTimeSeconds}" onclick="jumpTrackEmbed(this)">⏱ ${formatTime(sample.startTimeSeconds)}</span>`
                                : ''}
                            <div style="margin-top:0.5rem;"><a href="${escapeHtml(originalTrack.resourceUrl)}" target="_blank" class="listen-btn">Слушать трек →</a></div>
                        </div>
                    </div>
                    <div class="sample-video-col">
                        <h3 class="sample-video-label">ОТКУДА ПОЗАИМСТВОВАНО</h3>
                        ${sample.sourceUrl
                            ? `<div class="embed-16-9">${embedHtml(sample.sourceUrl, sample.title)}</div>`
                            : '<div class="embed-16-9" style="background:#f8f6fc;display:flex;align-items:center;justify-content:center;color:#8888a0;">Видео не добавлено</div>'}
                        <div style="margin-top:0.75rem;">
                            <p style="font-weight:600;">${escapeHtml(sample.title)} ${getSampleTypeBadge(sample.type)}</p>
                            ${sample.description ? `<p style="color:#8888a0;font-size:0.85rem;">${truncateText(sample.description, 120)}</p>` : ''}
                            ${sample.sourceUrl ? `<div style="margin-top:0.5rem;"><a href="${escapeHtml(sample.sourceUrl)}" target="_blank" class="listen-btn">Слушать оригинал →</a></div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}
