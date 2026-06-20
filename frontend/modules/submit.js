let currentSamplerArtistId = null;
let currentOriginalArtistId = null;
let samplerTrackFound = false;
let originalTrackFound = false;

function debounce(fn, ms) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
    };
}

// =================== ARTIST AUTOCOMPLETE ===================
function setupArtistAutocomplete(inputId, dropdownId, hiddenId, onSelect) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);

    const doSearch = debounce(async function () {
        const q = input.value.trim();
        if (q.length < 1) { dropdown.innerHTML = ''; dropdown.style.display = 'none'; return; }

        try {
            const results = await searchArtistsAPI(q);
            if (results.length === 0) {
                dropdown.innerHTML = '<div class="ac-item ac-empty">Новый артист</div>';
                dropdown.style.display = 'block';
                document.getElementById(hiddenId).value = '';
                return;
            }
            dropdown.innerHTML = results.map(a => `
                <div class="ac-item" data-id="${a.id}" data-name="${escapeHtml(a.name)}" data-img="${escapeHtml(a.imageUrl || '')}">
                    <div class="ac-thumb">${a.imageUrl ? `<img src="${a.imageUrl}" alt="">` : '<span>●</span>'}</div>
                    <div class="ac-name">${escapeHtml(a.name)}</div>
                </div>
            `).join('');
            dropdown.style.display = 'block';

            dropdown.querySelectorAll('.ac-item').forEach(el => {
                el.addEventListener('click', function () {
                    const id = this.dataset.id;
                    const name = this.dataset.name;
                    input.value = name;
                    document.getElementById(hiddenId).value = id;
                    dropdown.style.display = 'none';
                    if (onSelect) onSelect(parseInt(id), name);
                });
            });
        } catch (e) {
            console.error(e);
        }
    }, 250);

    input.addEventListener('input', function () {
        document.getElementById(hiddenId).value = '';
        if (onSelect) onSelect(null, '');
        doSearch();
    });

    input.addEventListener('blur', function () {
        setTimeout(() => { dropdown.style.display = 'none'; }, 200);
    });

    input.addEventListener('focus', function () {
        if (this.value.trim().length >= 1) doSearch();
    });
}

// =================== TRACK AUTOCOMPLETE ===================
function setupTrackAutocomplete(inputId, dropdownId, hiddenId, artistIdSource, foundMsgId, fieldsPrefix, onSelect) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    const foundMsg = document.getElementById(foundMsgId);

    const doSearch = debounce(async function () {
        const q = input.value.trim();
        const artistId = parseInt(document.getElementById(artistIdSource).value);

        if (q.length < 1) {
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
            foundMsg.style.display = 'none';
            return;
        }

        try {
            const results = await searchTracksAPI(q, artistId || undefined);
            if (results.length === 0) {
                dropdown.innerHTML = '<div class="ac-item ac-empty">Новый трек</div>';
                dropdown.style.display = 'block';
                document.getElementById(hiddenId).value = '';
                foundMsg.style.display = 'none';
                enableTrackFields(fieldsPrefix, true);
                return;
            }
            dropdown.innerHTML = results.map(t => `
                <div class="ac-item" data-id="${t.id}" data-title="${escapeHtml(t.title)}" data-genre="${escapeHtml(t.genre || '')}" data-url="${escapeHtml(t.resourceUrl || '')}" data-album="${escapeHtml(t.albumTitle || '')}" data-albumimg="${escapeHtml(t.albumImageUrl || '')}">
                    <div class="ac-thumb">${t.albumImageUrl ? `<img src="${t.albumImageUrl}" alt="">` : '<span>♫</span>'}</div>
                    <div class="ac-name">${escapeHtml(t.title)}</div>
                    <div class="ac-meta">${escapeHtml(t.artistName || '')}</div>
                </div>
            `).join('');
            dropdown.style.display = 'block';

            dropdown.querySelectorAll('.ac-item').forEach(el => {
                el.addEventListener('click', function () {
                    const id = parseInt(this.dataset.id);
                    const title = this.dataset.title;
                    input.value = title;
                    document.getElementById(hiddenId).value = id;
                    dropdown.style.display = 'none';

                    // Fill in details
                    if (this.dataset.album) document.getElementById(fieldsPrefix + 'AlbumInput').value = this.dataset.album;
                    if (this.dataset.genre) document.getElementById(fieldsPrefix + 'GenreInput').value = this.dataset.genre;
                    if (this.dataset.url) document.getElementById(fieldsPrefix + 'EmbedInput').value = this.dataset.url;
                    if (this.dataset.albumimg) document.getElementById(fieldsPrefix + 'ImageUrlInput').value = this.dataset.albumimg;

                    foundMsg.innerHTML = '✓ Найден в базе';
                    foundMsg.style.display = 'block';
                    enableTrackFields(fieldsPrefix, false);

                    if (onSelect) onSelect(id, title);
                });
            });
        } catch (e) {
            console.error(e);
        }
    }, 250);

    input.addEventListener('input', function () {
        document.getElementById(hiddenId).value = '';
        foundMsg.style.display = 'none';
        enableTrackFields(fieldsPrefix, true);
        doSearch();
    });

    input.addEventListener('blur', function () {
        setTimeout(() => { dropdown.style.display = 'none'; }, 200);
    });

    input.addEventListener('focus', function () {
        if (this.value.trim().length >= 1) doSearch();
    });
}

function enableTrackFields(prefix, enabled) {
    const fields = [prefix + 'GenreInput', prefix + 'AlbumInput',
                    prefix + 'YearInput', prefix + 'EmbedInput', prefix + 'ImageUrlInput'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !enabled;
    });
}

// =================== FORM SUBMIT ===================
async function handleSubmitForm() {
    const errorEl = document.getElementById('submitFormError');
    const submitBtn = document.getElementById('submitFormBtn');
    errorEl.style.display = 'none';

    // Validate
    const samplerArtist = document.getElementById('samplerArtistHidden').value || document.getElementById('samplerArtistInput').value.trim();
    if (!samplerArtist) { showError('Укажите артиста сэмплирующего трека'); return; }

    const samplerTrack = document.getElementById('samplerTrackHidden').value || document.getElementById('samplerTrackInput').value.trim();
    if (!samplerTrack) { showError('Укажите название сэмплирующего трека'); return; }

    const originalArtist = document.getElementById('originalArtistHidden').value || document.getElementById('originalArtistInput').value.trim();
    if (!originalArtist) { showError('Укажите артиста оригинального трека'); return; }

    const originalTrack = document.getElementById('originalTrackHidden').value || document.getElementById('originalTrackInput').value.trim();
    if (!originalTrack) { showError('Укажите название оригинального трека'); return; }

    // Build request
    const data = {
        sampleType: document.getElementById('sampleTypeSelect').value,
        startTimeSeconds: parseInt(document.getElementById('samplerTimeInput').value) || null,

        samplerArtistId: parseInt(document.getElementById('samplerArtistHidden').value) || null,
        samplerArtistName: document.getElementById('samplerArtistHidden').value ? null : document.getElementById('samplerArtistInput').value.trim(),

        samplerTrackId: parseInt(document.getElementById('samplerTrackHidden').value) || null,
        samplerTrackTitle: document.getElementById('samplerTrackHidden').value ? null : document.getElementById('samplerTrackInput').value.trim(),
        samplerTrackGenre: document.getElementById('samplerGenreInput').value.trim() || null,
        samplerTrackResourceUrl: document.getElementById('samplerEmbedInput').value.trim() || null,

        samplerAlbumTitle: document.getElementById('samplerAlbumInput').value.trim() || null,
        samplerAlbumReleaseYear: parseInt(document.getElementById('samplerYearInput').value) || null,
        samplerAlbumImageUrl: document.getElementById('samplerImageUrlInput').value.trim() || null,

        originalArtistId: parseInt(document.getElementById('originalArtistHidden').value) || null,
        originalArtistName: document.getElementById('originalArtistHidden').value ? null : document.getElementById('originalArtistInput').value.trim(),

        originalTrackId: parseInt(document.getElementById('originalTrackHidden').value) || null,
        originalTrackTitle: document.getElementById('originalTrackHidden').value ? null : document.getElementById('originalTrackInput').value.trim(),
        originalTrackGenre: document.getElementById('originalGenreInput').value.trim() || null,
        originalTrackResourceUrl: document.getElementById('originalEmbedInput').value.trim() || null,

        originalAlbumTitle: document.getElementById('originalAlbumInput').value.trim() || null,
        originalAlbumReleaseYear: parseInt(document.getElementById('originalYearInput').value) || null,
        originalAlbumImageUrl: document.getElementById('originalImageUrlInput').value.trim() || null
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Сохранение...';

    try {
        const result = await submitSample(data);
        showToast('Сэмпл создан!', 'success');
        // Redirect to the sampler track page
        window.location.href = 'track.html?id=' + result.samplerTrackId;
    } catch (e) {
        errorEl.textContent = e.message;
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Создать сэмпл';
    }
}

function showError(msg) {
    const el = document.getElementById('submitFormError');
    el.textContent = msg;
    el.style.display = 'block';
}

// =================== FILL TEST DATA ===================
function fillTestData() {
    document.getElementById('sampleTypeSelect').value = 'Sample';

    document.getElementById('samplerArtistInput').value = 'Kanye West';
    document.getElementById('samplerArtistHidden').value = '';
    document.getElementById('samplerTrackInput').value = 'Stronger';
    document.getElementById('samplerTrackHidden').value = '';
    document.getElementById('samplerGenreInput').value = 'Hip Hop';
    document.getElementById('samplerTimeInput').value = '0';
    document.getElementById('samplerAlbumInput').value = 'Graduation';
    document.getElementById('samplerYearInput').value = '2007';
    document.getElementById('samplerEmbedInput').value = 'https://youtube.com/watch?v=PsO6ZnUZI0g';
    document.getElementById('samplerImageUrlInput').value = '';

    document.getElementById('originalArtistInput').value = 'Daft Punk';
    document.getElementById('originalArtistHidden').value = '';
    document.getElementById('originalTrackInput').value = 'Harder, Better, Faster, Stronger';
    document.getElementById('originalTrackHidden').value = '';
    document.getElementById('originalGenreInput').value = 'Electronic';
    document.getElementById('originalTimeInput').value = '0';
    document.getElementById('originalAlbumInput').value = 'Discovery';
    document.getElementById('originalYearInput').value = '2001';
    document.getElementById('originalEmbedInput').value = 'https://youtube.com/watch?v=gAjR4_CbPpQ';
    document.getElementById('originalImageUrlInput').value = '';

    showToast('Тестовые данные заполнены', 'success');
}

async function handleFileUpload(inputId, urlInputId) {
    const fileInput = document.getElementById(inputId);
    const urlInput = document.getElementById(urlInputId);
    const file = fileInput.files[0];
    if (!file) return;

    try {
        const result = await uploadFile(file);
        urlInput.value = result.url;
        showToast('Изображение загружено', 'success');
    } catch (e) {
        showToast('Ошибка загрузки: ' + e.message, 'error');
    }
}
