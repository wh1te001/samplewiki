const API_BASE = 'http://localhost:5000/api';

async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const config = { ...options, headers, credentials: 'include' };

    try {
        const response = await fetch(url, config);
        if (response.status === 401) {
            clearCurrentUser();
            if (typeof updateUIAuthState === 'function') updateUIAuthState();
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
async function getAllAlbums() { return apiFetch('/albums'); }
async function getAlbumById(id) { return apiFetch(`/albums/${id}`); }

// ==================== ARTISTS ====================
async function getArtists() { return apiFetch('/artists'); }
async function getArtistById(id) { return apiFetch(`/artists/${id}`); }

// ==================== TRACKS ====================
async function getTracks() { return apiFetch('/tracks'); }
async function getTrackById(id) { return apiFetch(`/tracks/${id}`); }
async function getTracksByAlbum(albumId) { return apiFetch(`/tracks/album/${albumId}`); }

// ==================== SAMPLES ====================
async function getSamples() { return apiFetch('/samples'); }
async function getSampleById(id) { return apiFetch(`/samples/${id}`); }
async function getSamplesByTrack(trackId) { return apiFetch(`/samples/track/${trackId}`); }

// ==================== SEARCH (server-side) ====================
async function searchArtistsAPI(query) {
    if (!query || query.length < 1) return [];
    return apiFetch(`/search/artists?q=${encodeURIComponent(query)}`);
}

async function searchTracksAPI(query, artistId) {
    if (!query || query.length < 1) return [];
    let url = `/search/tracks?q=${encodeURIComponent(query)}`;
    if (artistId) url += `&artistId=${artistId}`;
    return apiFetch(url);
}

// ==================== SUBMIT ====================
async function submitSample(data) {
    return apiFetch('/submit', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// ==================== UPLOAD ====================
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Ошибка загрузки' }));
        throw new Error(err.error || 'Ошибка загрузки');
    }
    return await response.json();
}

// ==================== REVISIONS ====================
async function getRevisions() { return apiFetch('/revisions'); }
async function getRevisionsByTrack(trackId) { return apiFetch(`/revisions/track/${trackId}`); }
async function getRevisionsByUser(userId) { return apiFetch(`/revisions/user/${userId}`); }

// ==================== SEARCH (client-side fallback) ====================
async function globalSearch(query) {
    if (!query) return { artists: [], tracks: [], samples: [] };
    try {
        const [artists, tracks, samples] = await Promise.all([
            getArtists().then(a => a.filter(x => x.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)),
            getTracks().then(t => t.filter(x => x.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5)),
            getSamples().then(s => s.filter(x =>
                x.sampledTrackTitle && x.sampledTrackTitle.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5))
        ]);
        return { artists, tracks, samples };
    } catch (error) {
        console.error('Search error:', error);
        return { artists: [], tracks: [], samples: [] };
    }
}
