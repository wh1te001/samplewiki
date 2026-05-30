function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
}
// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});
// Close modal on Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
});

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
        if (bcMatch) return { type: 'bandcamp', id: bcMatch[1], embed: `https://bandcamp.com/EmbeddedPlayer/track=${bcMatch[1]}/size=large/bgcol=ffffff/linkcol=cc0000/tracklist=false/transparent=true/` };
        return { type: 'bandcamp', id: url, embed: `https://bandcamp.com/EmbeddedPlayer/track=${encodeURIComponent(url)}/size=large/bgcol=ffffff/linkcol=cc0000/tracklist=false/transparent=true/` };
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
        artistsList.innerHTML = '<div class="empty-state">Исполнители не найдены</div>';
        return;
    }
    artistsList.innerHTML = artists.map(artist => `
        <div class="card" onclick="window.location.href='artist.html?id=${artist.id}'">
            <div class="thumbnail-40-placeholder">●</div>
            <div style="flex:1;display:flex;align-items:center;justify-content:space-between;">
                <div>
                    <h3>${escapeHtml(artist.name)}</h3>
                    <p>${artist.trackCount || 0} треков</p>
                </div>
                <span style="color:#bbb;font-size:1.2rem;">→</span>
            </div>
        </div>
    `).join('');
}

function renderArtistDetail(artist) {
    const detail = document.getElementById('artistDetail');
    const tracks = artist.tracks || [];
    const albums = artist.albums || [];

    let html = `<div class="breadcrumb">
        <a href="index.html">Исполнители</a> <span>›</span>
        <span class="current">${escapeHtml(artist.name)}</span>
    </div>`;

    html += `<div class="page-header"><h1>${escapeHtml(artist.name)}</h1>`;
    if (artist.description) {
        html += `<p class="subtitle">${escapeHtml(artist.description)}</p>`;
    }
    if (artist.wikipediaLink) {
        html += `<p style="margin-top:0.5rem;"><a href="${artist.wikipediaLink}" target="_blank" style="color:#cc0000;font-size:0.85rem;">Wikipedia →</a></p>`;
    }
    html += `</div>`;

    if (tracks.length > 0) {
        html += `<div class="detail-section"><h3>Треки (${tracks.length})</h3>`;
        html += `<table><thead><tr><th>#</th><th>Название</th><th>Длительность</th><th>Жанр</th></tr></thead><tbody>`;
        tracks.forEach((t, i) => {
            html += `<tr class="track-row" onclick="window.location.href='track.html?id=${t.id}'">
                <td>${i + 1}</td>
                <td class="track-title-cell"><a href="track.html?id=${t.id}" onclick="event.stopPropagation();">${escapeHtml(t.title)}</a></td>
                <td class="track-meta-cell">${formatTime(t.durationSeconds)}</td>
                <td class="track-meta-cell">${escapeHtml(t.genre || '')}</td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
    }

    if (albums.length > 0) {
        html += `<div class="detail-section"><h3>Альбомы (${albums.length})</h3>`;
        html += `<table><thead><tr><th>Название</th><th>Год</th><th>Треков</th></tr></thead><tbody>`;
        albums.forEach(a => {
            html += `<tr class="track-row" onclick="window.location.href='album.html?id=${a.id}'">
                <td class="track-title-cell"><a href="album.html?id=${a.id}" onclick="event.stopPropagation();">${escapeHtml(a.title)}</a></td>
                <td class="track-meta-cell">${a.releaseYear || '—'}</td>
                <td class="track-meta-cell">${a.tracks ? a.tracks.length : 0}</td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
    }

    if (tracks.length === 0 && albums.length === 0) {
        html += `<div class="empty-state">Нет треков и альбомов</div>`;
    }

    detail.innerHTML = html;
}

function renderSearchResults(results) {
    const container = document.getElementById('searchResults');
    if (!results || (!results.artists?.length && !results.tracks?.length && !results.samples?.length)) {
        container.innerHTML = '<div class="empty-state">Ничего не найдено</div>';
        return;
    }
    let html = '';
    if (results.artists?.length) {
        html += `<div class="detail-section" style="margin-bottom:1.5rem;"><h3>Исполнители</h3>`;
        results.artists.forEach(a => {
            html += `<div class="card" onclick="window.location.href='artist.html?id=${a.id}'">
                <div class="thumbnail-40-placeholder">●</div>
                <div style="flex:1;display:flex;align-items:center;justify-content:space-between;">
                    <div><h3>${escapeHtml(a.name)}</h3><p>Исполнитель</p></div>
                    <span style="color:#bbb;">→</span>
                </div>
            </div>`;
        });
        html += `</div>`;
    }
    if (results.tracks?.length) {
        html += `<div class="detail-section" style="margin-bottom:1.5rem;"><h3>Треки</h3>`;
        results.tracks.forEach(t => {
            html += `<div class="card" onclick="window.location.href='track.html?id=${t.id}'">
                <div class="thumbnail-40-placeholder">♫</div>
                <div style="flex:1;display:flex;align-items:center;justify-content:space-between;">
                    <div><h3>${escapeHtml(t.title)}</h3><p>${formatTime(t.durationSeconds)} · ${escapeHtml(t.genre || '')}</p></div>
                    <span style="color:#bbb;">→</span>
                </div>
            </div>`;
        });
        html += `</div>`;
    }
    if (results.samples?.length) {
        html += `<div class="detail-section" style="margin-bottom:1.5rem;"><h3>Сэмплы</h3>`;
        results.samples.forEach(s => {
            html += `<div class="card" onclick="window.location.href='sample.html?id=${s.id}'">
                <div class="thumbnail-40-placeholder">♫</div>
                <div style="flex:1;display:flex;align-items:center;justify-content:space-between;">
                    <div><h3>${escapeHtml(s.sampledTrackTitle || 'Сэмпл')}</h3><p>${escapeHtml(s.sampledTrackArtistName || '')} · ${getSampleTypeBadge(s.type)}</p></div>
                    <span style="color:#bbb;">→</span>
                </div>
            </div>`;
        });
        html += `</div>`;
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
    const artistName = track.artist ? track.artist.name : 'Неизвестен';
    const albumTitle = track.album ? track.album.title : null;
    const hasTrackEmbed = !!embedUrlFromUrl(track.resourceUrl);

    let html = `<div class="breadcrumb">
        <a href="index.html">Исполнители</a> <span>›</span>
        <a href="artist.html?id=${track.artistId}">${escapeHtml(artistName)}</a> <span>›</span>
        <span class="current">${escapeHtml(track.title)}</span>
    </div>`;

    html += `<div class="track-header">`;
    html += `<div class="track-header-cover">`;
    if (track.album && track.album.imageUrl) {
        html += `<img src="${escapeHtml(track.album.imageUrl)}" alt="">`;
    } else {
        html += `<div class="placeholder">♫</div>`;
    }
    html += `</div>`;
    html += `<div class="track-header-info">`;
    html += `<h1>${escapeHtml(track.title)}</h1>`;
    html += `<div class="artist-link"><a href="artist.html?id=${track.artistId}">${escapeHtml(artistName)}</a></div>`;
    html += `<div class="track-header-meta">`;
    if (albumTitle) html += `<span><span class="label">Альбом</span> <strong>${escapeHtml(albumTitle)}</strong></span>`;
    if (track.album && track.album.releaseYear) html += `<span><span class="label">Год</span> <strong>${track.album.releaseYear}</strong></span>`;
    if (track.genre) html += `<span><span class="label">Жанр</span> <strong>${escapeHtml(track.genre)}</strong></span>`;
    if (track.durationSeconds) html += `<span><span class="label">Длительность</span> <strong>${formatTime(track.durationSeconds)}</strong></span>`;
    html += `</div>`;
    if (track.resourceUrl) {
        html += `<div style="margin-top:0.5rem;"><a href="${escapeHtml(track.resourceUrl)}" target="_blank" class="listen-link">Слушать на YouTube →</a></div>`;
    }
    html += `</div></div>`;

    if (hasTrackEmbed) {
        html += `<div class="embed-16-9" id="track-embed-container">${embedHtml(track.resourceUrl, track.title)}</div>`;
    }

    if (samples && samples.length > 0) {
        html += `<div class="detail-section"><h3>Song Connections (${samples.length})</h3>`;
        html += `<table class="connections-table"><thead><tr><th></th><th>Название</th><th>Исполнитель</th><th>Тип</th></tr></thead><tbody>`;
        samples.forEach(s => {
            html += `<tr class="track-row" onclick="window.location.href='sample.html?id=${s.id}'">
                <td><div class="thumbnail-40-placeholder">♫</div></td>
                <td class="track-title-cell">
                    <a href="sample.html?id=${s.id}" onclick="event.stopPropagation();">${escapeHtml(s.sampledTrackTitle)}</a>
                    ${s.startTimeSeconds != null ? `<span class="sample-timecode" data-url="${escapeHtml(track.resourceUrl)}" data-title="${escapeHtml(track.title)}" data-seconds="${s.startTimeSeconds}" onclick="event.stopPropagation(); jumpTrackEmbed(this)">${formatTime(s.startTimeSeconds)}</span>` : ''}
                </td>
                <td class="track-artist-cell">${escapeHtml(s.sampledTrackArtistName || '')}</td>
                <td>${getSampleTypeBadge(s.type)}</td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
    } else {
        html += `<div class="empty-state">Сэмплы не добавлены</div>`;
    }

    detail.innerHTML = html;
}

function renderAlbumDetail(album) {
    const detail = document.getElementById('albumDetail');
    const artistName = album.artist ? album.artist.name : 'Неизвестен';
    const tracks = album.tracks || [];

    let html = `<div class="breadcrumb">
        <a href="index.html">Исполнители</a> <span>›</span>
        <a href="artist.html?id=${album.artistId}">${escapeHtml(artistName)}</a> <span>›</span>
        <span class="current">${escapeHtml(album.title)}</span>
    </div>`;

    html += `<div class="track-header">`;
    html += `<div class="track-header-cover">`;
    if (album.imageUrl) {
        html += `<img src="${escapeHtml(album.imageUrl)}" alt="">`;
    } else {
        html += `<div class="placeholder">♫</div>`;
    }
    html += `</div>`;
    html += `<div class="track-header-info">`;
    html += `<h1>${escapeHtml(album.title)}</h1>`;
    html += `<div class="artist-link"><a href="artist.html?id=${album.artistId}">${escapeHtml(artistName)}</a></div>`;
    html += `<div class="track-header-meta">`;
    if (album.releaseYear) html += `<span><span class="label">Год</span> <strong>${album.releaseYear}</strong></span>`;
    html += `<span><span class="label">Треков</span> <strong>${tracks.length}</strong></span>`;
    html += `</div>`;
    if (album.description) {
        html += `<p style="margin-top:0.5rem;color:#666;font-size:0.85rem;">${escapeHtml(album.description)}</p>`;
    }
    html += `</div></div>`;

    if (tracks.length > 0) {
        html += `<div class="detail-section"><h3>Треки</h3>`;
        html += `<table><thead><tr><th>#</th><th>Название</th><th>Длительность</th><th>Жанр</th></tr></thead><tbody>`;
        tracks.forEach((t, i) => {
            html += `<tr class="track-row" onclick="window.location.href='track.html?id=${t.id}'">
                <td>${i + 1}</td>
                <td class="track-title-cell"><a href="track.html?id=${t.id}" onclick="event.stopPropagation();">${escapeHtml(t.title)}</a></td>
                <td class="track-meta-cell">${formatTime(t.durationSeconds)}</td>
                <td class="track-meta-cell">${escapeHtml(t.genre || '')}</td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
    }

    detail.innerHTML = html;
}

function renderSampleDetail(samplerTrack, sampledTrack, sample) {
    const detail = document.getElementById('sampleDetail');

    let html = `<div class="breadcrumb">
        <a href="index.html">Исполнители</a> <span>›</span>
        <a href="artist.html?id=${samplerTrack.artistId || ''}">${escapeHtml(samplerTrack.artistName || '')}</a> <span>›</span>
        <a href="track.html?id=${samplerTrack.id}">${escapeHtml(samplerTrack.title)}</a> <span>›</span>
        <span class="current">Сэмпл</span>
    </div>`;

    html += `<div class="page-header" style="margin-bottom:1rem;"><h1>${escapeHtml(samplerTrack.title)}» содержит «${escapeHtml(sampledTrack.title)}»</h1></div>`;

    html += `<div class="sample-video-grid">`;
    html += `<div class="sample-video-col">`;
    html += `<h3 class="sample-video-label">В ЭТОМ ТРЕКЕ</h3>`;
    if (samplerTrack.resourceUrl) {
        html += `<div class="embed-16-9" id="track-embed-container">${embedHtml(samplerTrack.resourceUrl, samplerTrack.title)}</div>`;
    } else {
        html += `<div class="embed-16-9" style="background:#f5f5f5;display:flex;align-items:center;justify-content:center;color:#888;font-size:0.85rem;">Видео не добавлено</div>`;
    }
    html += `<div style="margin-top:0.5rem;">
        <a href="track.html?id=${samplerTrack.id}" style="color:#cc0000;font-weight:600;font-size:0.85rem;text-decoration:none;">${escapeHtml(samplerTrack.title)}</a>
        <p style="color:#888;font-size:0.8rem;">${escapeHtml(samplerTrack.artistName || '')}</p>`;
    if (sample.startTimeSeconds != null) {
        html += `<span class="sample-timecode-big" data-url="${escapeHtml(samplerTrack.resourceUrl)}" data-title="${escapeHtml(samplerTrack.title)}" data-seconds="${sample.startTimeSeconds}" onclick="jumpTrackEmbed(this)">⏱ ${formatTime(sample.startTimeSeconds)}</span>`;
    }
    html += `</div></div>`;

    html += `<div class="sample-video-col">`;
    html += `<h3 class="sample-video-label">ОТКУДА ПОЗАИМСТВОВАНО</h3>`;
    if (sampledTrack.resourceUrl) {
        html += `<div class="embed-16-9">${embedHtml(sampledTrack.resourceUrl, sampledTrack.title)}</div>`;
    } else {
        html += `<div class="embed-16-9" style="background:#f5f5f5;display:flex;align-items:center;justify-content:center;color:#888;font-size:0.85rem;">Видео не добавлено</div>`;
    }
    html += `<div style="margin-top:0.5rem;">
        <a href="track.html?id=${sampledTrack.id}" style="color:#cc0000;font-weight:600;font-size:0.85rem;text-decoration:none;">${escapeHtml(sampledTrack.title)}</a> ${getSampleTypeBadge(sample.type)}
        <p style="color:#888;font-size:0.8rem;">${escapeHtml(sampledTrack.artistName || '')}</p>`;
    if (sample.description) {
        html += `<p style="color:#666;font-size:0.85rem;margin-top:0.25rem;">${escapeHtml(sample.description)}</p>`;
    }
    html += `</div></div></div>`;

    detail.innerHTML = html;
}
