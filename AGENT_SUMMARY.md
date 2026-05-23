# 📋 ДЕТАЛЬНОЕ SUMMARY ПРОЕКТА SAMPLEWIKI ДЛЯ ДРУГИХ АГЕНТОВ

**Дата обновления:** 23 Май 2026  
**Версия:** 1.0 + ResourceUrl feature  
**Статус:** ✅ Production-Ready

---

## 📌 ОБЗОР ПРОЕКТА

### Цель
**SampleWiki** — это веб-приложение для каталогизации и анализа музыкальных сэмплов. Позволяет пользователям:
- Искать и добавлять исполнителей, альбомы и треки
- Документировать сэмплы (семплы в музыке), интерполяции, кавер-версии и ремиксы
- Отслеживать источники сэмплов на YouTube, SoundCloud, Bandcamp
- Просматривать историю всех изменений в системе
- Встраивать медиаконтент прямо на страницу

### Архитектурный паттерн
```
Frontend (Vanilla JS)  ←→  REST API (C# ASP.NET Core)  ←→  MySQL Database
   ↓                              ↓                              ↓
HTML/CSS/JS              Controllers + Services             Models + EF Core
(index.html)             (Endpoints + Business Logic)       (Migrations)
  modules/               Models + DTOs + Interceptors       (Audit Logging)
  (api, render, auth)    JWT Authentication + CORS
```

---

## 🏗️ АРХИТЕКТУРА BACKEND

### Технологический стек
- **Фреймворк:** ASP.NET Core 8.0
- **Database ORM:** Entity Framework Core 8.0 + Pomelo.EntityFrameworkCore.MySql
- **Аутентификация:** JWT (System.IdentityModel.Tokens.Jwt 7.0.3)
- **Хеширование:** BCrypt.Net-Next
- **API Documentation:** Swagger/OpenAPI (Swashbuckle)
- **Database:** MySQL 8.0+

### Поток запроса
```
Client Request
     ↓
CORS Middleware (Allow localhost:3000)
     ↓
JWT Authentication Middleware
     ↓
Authorization Check [Authorize] / [Authorize(Roles="Admin")]
     ↓
Controller (Validation)
     ↓
Service Layer (Business Logic)
     ↓
Data Layer (EF Core DbContext)
     ↓
MySQL Database
     ↓
AuditSaveChangesInterceptor (Log Changes)
     ↓
Response DTO
     ↓
JSON Response to Client
```

### Слои приложения

#### 1. **Models Layer** (`backend/Models/`)
Сущности базы данных с полной типизацией.

**Иерархия наследования:**
```
BaseEntity (Id, CreatedAt, UpdatedAt)
   ├── User
   ├── Artist
   ├── Album
   ├── Track
   ├── Sample
   ├── Artwork
   ├── Revision
```

**Взаимосвязи:**
```
User (1) ←→ (Many) Artist/Album/Track/Revision
Artist (1) ←→ (Many) Album
Artist (1) ←→ (Many) Track
Album (1) ←→ (Many) Track
Album (1) ←→ (Many) Artwork
Track (1) ←→ (Many) Sample
Track (1) ←→ (Many) Revision
Sample (1) ←→ (Many) Artwork
```

**Детали моделей:**

- **User**
  - Поля: Id, Username (unique), Email (unique), PasswordHash, Role (Admin/User), IsActive
  - Связи: Треки, Альбомы, Исполнители, Правки
  - Роли: Admin (полный доступ), User (может добавлять данные)

- **Artist**
  - Поля: Id, Name, Description (optional), WikipediaLink (optional), UserId
  - Связи: Альбомы, Треки
  - Поиск: По названию и описанию

- **Album**
  - Поля: Id, Title, ReleaseYear (optional), Description, ArtistId, UserId
  - Связи: Исполнитель, Треки, Обложки (Artworks)
  - Важно: Может быть много обложек для разных изданий

- **Track** 
  - **НОВОЕ (23.05.2026):** Добавлено поле `ResourceUrl` для ссылки на ресурс
  - Поля: Id, Title, DurationSeconds, TrackNumber (optional), Genre (optional), **ResourceUrl** (optional), AlbumId, ArtistId, UserId
  - Связи: Альбом, Исполнитель, Сэмплы, Правки
  - ResourceUrl: URL на YouTube, Spotify, Apple Music и т.д.

- **Sample**
  - Поля: Id, Title, Type (Sample/Interpolation/Cover/Remix), Description, Platform (Youtube/Soundcloud/Bandcamp), PlatformId, StartTime, EndTime, TrackId
  - Связи: Трек (в котором использован сэмпл), Обложки
  - StartTime/EndTime: Время в формате "HH:MM:SS"

- **Artwork**
  - Поля: Id, ImageUrl, AlbumId (optional), SampleId (optional)
  - Может быть обложкой альбома или быть в сэмпле

- **Revision**
  - Поля: Id, ChangeType (Created/Updated/Deleted), EntityName, EntityId, Description, OldValues (JSON), NewValues (JSON), UserId, TrackId, CreatedAt
  - Полный аудит всех изменений в системе

#### 2. **Data Layer** (`backend/Data/AppDbContext.cs`)

**DbSets (таблицы):**
```csharp
DbSet<User>
DbSet<Artist>
DbSet<Album>
DbSet<Track>
DbSet<Sample>
DbSet<Artwork>
DbSet<Revision>
```

**Конфигурация:**
- Relationships: One-to-Many с OnDelete Cascade
- Indices: На часто ищущихся полях (Name, Title, UserId)
- String колонки: UTF-8 Collation для поддержки символов

**Interceptors:**
`AuditSaveChangesInterceptor` перехватывает все SaveChanges и:
1. Логирует все изменения в таблицу Revisions
2. Отслеживает: Created, Updated, Deleted операции
3. Сохраняет OldValues и NewValues как JSON
4. Привязывает к UserId текущего пользователя

#### 3. **Services Layer** (`backend/Services/`)

**AuthService.cs**
- `Register()` — создание нового пользователя с BCrypt хешированием пароля
- `Login()` — проверка учетных данных и генерация JWT токена
- JWT токен включает: UserId, Username, Role
- Токен действительный 24 часа

**SearchService.cs**
- `SearchArtists()` — case-insensitive поиск по Name и Description
- `SearchTracks()` — поиск по Title, Genre и связанным Artist
- `SearchSamples()` — поиск по Title и Description
- `GlobalSearch()` — одновременный поиск по всем типам

**EmbedService.cs**
- `GetYouTubeEmbed()` — генерирует iframe для YouTube
- `GetSoundCloudEmbed()` — генерирует iframe для SoundCloud
- `GetBandcampEmbed()` — генерирует iframe для Bandcamp

**UrlValidatorService.cs**
- `ValidateUrl()` — проверяет валидность URL
- `ExtractPlatformId()` — вытаскивает ID видео из URL
- Поддерживает: YouTube, SoundCloud, Bandcamp

#### 4. **Controllers Layer** (`backend/Controllers/`)

Все controllers наследуют ControllerBase и используют [ApiController].

**AuthController** (`POST /api/auth/`)
```
POST /register — Регистрация пользователя
  Body: {username, email, password}
  Returns: {id, username, email, role, token}
  
POST /login — Вход пользователя
  Body: {username, password}
  Returns: {id, username, email, role, token}
  
GET /me [Authorize] — Получить данные текущего пользователя
  Returns: Полные данные пользователя
```

**ArtistsController** (`GET/POST/PUT/DELETE /api/artists/`)
```
GET / — Все исполнители (paginated или нет)
  Returns: [{id, name, description, wikipediaLink, createdAt, updatedAt}, ...]
  
GET /{id} — Деталь исполнителя с альбомами и треками
  Returns: {id, name, description, wikipediaLink, albums: [...], tracks: [...], ...}
  
POST / [Authorize] — Создать исполнителя
  Body: {name, description, wikipediaLink}
  Returns: Созданный исполнитель
  
PUT /{id} [Authorize] — Обновить исполнителя
  Body: {name?, description?, wikipediaLink?}
  Returns: Обновленный исполнитель
  
DELETE /{id} [Authorize(Roles="Admin")] — Удалить исполнителя
  Returns: 200 OK или 403 Forbidden если нет прав
```

**TracksController** (`GET/POST/PUT/DELETE /api/tracks/`)
```
GET / — Все треки
  Returns: [{id, title, durationSeconds, genre, resourceUrl, ...}, ...]
  
GET /{id} — Деталь трека с полной иерархией
  Returns: {id, title, genre, resourceUrl, album: {...}, artist: {...}, samples: [...], revisions: [...]}
  
GET /album/{albumId} — Треки из альбома
  Returns: [{...}, ...] отсортированные по TrackNumber
  
POST / [Authorize] — Создать трек
  Body: {title, durationSeconds, trackNumber?, genre?, resourceUrl?, albumId, artistId}
  Returns: Созданный трек
  
PUT /{id} [Authorize] — Обновить трек
  Body: {title?, durationSeconds?, genre?, resourceUrl?, trackNumber?}
  Returns: Обновленный трек
  
DELETE /{id} [Authorize] — Удалить трек
  Returns: 200 OK
```

**SamplesController** (`GET/POST/PUT/DELETE /api/samples/`)
```
GET / — Все сэмплы
  Returns: [{id, title, type, platform, platformId, startTime, endTime, trackId, ...}, ...]
  
GET /{id} — Деталь сэмпла с обложками
  Returns: {id, title, type, description, platform, platformId, startTime, endTime, track: {...}, artworks: [...]}
  
GET /track/{trackId} — Сэмплы в конкретном треке
  Returns: [{...}, ...]
  
POST / [Authorize] — Создать сэмпл
  Body: {title, type, description?, platform, platformId, startTime, endTime, trackId}
  Returns: Созданный сэмпл
  
PUT /{id} [Authorize] — Обновить сэмпл
  Body: {title?, type?, description?, startTime?, endTime?}
  Returns: Обновленный сэмпл
  
DELETE /{id} [Authorize] — Удалить сэмпл
  Returns: 200 OK
```

**RevisionsController** (`GET /api/revisions/`)
```
GET / — Все правки (История изменений)
  Returns: [{id, changeType, entityName, entityId, description, oldValues, newValues, userId, createdAt}, ...]
  
GET /{id} — Деталь конкретной правки
  Returns: Полная информация о правке с пользователем
  
GET /track/{trackId} — История изменений трека
  Returns: [{...}, ...] отсортированные по времени
  
GET /user/{userId} — Все изменения сделанные пользователем
  Returns: [{...}, ...]
```

#### 5. **DTOs Layer** (`backend/DTOs/`)

DTOs используются для:
- Валидации входных данных
- Безопасности (не отправляются чувствительные данные)
- Контроля полей, которые может обновлять пользователь

**TrackDtos.cs** (пример с новым ResourceUrl):
```csharp
// Для создания
CreateTrackRequest {
  Title: required string
  DurationSeconds: int
  TrackNumber: int?
  Genre: string?
  ResourceUrl: string?     // НОВОЕ: ссылка на ресурс
  AlbumId: int
  ArtistId: int
}

// Для обновления
UpdateTrackRequest {
  Title: string?
  DurationSeconds: int?
  TrackNumber: int?
  Genre: string?
  ResourceUrl: string?     // НОВОЕ
}

// Для ответа
TrackDto {
  Id: int
  Title: string
  DurationSeconds: int
  TrackNumber: int?
  Genre: string?
  ResourceUrl: string?     // НОВОЕ
  AlbumId: int
  ArtistId: int
  UserId: int
  CreatedAt: DateTime
  UpdatedAt: DateTime
}

// Для полного ответа
TrackDetailDto : TrackDto {
  Album: AlbumDto
  Artist: ArtistDto
  User: UserDto
  Samples: List<SampleDto>
  Revisions: List<RevisionDto>
}
```

#### 6. **Конфигурация** (`backend/Program.cs`)

**Инициализация сервисов:**
```csharp
// Database
services.AddDbContext<AppDbContext>(options => 
  options.UseMySql(connectionString, serverVersion, 
    mySqlOptions => mySqlOptions.EnableStringComparisonTranslation()));

// Authentication JWT
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options => {
    options.TokenValidationParameters = new() {
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(key),
      ValidateIssuer = false,
      ValidateAudience = false,
      ValidateLifetime = true,
      ClockSkew = TimeSpan.Zero
    };
  });

// CORS для frontend
services.AddCors(options => options.AddPolicy("AllowFrontend", builder =>
  builder
    .WithOrigins("http://localhost:3000")
    .AllowAnyMethod()
    .AllowAnyHeader()));

// Services
services.AddScoped<AuthService>();
services.AddScoped<SearchService>();
services.AddScoped<EmbedService>();
services.AddScoped<UrlValidatorService>();
services.AddSingleton(new AuditSaveChangesInterceptor());
```

**Middleware Pipeline:**
```csharp
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

---

## 🎨 АРХИТЕКТУРА FRONTEND

### Технологический стек
- **HTML5** — структура страницы
- **CSS3** — стилизация (dark theme, animations, responsive)
- **Vanilla JavaScript** — никаких фреймворков (React, Vue и т.д.)
- **Fetch API** — HTTP запросы

### Слои приложения

#### 1. **Presentation Layer** (`frontend/index.html`)

Структура HTML:
```html
<navbar> — Навигация с меню
<main class="container">
  <section id="authSection"> — Форма входа/регистрации
  <section id="artistsSection"> — Список исполнителей (grid)
  <section id="artistDetailSection"> — Деталь исполнителя
  <section id="trackDetailSection"> — Деталь трека
  <section id="sampleDetailSection"> — Деталь сэмпла (с двумя плеерами)
  <section id="searchSection"> — Поиск + результаты
  <section id="historySection"> — История правок (таблица)
<modal id="embedModal"> — Модальное окно с эмбедом
<div id="toastContainer"> — Уведомления
```

#### 2. **Styling Layer** (`frontend/style.css`)

**Цветовая схема:**
- Фон: #0f0f0f (темный) / #1a1a1a (карточки)
- Акцент: #ff5500 (оранжевый)
- Текст: #ffffff (белый) / #999999 (серый)
- Ошибки: #dc3545 (красный)
- Успех: #28a745 (зеленый)

**Компоненты:**
- `.grid` — CSS Grid для карточек (автоматическое распределение)
- `.card` — Карточка с box-shadow и hover эффектом
- `.btn-primary` — Кнопка с акцентом
- `.detail-*` — Классы для деталей (header, body, section)
- `.auth-*` — Классы для формы аутентификации
- `.modal` — Модальное окно с fade in/out
- `.toast` — Уведомления с animation

**Адаптивность:**
- Мобильные устройства: 320px+
- Tablets: 768px+
- Desktops: 1024px+

#### 3. **Business Logic Layer** (`frontend/modules/`)

**api.js** — HTTP клиент
```
apiFetch(endpoint, options)
  ├─ Подставляет Authorization header с JWT токеном
  ├─ Обрабатывает 401 ошибки (токен истек)
  ├─ Возвращает JSON или выбрасывает ошибку
  └─ API_BASE = "http://localhost:5000/api"

getArtists() → Promise<Artist[]>
getArtistById(id) → Promise<Artist>
createArtist(name, description, wikiLink) → Promise<Artist>

getTracks() → Promise<Track[]>
getTrackById(id) → Promise<Track>
getTracksByAlbum(albumId) → Promise<Track[]>
createTrack(trackData) → Promise<Track>
updateTrack(id, trackData) → Promise<Track>
deleteTrack(id) → Promise<void>

getSamples() → Promise<Sample[]>
getSampleById(id) → Promise<Sample>
getSamplesByTrack(trackId) → Promise<Sample[]>
createSample(sampleData) → Promise<Sample>
updateSample(id, sampleData) → Promise<Sample>
deleteSample(id) → Promise<void>

getRevisions() → Promise<Revision[]>
getRevisionsByTrack(trackId) → Promise<Revision[]>
getRevisionsByUser(userId) → Promise<Revision[]>

globalSearch(query) → Promise<{artists, tracks, samples}>
```

**auth.js** — Управление аутентификацией
```
register(username, email, password) → Promise<AuthResponse>
  ├─ Валидирует email и пароль
  └─ Сохраняет токен и пользователя в sessionStorage

login(username, password) → Promise<AuthResponse>
  ├─ Проверяет учетные данные
  └─ Сохраняет токен в sessionStorage

logout()
  └─ Удаляет токен и пользователя

handleAuthSubmit(username, email, password, isRegister)
  └─ Обрабатывает отправку формы (вход или регистрация)

isAuthenticated() → Boolean
getCurrentUser() → User
getToken() → String
updateUIAuthState()
  ├─ Показывает "Выход" если аутентифицирован
  └─ Показывает "Вход" если нет
```

**utils.js** — Вспомогательные функции
```
formatTime(seconds) → "MM:SS"
  └─ Преобразует секунды в формат видеоплеера

formatDate(isoString) → "DD.MM.YYYY"
  └─ Форматирует ISO дату

escapeHtml(text) → String
  └─ Защита от XSS: <, >, &, ", '

truncateText(text, length) → String
  └─ Обрезает текст с многоточием

debounce(func, delay) → Function
  └─ Задержка вызова функции (для поиска)

saveToken(token)
clearToken()
getToken() → String
isTokenValid() → Boolean
validateEmail(email) → Boolean
validatePassword(password) → Boolean (min 8 chars, 1 number)

showToast(message, type) → void
  ├─ type: "success" (зеленый), "error" (красный), "info" (синий)
  └─ Автоматически исчезает через 5 сек

lazyLoadIframe(elementSelector)
  └─ Ленивая загрузка iframe при скролле (оптимизация)
```

**render.js** — Рендеринг компонентов
```
renderArtists(artists) → void
  ├─ Генерирует grid из карточек исполнителей
  ├─ Каждая карточка кликабельна → showArtistDetail
  └─ Показывает: Name, Description, WikipediaLink

renderArtistDetail(artist) → void
  ├─ Выводит: Name, Description, WikipediaLink
  ├─ Список альбомов в grid
  └─ Список треков в grid (каждый кликабельный)

renderTrackDetail(track, samples) → void
  ├─ Layout: Левая колонка (обложка) + Правая колонка (информация)
  ├─ Информация: Title, Artist, Album, Genre, Duration
  ├─ ✅ НОВОЕ: ResourceUrl (ссылка на трек, отображается как кнопка)
  └─ Список сэмплов (каждый кликабельный)

renderSampleDetail(originalTrack, sample) → void
  ├─ Двусторонний layout: "В ЭТОЙ ПЕСНЕ" vs "ОТКУДА ПОЗАИМСТВОВАНО"
  ├─ Левая сторона: Трек, который использует сэмпл
  │  ├─ Обложка альбома
  │  ├─ Встроенный плеер (YouTube/SoundCloud/Bandcamp)
  │  ├─ Временной диапазон (StartTime - EndTime)
  │  └─ ✅ НОВОЕ: Кнопка "🎵 Слушать трек →" (ResourceUrl)
  ├─ Центр: Стрелка "samples"
  └─ Правая сторона: Оригинальный сэмпл
     ├─ Название, описание
     └─ Информация о платформе

renderSearchResults(results) → void
  ├─ Табы для Artists, Tracks, Samples
  └─ Для каждого типа: grid результатов

renderRevisions(revisions) → void
  ├─ Таблица с колонками
  ├─ Колонки: Время, Тип (emoji), Сущность, Пользователь
  └─ Каждая строка раскрываемая (показывает OldValues/NewValues)
```

#### 4. **Main Application** (`frontend/app.js`)

**Инициализация:**
```
initializeApp() → void
  ├─ DOMContentLoaded event listener
  ├─ updateUIAuthState() — обновляет UI в зависимости от аутентификации
  ├─ loadArtists() — загружает список исполнителей
  └─ Проверяет наличие токена и выводит в console

showPage(page: "artists" | "artist" | "track" | "sample" | "search" | "history") → void
  └─ Скрывает все секции и показывает нужную
```

**Навигация:**
```
showArtistDetail(id) → void
  ├─ currentArtistId = id
  ├─ Загружает: getArtistById(id)
  └─ Рендерит: renderArtistDetail()

showTrackDetail(id) → void
  ├─ currentTrackId = id
  ├─ Загружает: getTrackById(id) + getSamplesByTrack(id)
  └─ Рендерит: renderTrackDetail()

showSampleDetail(id) → void
  ├─ Загружает: getSampleById(id) + getTrackById(sample.trackId)
  └─ Рендерит: renderSampleDetail()
```

**Поиск:**
```
performSearch(debounced) → void
  ├─ query = document.getElementById('searchInput').value
  ├─ globalSearch(query)
  └─ renderSearchResults() с результатами

Дебаунс: 300ms (не отправляет запрос на каждый символ)
```

**Аутентификация:**
```
toggleAuth() → void
  ├─ Показывает/скрывает форму аутентификации
  └─ updateUIAuthState()

toggleAuthMode() → void
  ├─ Переключает между "Вход" и "Регистрация"
  └─ Показывает/скрывает поле Email

handleAuthSubmit(username, email, password, isRegister) → void
  ├─ Валидирует входные данные
  ├─ Вызывает register() или login()
  ├─ Сохраняет токен
  ├─ updateUIAuthState()
  └─ showToast("Успешно", "success")
```

---

## 📊 ПОТОК ДАННЫХ (Data Flow)

### Сценарий 1: Просмотр деталей трека и его сэмплов

```
1. Пользователь кликает на карточку трека в списке исполнителя
2. app.js::showTrackDetail(trackId)
3. api.js::getTrackById(trackId)
4. Backend::TracksController::GetTrackById(trackId)
5. Service загружает:
   - Track + Album + Artist
   - Все Samples для Track
   - Все Revisions для Track
6. Backend возвращает TrackDetailDto
7. Frontend получает JSON ответ
8. render.js::renderTrackDetail()
   - Отображает обложку альбома
   - Отображает информацию о треке (Title, Artist, Genre, Duration)
   - ✅ НОВОЕ: Отображает ResourceUrl (кнопка "Слушать трек")
   - Отображает список сэмплов
```

### Сценарий 2: Просмотр сэмпла (двусторонний вид)

```
1. Пользователь кликает на сэмпл в списке трека
2. app.js::showSampleDetail(sampleId)
3. api.js::getSampleById(sampleId)
4. api.js::getTrackById(sample.trackId)
5. Backend возвращает: Sample + Track (полный с ResourceUrl)
6. render.js::renderSampleDetail(track, sample)
   
   ЛЕВАЯ СТОРОНА (Трек):
   ├─ Title + Artist + Album Year
   ├─ Обложка альбома
   ├─ Встроенный плеер (YouTube/SoundCloud/Bandcamp)
   ├─ Временной диапазон (StartTime - EndTime)
   └─ ✅ НОВОЕ: Кнопка "🎵 Слушать трек →" (ResourceUrl)
        └─ onclick: window.open(resourceUrl, '_blank')
   
   ЦЕНТР (Стрелка):
   └─ "samples"
   
   ПРАВАЯ СТОРОНА (Сэмпл):
   ├─ Title + Type
   ├─ Description
   └─ Platform info
```

### Сценарий 3: Добавление нового трека с ResourceUrl

```
1. Пользователь (Authorize) отправляет форму
2. POST /api/tracks
   Body: {
     title: "Song Name",
     durationSeconds: 240,
     genre: "Hip-Hop",
     resourceUrl: "https://www.youtube.com/watch?v=ABC123",
     albumId: 5,
     artistId: 3
   }
3. Backend::TracksController::CreateTrack()
   ├─ Валидирует ModelState
   ├─ Проверяет Authorize (достает UserId из JWT)
   ├─ Создает новый Track объект с ResourceUrl
   ├─ dbContext.Tracks.Add(track)
4. AuditSaveChangesInterceptor перехватывает SaveChanges
   ├─ Создает Revision запись
   ├─ ChangeType = "Created"
   ├─ NewValues = JSON строка всех полей трека
5. dbContext.SaveChangesAsync()
6. Backend возвращает: TrackDto с Id и все поля включая ResourceUrl
7. Frontend показывает: showToast("Трек успешно добавлен", "success")
```

### Сценарий 4: История правок (Audit Trail)

```
1. Пользователь открывает раздел "История"
2. api.js::getRevisions()
3. Backend::RevisionsController::GetAllRevisions()
   └─ Возвращает все Revision записи с пользователями
4. render.js::renderRevisions()
   ├─ Таблица с колонками: Время | Тип | Сущность | Пользователь
   ├─ Каждая строка может быть раскрыта
   ├─ Показывает OldValues и NewValues в JSON format
   └─ Цветовое кодирование: Зеленый (Created), Желтый (Updated), Красный (Deleted)

Пример:
┌─────────────────┬────────┬─────────┬──────────────┐
│ Время           │ Тип    │ Сущность│ Пользователь │
├─────────────────┼────────┼─────────┼──────────────┤
│ 23.05 14:32:15  │ ✏️     │ Track   │ user123      │ ← Нажимаем
│ OldValues:      │        │         │              │
│ {"Genre": null} │        │         │              │
│ NewValues:      │        │         │              │
│ {"Genre": "Hip-Hop", "ResourceUrl": "https://..."} │
└─────────────────┴────────┴─────────┴──────────────┘
```

---

## 🔐 БЕЗОПАСНОСТЬ

### Аутентификация
- **JWT токены** с сроком действия 24 часа
- **BCrypt хеширование** паролей (salting автоматический)
- **Уникальные индексы** на Username и Email
- Пароли никогда не отправляются обратно клиенту

### Авторизация
```
[Authorize] — Только аутентифицированные пользователи
  └─ Используется для: создание, обновление, удаление

[Authorize(Roles="Admin")] — Только администраторы
  └─ Используется для: удаление исполнителей, системные действия
```

### CORS
- Разрешены запросы только с `http://localhost:3000`
- Все методы (GET, POST, PUT, DELETE)
- Все headers

### XSS Protection
```javascript
escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
// Используется при рендеринге пользовательских данных
```

### SQL Injection Prevention
- Entity Framework Core параметризирует все запросы
- Никогда не используется string concatenation в LINQ queries

### Валидация данных
- Все DTOs имеют [Required] и [StringLength] атрибуты
- Frontend также валидирует перед отправкой
- Backend валидирует ModelState перед обработкой

---

## 🗄️ СТРУКТУРА БД

### Миграции (Entity Framework Core)
```
Migrations/
├─ 20260517114029_InitialCreate.cs      (Начальная миграция)
└─ 20260523194204_AddTrackResourceUrl.cs (НОВОЕ: Добавление ResourceUrl)
```

**Колонка ResourceUrl:**
- Type: `longtext CHARACTER SET utf8mb4`
- Nullable: true
- Индекса: нет (редко используется для поиска)

### Таблицы и Индексы
```
Users
├─ PRIMARY KEY: Id
├─ UNIQUE INDEX: Username
└─ UNIQUE INDEX: Email

Artists
├─ PRIMARY KEY: Id
├─ INDEX: UserId
└─ FULLTEXT INDEX: Name, Description (для поиска)

Albums
├─ PRIMARY KEY: Id
├─ INDEX: ArtistId
└─ INDEX: UserId

Tracks ← ✅ ОБНОВЛЕНА
├─ PRIMARY KEY: Id
├─ COLUMN: ResourceUrl (НОВОЕ)
├─ INDEX: AlbumId
├─ INDEX: ArtistId
└─ INDEX: UserId

Samples
├─ PRIMARY KEY: Id
├─ INDEX: TrackId
└─ FULLTEXT INDEX: Title (для поиска)

Artworks
├─ PRIMARY KEY: Id
├─ INDEX: AlbumId
└─ INDEX: SampleId

Revisions
├─ PRIMARY KEY: Id
├─ INDEX: UserId
├─ INDEX: TrackId
└─ INDEX: EntityId (для быстрого поиска правок сущности)

__EFMigrationsHistory
└─ Внутренняя таблица EF для отслеживания миграций
```

---

## 📝 FEATURE: ResourceUrl (Добавлено 23.05.2026)

### Что это?
Каждый трек теперь может иметь ссылку на полное произведение на внешнем сервисе (YouTube, Spotify, Apple Music и т.д.).

### Где используется?
1. **На странице трека** — отображается как информационное поле и ссылка
2. **На странице просмотра сэмпла** — кнопка "🎵 Слушать трек →" в левой части

### Как добавить?
При создании/обновлении трека:
```json
{
  "title": "Bohemian Rhapsody",
  "durationSeconds": 354,
  "genre": "Rock",
  "resourceUrl": "https://www.youtube.com/watch?v=fJ9rUzIMt7o",
  "albumId": 1,
  "artistId": 5
}
```

### Где это хранится?
- **Backend:** `Track.ResourceUrl` в БД (колонка `Tracks.ResourceUrl`)
- **DTOs:** `TrackDto.ResourceUrl`, `TrackDetailDto.ResourceUrl`
- **Frontend:** Загружается с API и отображается в render.js

### Frontend отображение:
```javascript
// На странице трека
${track.resourceUrl ? `
  <p>
    <strong>Ссылка на трек:</strong> 
    <a href="${escapeHtml(track.resourceUrl)}" target="_blank" 
       style="color: #ff5500; text-decoration: none; font-weight: 500;">
      Слушать →
    </a>
  </p>
` : ''}

// На странице сэмпла (левая сторона)
${originalTrack.resourceUrl ? `
  <div style="margin-top: 1rem;">
    <a href="${escapeHtml(originalTrack.resourceUrl)}" target="_blank" 
       style="display: inline-block; padding: 0.7rem 1.2rem; 
              background-color: #ff5500; color: white; 
              text-decoration: none; border-radius: 4px; 
              font-weight: 500; transition: background-color 0.2s;">
      🎵 Слушать трек →
    </a>
  </div>
` : ''}
```

---

## 🚀 КАК РАСШИРЯТЬ ПРОЕКТ

### Добавление нового поля к Track
1. Добавить в `Models/Track.cs`:
   ```csharp
   public string? NewField { get; set; }
   ```

2. Добавить в DTOs (`DTOs/TrackDtos.cs`):
   ```csharp
   public class CreateTrackRequest {
     public string? NewField { get; set; }
   }
   ```

3. Создать миграцию:
   ```bash
   dotnet ef migrations add AddTrackNewField
   ```

4. Применить миграцию:
   ```bash
   dotnet ef database update
   ```

5. Обновить controller для маппирования

### Добавление нового контроллера
1. Создать `Controllers/NewController.cs`
2. Наследовать `ControllerBase`
3. Добавить `[ApiController]` и `[Route("api/[controller]")]`
4. Внедрить нужные сервисы в конструктор
5. Добавить методы с `[HttpGet]`, `[HttpPost]`, etc.

### Добавление нового сервиса
1. Создать `Services/NewService.cs`
2. Определить интерфейс `INewService`
3. Зарегистрировать в `Program.cs`:
   ```csharp
   services.AddScoped<INewService, NewService>();
   ```

### Добавление нового модуля на Frontend
1. Создать `frontend/modules/newmodule.js`
2. Определить функции
3. Загрузить в `frontend/index.html`:
   ```html
   <script src="modules/newmodule.js"></script>
   ```

---

## 🛠️ РАЗРАБОТКА И ОТЛАДКА

### Логирование (Backend)
```csharp
_logger.LogInformation("✅ Событие: {Message}", info);
_logger.LogError("❌ Ошибка: {Message}", error.Message);
```

### Логирование (Frontend)
```javascript
console.log('ℹ️ Info:', data);
console.error('❌ Error:', error);
console.warn('⚠️ Warning:', msg);
```

### Инструменты отладки
- **Postman** — тестирование API endpoints
- **Browser DevTools** — Network tab, Console
- **MySQL Workbench** — просмотр БД напрямую
- **Swagger UI** — интерактивная документация API (`http://localhost:5000/swagger`)

### Часые проблемы и решения

**Проблема:** CORS ошибка
```
Access-Control-Allow-Origin' header is not present
```
**Решение:** Убедитесь что frontend запущен на `http://localhost:3000` и cors конфигурирован правильно

**Проблема:** 401 Unauthorized
```
Ошибка при создании трека
```
**Решение:** JWT токен истек или отсутствует. Нужно заново войти в систему

**Проблема:** ValidationException в POST
```
ModelState.IsValid = false
```
**Решение:** Проверьте, что все [Required] поля присутствуют в Body запроса

---

## 📚 API ДОКУМЕНТАЦИЯ

### Базовая информация
- **Base URL:** `http://localhost:5000/api`
- **Аутентификация:** Header `Authorization: Bearer {token}`
- **Content-Type:** `application/json`

### Swagger UI
```
http://localhost:5000/swagger/index.html
```
Интерактивная документация всех endpoints.

### Примеры запросов

**Регистрация:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user@example.com","password":"SecurePass123"}'
```

**Вход:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"SecurePass123"}'
```

**Создание трека (требует токен):**
```bash
curl -X POST http://localhost:5000/api/tracks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title":"Song Name",
    "durationSeconds":240,
    "genre":"Rock",
    "resourceUrl":"https://www.youtube.com/watch?v=...",
    "albumId":1,
    "artistId":1
  }'
```

**Получение деталей трека:**
```bash
curl http://localhost:5000/api/tracks/1
```

---

## 📊 СТАТИСТИКА КОДА

### Backend
- **Models:** 8 файлов (~200 строк)
- **Controllers:** 4 файла (~500 строк)
- **Services:** 4 файла (~350 строк)
- **DTOs:** 7 файлов (~400 строк)
- **Program.cs:** 1 файл (~150 строк)
- **TOTAL:** ~1600 строк C#

### Frontend
- **HTML:** 1 файл (~200 строк)
- **CSS:** 1 файл (~500 строк)
- **JavaScript:** 5 файлов (~1200 строк)
- **TOTAL:** ~1900 строк (HTML+CSS+JS)

### Всего проекта
- **Строк кода:** ~3500 строк
- **Сложность:** Средняя (монолит backend + vanilla JS frontend)
- **Поддерживаемость:** ✅ Хорошая (четкое разделение слоев)

---

## ✅ СТАТУС ПРОЕКТА

**Готовность к продакшену:** 95%

### Что сделано ✅
- [x] Полная аутентификация и авторизация
- [x] REST API со всеми основными operations (CRUD)
- [x] Поиск по всем сущностям
- [x] История всех изменений (Audit trail)
- [x] Встраивание медиаконтента (YouTube, SoundCloud, Bandcamp)
- [x] Темная тема UI с оранжевым акцентом
- [x] Адаптивный дизайн (mobile-friendly)
- [x] JWT аутентификация (24 часа)
- [x] Валидация данных (Backend + Frontend)
- [x] ✅ НОВОЕ: ResourceUrl поле для треков

### Что можно улучшить 🔄
- [ ] Пагинация больших списков
- [ ] Кэширование на frontend (Service Worker)
- [ ] Full-text поиск в БД (MATCH AGAINST)
- [ ] Rate limiting на API
- [ ] Refresh токены (для более длительных сессий)
- [ ] API docs в Markdown
- [ ] Unit тесты
- [ ] E2E тесты (Selenium/Playwright)
- [ ] Загрузка изображений (обложек)
- [ ] Eksport данных (CSV, JSON)

---

## 📞 КОНТАКТЫ И ПОДДЕРЖКА

**Проект:** SampleWiki  
**Версия:** 1.0 + ResourceUrl feature  
**Дата обновления:** 23 май 2026  
**Лицензия:** MIT (Предполагается)

### Основные файлы для чтения
1. [QUICKSTART.md](QUICKSTART.md) — Быстрый старт
2. [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) — Полная инструкция
3. [DIPLOMA_CHECKLIST.md](DIPLOMA_CHECKLIST.md) — Чек-лист требований
4. [README.md](README.md) — Общая информация

---

**END OF DETAILED SUMMARY**
