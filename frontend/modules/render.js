function slugify(text) {
    if (!text) return '';
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

function embedUrlFromUrl(url) {
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
        const origin = window.location.origin;
        return {
            type: 'youtube',
            id: ytMatch[1],
            embed: `https://www.youtube.com/embed/${ytMatch[1]}?origin=${encodeURIComponent(origin)}&enablejsapi=1`
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
        const uid = 'yt-' + Math.random().toString(36).slice(2, 10);
        return `<iframe id="${uid}" width="100%" height="100%" src="${info.embed}" title="${escapeHtml(title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    }
    if (info.type === 'bandcamp') {
        return `<iframe style="border:0;width:100%;height:120px;" src="${info.embed}" seamless></iframe>`;
    }
    return '';
}

function sendYtCommand(iframe, command, args) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: command,
        args: args || []
    }), '*');
}

function jumpToTime(containerId, url, title, seconds) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const iframe = container.querySelector('iframe[src*="youtube.com"]');
    if (iframe) {
        sendYtCommand(iframe, 'seekTo', [seconds, true]);
        sendYtCommand(iframe, 'playVideo');
        return;
    }

    // Fallback: reload with start+autoplay
    const info = embedUrlFromUrl(url);
    if (info && info.type === 'youtube') {
        container.innerHTML = `<iframe width="100%" height="100%" src="${info.embed + '&start=' + seconds + '&autoplay=1'}" title="${escapeHtml(title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    }
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
        <div class="card" onclick="window.location.href='artist.html?id=${artist.id}'">
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
            <div class="card" onclick="window.location.href='album.html?id=${album.id}'">
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
                            <div class="card" onclick="window.location.href='track.html?id=${track.id}'">
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
        html += results.artists.map(a => `<div class="card" onclick="window.location.href='artist.html?id=${a.id}'"><h4>${escapeHtml(a.name)}</h4><p style="font-size:0.85rem;color:#8888a0;">Исполнитель</p></div>`).join('');
    }
    if (results.tracks?.length > 0) {
        html += `<h3 style="grid-column:1/-1;color:#7c3aed;">Треки</h3>`;
        html += results.tracks.map(t => `<div class="card" onclick="window.location.href='track.html?id=${t.id}'"><h4>${escapeHtml(t.title)}</h4><p>⏱️ ${formatTime(t.durationSeconds)}</p><p style="font-size:0.85rem;color:#8888a0;">${t.genre || 'Жанр не указан'}</p></div>`).join('');
    }
    if (results.samples?.length > 0) {
        html += `<h3 style="grid-column:1/-1;color:#7c3aed;">Сэмплы</h3>`;
        html += results.samples.map(s => `<div class="card" onclick="window.location.href='sample.html?id=${s.id}'"><h4>${escapeHtml(s.sampledTrackTitle || 'Сэмпл')}</h4><p style="font-size:0.85rem;color:#8888a0;">${escapeHtml(s.sampledTrackArtistName || '')}</p><p style="font-size:0.85rem;">Тип: ${s.type}</p></div>`).join('');
    }
    container.innerHTML = html;
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
                    <div class="sample-card" onclick="window.location.href='sample.html?id=${s.id}'">
                        <h4>${escapeHtml(s.sampledTrackTitle)} ${getSampleTypeBadge(s.type)}</h4>
                        <p style="font-size:0.85rem;color:#8888a0;margin-bottom:0.5rem;">${escapeHtml(s.sampledTrackArtistName || '')}</p>
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

function renderAlbumDetail(album) {
    const detail = document.getElementById('albumDetail');
    detail.innerHTML = `
        <div class="track-detail-layout">
            <div class="track-info-card">
                <div class="detail-header">
                    <h2>${escapeHtml(album.title)}</h2>
                    <p class="detail-meta">${album.releaseYear ? '📅 ' + album.releaseYear : ''} · ${album.artist ? escapeHtml(album.artist.name) : ''}</p>
                </div>
                ${album.imageUrl ? `<img src="${escapeHtml(album.imageUrl)}" alt="${escapeHtml(album.title)}" style="max-width:300px;border-radius:10px;margin-bottom:1rem;">` : ''}
                ${album.description ? `<div class="detail-body"><p>${escapeHtml(album.description)}</p></div>` : ''}
            </div>
            ${album.tracks && album.tracks.length > 0 ? `
                <div class="detail-section">
                    <h3>Треки (${album.tracks.length})</h3>
                    <div class="grid">
                        ${album.tracks.map(track => `
                            <div class="card" onclick="window.location.href='track.html?id=${track.id}'">
                                <h4>${escapeHtml(track.title)}</h4>
                                <p>⏱️ ${formatTime(track.durationSeconds)}</p>
                                <p style="font-size:0.85rem;color:#8888a0;">${track.genre || ''}</p>
                            </div>`).join('')}
                    </div>
                </div>` : ''}
        </div>`;
}

function renderSampleDetail(samplerTrack, sampledTrack, sample) {
    const detail = document.getElementById('sampleDetail');

    detail.innerHTML = `
        <div class="track-detail-layout">
            <div class="track-info-card">
                <h2 style="text-align:center;margin-bottom:1.5rem;">${escapeHtml(samplerTrack.title)} заимствует из ${escapeHtml(sampledTrack.title)}</h2>
                <div class="sample-video-grid">
                    <div class="sample-video-col">
                        <h3 class="sample-video-label">В ЭТОМ ТРЕКЕ</h3>
                        <div class="embed-16-9" id="track-embed-container">${embedHtml(samplerTrack.resourceUrl, samplerTrack.title)}</div>
                        <div style="margin-top:0.75rem;">
                            <p style="font-weight:600;"><a style="color:#7c3aed;text-decoration:none;cursor:pointer;" href="track.html?id=${samplerTrack.id}">${escapeHtml(samplerTrack.title)}</a></p>
                            <p style="color:#8888a0;font-size:0.85rem;">${escapeHtml(samplerTrack.artistName || 'Неизвестен')}</p>
                            ${sample.startTimeSeconds != null
                                ? `<span class="sample-timecode-big" data-url="${escapeHtml(samplerTrack.resourceUrl)}" data-title="${escapeHtml(samplerTrack.title)}" data-seconds="${sample.startTimeSeconds}" onclick="jumpTrackEmbed(this)">⏱ ${formatTime(sample.startTimeSeconds)}</span>`
                                : ''}
                            <div style="margin-top:0.5rem;"><a href="track.html?id=${samplerTrack.id}" class="listen-btn">К треку →</a></div>
                        </div>
                    </div>
                    <div class="sample-video-col">
                        <h3 class="sample-video-label">ОТКУДА ПОЗАИМСТВОВАНО</h3>
                        ${sampledTrack.resourceUrl
                            ? `<div class="embed-16-9">${embedHtml(sampledTrack.resourceUrl, sampledTrack.title)}</div>`
                            : '<div class="embed-16-9" style="background:#f8f6fc;display:flex;align-items:center;justify-content:center;color:#8888a0;">Видео не добавлено</div>'}
                        <div style="margin-top:0.75rem;">
                            <p style="font-weight:600;"><a style="color:#7c3aed;text-decoration:none;cursor:pointer;" href="track.html?id=${sampledTrack.id}">${escapeHtml(sampledTrack.title)}</a> ${getSampleTypeBadge(sample.type)}</p>
                            <p style="color:#8888a0;font-size:0.85rem;">${escapeHtml(sampledTrack.artistName || 'Неизвестен')}</p>
                            ${sample.description ? `<p style="color:#8888a0;font-size:0.85rem;">${truncateText(sample.description, 120)}</p>` : ''}
                            ${sampledTrack.resourceUrl ? `<div style="margin-top:0.5rem;"><a href="track.html?id=${sampledTrack.id}" class="listen-btn">К треку →</a></div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}
