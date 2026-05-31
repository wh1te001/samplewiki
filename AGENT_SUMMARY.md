# ДЕТАЛЬНОЕ SUMMARY ПРОЕКТА SAMPLEWIKI ДЛЯ ДРУГИХ АГЕНТОВ

**Дата обновления:** 31 Май 2026  
**Версия:** 2.0 — Редизайн под whosampled.com, MPA + CORS, embed, reverse samples  
**Статус:** Development

---

## ОБЗОР ПРОЕКТА

**SampleWiki** — каталог музыкальных сэмплов (Wikipedia для сэмплов).  
Суть: трек A содержит сэмпл из трека B. Показывает, кто кого засемплировал.

**Архитектура: MPA + CORS (два сервера)**
```
Браузер ──GET──→ Python :8000 (serve.py)
                  ↓
              index.html, artist.html, track.html, ...
                  ↓ (JS fetch с credentials: 'include')
ASP.NET :5000 ──→ MySQL
   ↑
/api/artists, /api/tracks, /api/samples, /api/albums,
/api/auth (register, login, logout, me), /api/search, /api/revisions
```

---

## СТЕК ТЕХНОЛОГИЙ

| Компонент | Технология |
|---|---|
| Backend API | ASP.NET Core (.NET 8) на порту 5000 |
| Frontend | Статические HTML + Vanilla JS + CSS (MPA) |
| Статический сервер | Python `http.server` на порту 8000 |
| База данных | MySQL (EF Core + Pomelo) |
| Аутентификация | JWT в httpOnly cookie (HMAC-SHA256, 24ч) |
| Хеширование паролей | BCrypt.Net |
| Документация API | Swagger (на корне `/`) |
| Rate Limiting | ASP.NET FixedWindow, 10/min/IP |
| CORS | Только localhost:8000, AllowCredentials |

---

## МОДЕЛЬ ДАННЫХ (сущности БД)

### Схема связей

```
Artist ──1:N──→ Album ──1:N──→ Track ──1:N──→ Sample
                                   ↑              ↓
                                   │    SampledBy │
                                   └──────←───────┘
                                    (Sample.TrackId + Sample.SampledTrackId)

User ──1:N──→ Track
User ──1:N──→ Revision
Album ──1:N──→ Artwork (обложки)
```

**Entity Framework Core:**
- `AppDbContext` содержит `DbSet<User>`, `DbSet<Artist>`, `DbSet<Album>`, `DbSet<Track>`, `DbSet<Sample>`, `DbSet<Artwork>`, `DbSet<Revision>`
- Relationship: One-to-Many с OnDelete Cascade
- SampledBy: `Track.SampledBy` — коллекция Sample, где `Sample.SampledTrackId == Track.Id`

### Детали сущностей

**Artist**
- Id, Name, Description (nullable), WikiLink (nullable), UserId, CreatedAt, UpdatedAt
- Связи: Albums (List<Album>), Tracks (List<Track>)
- TrackCount: вычисляемое поле в ArtistDto (через Count())
- Поиск: по Name и Description (case-insensitive)

**Album** (*Description удалён*)
- Id, Title, ReleaseYear (nullable), ArtistId, UserId, CreatedAt, UpdatedAt
- Связи: Artist (1), Tracks (List<Track>), Artworks (List<Artwork>)

**Track**
- Id, Title, TrackNumber (nullable), Genre (nullable), ResourceUrl (nullable, удалён из проекта), AlbumId, ArtistId, UserId, CreatedAt, UpdatedAt
- Навигация:
  - `Samples` — сэмплы, которые этот трек использует (Sample.TrackId == Track.Id)
  - `SampledBy` — сэмплы, в которых этот трек использован как источник (Sample.SampledTrackId == Track.Id) — *добавлено 31.05*
- Отображается с breadcrumb: Исполнитель > Альбом > Трек

**Sample** (*Description, Platform, PlatformId, StartTime, EndTime удалены*)
- Id, Type (Sample/Interpolation/Remake), StartTimeSeconds (nullable), TrackId (sampler), SampledTrackId (source), UserId, CreatedAt, UpdatedAt
- Связи: Track (sampler), SampledTrack (source)

**User**
- Id, Username (unique), Email (unique), PasswordHash (BCrypt), Role (Guest/User/Admin), IsActive, LastLoginAt, CreatedAt, UpdatedAt
- Связи: Tracks (List<Track>), Revisions (List<Revision>)

**Artwork**
- Id, ImageUrl, AlbumId (nullable), SortOrder

**Revision**
- Id, TrackId, UserId, OldValues (JSON), NewValues (JSON), CreatedAt
- Полный аудит изменений треков

---

## API ENDPOINTS

**Auth** (`POST /api/auth/register|login|logout`, `GET /api/auth/me`)
- httpOnly cookie (не Bearer token)
- Rate Limited (10/min/IP)
- Register: Regex `^(?=.*\d).{8,}$`

**Artists** (`GET /api/artists`, `GET /api/artists/{id}`, `POST /api/artists`)
- GET /{id} возвращает ArtistDetailDto с Albums и Tracks

**Tracks** (`GET /api/tracks`, `GET /api/tracks/{id}`, `GET /api/tracks/album/{albumId}`, `POST /api/tracks`, `PUT /api/tracks/{id}`)
- GET /{id} возвращает TrackDetailDto с Samples, SampledBy, Album, Artist

**Samples** (`GET /api/samples`, `GET /api/samples/{id}`, `GET /api/samples/track/{trackId}`, `POST /api/samples`, `PUT /api/samples/{id}`)

**Albums** (`GET /api/albums/{id}`)
- AlbumDetailDto с треками, исполнителем, обложками

**Search** (`GET /api/search/artists?q=`, `GET /api/search/tracks?q=&artistId=`)
- Для автокомплита на submit.html

**Submit** (`POST /api/submit`)
- Создание артиста + альбома + трека + сэмпла в одной транзакции

**Upload** (`POST /api/upload`)
- multipart/form-data, возвращает URL

**Revisions** (`GET /api/revisions`, `GET /api/revisions/track/{trackId}`, `GET /api/revisions/user/{userId}`)

---

## АРХИТЕКТУРА FRONTEND

### Страницы (MPA — Multi Page Application)

| Файл | URL | Описание |
|---|---|---|
| `index.html` | `/` | Главная: список исполнителей |
| `artist.html` | `/artist.html?id=1` | Детально об исполнителе |
| `album.html` | `/album.html?id=1` | Детально об альбоме |
| `track.html` | `/track.html?id=1` | Трек + сэмплы (откуда) + SampledBy (куда) |
| `sample.html` | `/sample.html?id=1` | Детально о сэмпле |
| `search.html` | `/search.html?q=...` | Глобальный поиск |
| `auth.html` | `/auth.html` | Вход |
| `register.html` | `/register.html` | Регистрация |
| `submit.html` | `/submit.html` | Создание сэмпла (авторизованные) |

### JS модули

- **api.js** — `fetch`-обёртка с `credentials: 'include'`, функции для всех API эндпоинтов
- **auth.js** — `register()`, `login()`, `logout()`, `checkAuth()`, `updateUIAuthState()`
- **render.js** — отрисовка: художники, альбомы, треки (с SampledBy), сэмплы, поиск
- **utils.js** — `getCurrentUser()`, `saveCurrentUser()`, `showToast()`, `formatDuration()`, `navbarSearch()`
- **submit.js** — автокомплит артистов/треков, загрузка файлов, создание сэмпла

### Дизайн (whosampled.com стиль)

- Navbar: #292827, высота 52px, grid-layout (лого слева / поиск центр / auth справа)
- Акцент: #cc0000
- Шрифт: Open Sans
- Таблицы для треков
- Breadcrumb навигация
- Song Connections таблицы (Samples / SampledBy)
- Inline-поиск в navbar на всех страницах

### Embed

- VK Video (`vk.com/video{oid}_{id}`, `vkvideo.ru/video{oid}_{id}`)
- Rutube (`rutube.ru/video/{32 hex}`)
- YouTube, SoundCloud, Bandcamp (через EmbedService)
- jump-to-time через StartTimeSeconds

---

## БЕЗОПАСНОСТЬ

- **JWT в httpOnly cookie**: JS не видит токен, защита от XSS
- **SameSite=Strict**: защита от CSRF
- **BCrypt**: хеширование паролей
- **Rate Limiting**: 10 запросов в минуту на IP на AuthController
- **CORS**: только `http://localhost:8000` + AllowCredentials
- **Регистрация**: пароль 8+ символов + хотя бы 1 цифра
- **Account blocking**: User.IsActive проверяется при login
- **Secure=false** на dev (localhost)

---

## ЧТО БЫЛО СДЕЛАНО ЗА ПОСЛЕДНИЕ ИЗМЕНЕНИЯ (25-31 мая)

### Удалено
- Slug-поля, SlugHelper, by-slug эндпоинты, slug-мидлварь, wwwroot
- ResourceUrl из Track (модель, DTO, контроллеры, фронтенд)
- Description из Album (модель, DTO, контроллеры, SQL)
- Description из Sample (модель, DTO, контроллеры, SQL)
- Platform, PlatformId, StartTime, EndTime из Sample
- Все CRUD модалки из HTML и JS
- Фиолетовые оттенки (#7c3aed)
- Стили модалок из style.css

### Добавлено
- **VK Video и Rutube embed**: EmbedService + UrlValidatorService + render.js embed функции
- **Reverse samples (SampledBy)**: Track.SampledBy navigation, TrackDetailDto.SampledBy, секция "Использован в" на track.html
- **SubmitController + UploadController**: POST /api/submit + POST /api/upload
- **SearchController**: GET /api/search/artists?q=, GET /api/search/tracks?q=&artistId=
- **AlbumsController**: GET /api/albums/{id}
- **Navbar grid layout**: 3 колонки (logo/search/auth), border-radius, тени, hover-анимации
- **Inline-поиск** в navbar на всех страницах
- **TrackCount** в ArtistDto
- **submit.html + submit.js**: форма с автокомплитом, загрузкой файлов
- **SQL миграция**: `migration_remove_description_add_reverse_samples.sql`

### Изменено
- Аутентификация: JWT в httpOnly cookie (был Bearer header)
- CORS origin: `localhost:8000` (был `localhost:3000`)
- Swagger: на `/` (был `/swagger`)
- Архитектура: SPA → MPA (Python serve.py :8000 + ASP.NET :5000)
- Password regex: упрощён до `^(?=.*\d).{8,}$`
- Navbar: #292827, #cc0000 акцент (был тёмный #0f0f0f + #ff5500)
- Все ссылки: `?id=` (были slug-адреса)
- Frontend: отдельные HTML-страницы вместо одной index.html с секциями
- ArtistsController: исправлен маппинг альбомов (удалён Description)
- SearchService: исправлены ссылки на Album.Description и Sample.Description

---

## ФАЙЛЫ ДЛЯ БЫСТРОГО СТАРТА

**Backend:**
- `backend/Program.cs` — конфигурация (CORS, JWT, rate limiting, Swagger, DI)
- `backend/Data/AppDbContext.cs` — EF Core контекст
- `backend/Models/` — модели: Artist, Album, Track, Sample, User, Revision, Artwork
- `backend/DTOs/` — DTO: ArtistDtos, AlbumDtos, TrackDtos, SampleDtos, AuthDtos, SearchDtos
- `backend/Controllers/` — Auth, Artists, Tracks, Samples, Albums, Search, Submit, Upload, Revisions
- `backend/Services/` — AuthService, SearchService, EmbedService, UrlValidatorService
- `backend/sql/` — create_tables.sql, seed_sample_data.sql, migration_remove_description_add_reverse_samples.sql

**Frontend:**
- `frontend/*.html` — 9 HTML-страниц (index, artist, album, track, sample, search, auth, register, submit)
- `frontend/modules/` — api.js, auth.js, render.js, utils.js, submit.js
- `frontend/style.css` — стили (whosampled.com дизайн)
- `frontend/serve.py` — статический сервер

---
