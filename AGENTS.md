# SampleWiki — Архитектура и состояние проекта

## Что это за проект

**SampleWiki** — это каталог музыкальных сэмплов (Wikipedia для сэмплов). Пользователи могут:
- Просматривать исполнителей, альбомы, треки и сэмплы
- Искать по всем сущностям
- Редактировать информацию (через систему правок — Revisions)
- Регистрироваться и входить в систему
- Добавлять новых исполнителей, треки, сэмплы (авторизованные пользователи)

Суть: трек A содержит сэмпл из трека B. SampleWiki показывает, кто кого засемплировал.

---

## Стек технологий

| Компонент | Технология |
|---|---|
| **Backend API** | ASP.NET Core (.NET 8) на порту **5000** |
| **Frontend** | Статические HTML + Vanilla JS + CSS (MPA) |
| **Статический сервер** | Python `http.server` на порту **8000** |
| **База данных** | MySQL (через Entity Framework Core + Pomelo) |
| **Аутентификация** | JWT в httpOnly cookie (HMAC-SHA256, 24ч) |
| **Хеширование паролей** | BCrypt.Net |
| **Документация API** | Swagger (на корне `/`) |
| **Rate Limiting** | ASP.NET встроенный (FixedWindow, 10/min/IP) |
| **CORS** | Только `localhost:8000`, AllowCredentials |

---

## Архитектура (MPA + CORS)

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

Фронтенд и бэкенд — **два разных сервера** на разных портах. Фронтенд общается с API через `fetch` с `credentials: 'include'` (для отправки httpOnly cookie). CORS настроен так, чтобы разрешить этот кросс-доменный запрос.

**Почему не один сервер?** Исторически проект шёл к одному ASP.NET, но было принято решение вернуться к Python MPA + CORS (см. Key Decisions).

---

## Навигация (страницы)

Все ссылки используют `?id=` в query string (не slug-адреса):

| Файл | URL | Описание |
|---|---|---|
| `index.html` | `/` | Главная: список исполнителей |
| `artist.html` | `/artist.html?id=1` | Детально об исполнителе + его альбомы и треки |
| `album.html` | `/album.html?id=1` | Детально об альбоме + треки + обложки |
| `track.html` | `/track.html?id=1` | Детально о треке + сэмплы (откуда и куда) |
| `sample.html` | `/sample.html?id=1` | Детально о сэмпле |
| `search.html` | `/search.html?q=beatles` | Глобальный поиск |
| `auth.html` | `/auth.html` | Вход |
| `register.html` | `/register.html` | Регистрация |

---

## Модель данных

```
Artist ──1:N──→ Album ──1:N──→ Track ──1:N──→ Sample
                                   ↑              ↓
                                   └── SampledTrack ──┘
                                    (Sample.TrackId + Sample.SampledTrackId)
User ──1:N──→ Track
User ──1:N──→ Revision
Revision ──→ Track (история изменений трека)
Album ──1:N──→ Artwork (обложки)
```

- **Artist**: имя, описание, WikiLink
- **Album**: название, год выпуска, описание, ArtistId
- **Track**: название, длительность, номер в альбоме, жанр, ResourceUrl, AlbumId, ArtistId, UserId
- **Sample**: тип (Sample/Interpolation/Remake), описание, StartTimeSeconds, TrackId (sampler), SampledTrackId (source)
- **User**: имя, email, BCrypt-хеш пароля, роль (Guest/User/Admin), IsActive, LastLoginAt
- **Revision**: TrackId, UserId, изменения, временная метка

---

## API Endpoints

### Artists
- `GET /api/artists` — все исполнители
- `GET /api/artists/{id}` — исполнитель с альбомами и треками
- `POST /api/artists` — создать

### Tracks
- `GET /api/tracks` — все треки
- `GET /api/tracks/{id}` — трек с полной иерархией
- `GET /api/tracks/album/{albumId}` — треки альбома
- `POST /api/tracks` — создать
- `PUT /api/tracks/{id}` — обновить

### Samples
- `GET /api/samples` — все сэмплы
- `GET /api/samples/{id}` — сэмпл с деталями
- `GET /api/samples/track/{trackId}` — сэмплы трека
- `POST /api/samples` — создать
- `PUT /api/samples/{id}` — обновить

### Albums
- `GET /api/albums/{id}` — альбом с треками, исполнителем, обложками

### Auth
- `POST /api/auth/register` — регистрация (httpOnly cookie в ответе)
- `POST /api/auth/login` — вход (httpOnly cookie в ответе)
- `POST /api/auth/logout` — выход (очистка cookie)
- `GET /api/auth/me` — текущий пользователь (по cookie)

### Revisions
- `GET /api/revisions` — все правки
- `GET /api/revisions/track/{trackId}` — правки трека
- `GET /api/revisions/user/{userId}` — правки пользователя

### Search
- `GET /api/search?q=...` — глобальный поиск по трекам

---

## Frontend JS модули

| Файл | Роль |
|---|---|
| `api.js` | `fetch`-обёртка с `credentials: 'include'`, + функции для всех API эндпоинтов |
| `auth.js` | `register()`, `login()`, `logout()`, `checkAuth()`, `updateUIAuthState()` |
| `render.js` | Функции отрисовки: художники, альбомы, треки, сэмплы, поиск |
| `utils.js` | `getCurrentUser()`, `saveCurrentUser()`, `clearCurrentUser()`, `isAuthenticated()`, `showToast()`, `formatDuration()` |

Каждая HTML-страница подключает нужные модули и вызывает функции в `<script>` внизу body.

---

## Безопасность

(Подробно описана в секции Security Architecture ниже.)

---

## История изменений (что было сделано)

Проект прошёл несколько этапов архитектурных решений:

### Этап 1: Всё на ASP.NET
- ASP.NET сервер отдавал и API, и статику, и страницы через ASP.NET MVC
- Использовались slug-адреса (`/artist/the-beatles`)
- SlugHelper + Slug мидлварь + Slug поля в моделях
- CORS не нужен (всё на одном порту)

### Этап 2: Возврат к MPA + CORS
- **Откат к HEAD**: удалены все Slug-поля, SlugHelper, by-slug эндпоинты, slug-мидлварь, wwwroot
- Swagger вернулся на корень `/`
- CORS включён обратно: `AllowFrontend` (origin `http://localhost:8000`)
- Python `serve.py` отдаёт статику на порту 8000
- API на ASP.NET на порту 5000
- Все ссылки через `?id=` в query string

### Этап 3: Аутентификация
- JWT в httpOnly cookie (не localStorage)
- Классы: `AuthController`, `AuthService`, `AuthDtos`
- BCrypt для хеширования паролей
- Rate Limiting на AuthController: 10 запросов в минуту на IP
- Раздельные страницы: `auth.html` (вход), `register.html` (регистрация)
- Inline-валидация на фронте: email, пароль (8+ символов + цифра), подтверждение
- Навигация: в navbar добавлена ссылка «Регистрация»

### Этап 4: AlbumsController
- Создан `AlbumsController` с `GET /api/albums/{id}`
- Возвращает `AlbumDetailDto` с треками, исполнителем, обложками

### Этап 5: Упрощение требований к паролю
- Regex на бэкенде упрощён: с `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$` до `^(?=.*\d).{8,}$`
- Фронтенд обновлён: проверка длины < 8 **ИЛИ** отсутствия цифры

---

## Security Architecture

### JWT Authentication
- Токен HMAC-SHA256 с claims: NameIdentifier (userId), Name (username), Role
- Живёт 24 часа, ClockSkew = 0
- Хранится в httpOnly cookie: `HttpOnly + SameSite=Strict` (защита от XSS и CSRF)  
- На dev-режиме `Secure = false` (на локальном хосте)

### Password Hashing
- BCrypt.Net для хеширования (`BCrypt.HashPassword` / `BCrypt.Verify`)
- Пароль никогда не хранится в открытом виде

### Backend Validation (Data Annotations)
- `RegisterRequest.Password`: Regex `^(?=.*\d).{8,}$` (8+ символов, хотя бы 1 цифра)
- `Username`: 3-50 символов, только буквы/цифры/_
- `Email`: валидный формат через `[EmailAddress]`
- `ModelState.IsValid` проверяется перед вызовом сервиса

### Frontend Validation (UX only)
- `validatePasswordField()` при blur/input: проверка длины < 8 ИЛИ нет цифры
- `handleRegister()` / `register()` — повторная проверка перед отправкой
- Красная/зелёная рамка полей при валидации

### Rate Limiting
- FixedWindow: 10 запросов в минуту на IP
- Применён атрибутом `[EnableRateLimiting("AuthRateLimit")]` на `AuthController`

### CORS
- Policy `AllowFrontend`: только origin `http://localhost:8000`
- AllowCredentials (нужен для кросс-доменной httpOnly cookie)

### Account Blocking
- Поле `User.IsActive` — при login проверяется, деактивированные пользователи не впускаются

### Logging
- `ILogger`: регистрация, вход, ошибки — все логируются (Warn для ошибок, Error для исключений)

### Main Weakness
- `Secure = false` на cookie — для production нужно HTTPS

---

## Progress
### Done
- **Откат backend к HEAD**: удалены Slug-поля, SlugHelper, by-slug эндпоинты, slug-мидлварь, wwwroot. Swagger снова на корне `/`
- **CORS**: добавлен обратно `AllowFrontend`
- **AlbumsController**: `GET /api/albums/{id}` возвращает `AlbumDetailDto` с треками, исполнителем, обложками
- **HTML-страницы**: navbar получает ссылку «Регистрация» на всех страницах
- **auth.html**: только вход (без toggle)
- **register.html**: отдельная страница регистрации
- **Валидация регистрации (inline)**: email, password (8+digit), confirm
- **Пароль на бэкенде**: Regex `^(?=.*\d).{8,}$` (было `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$`)
- **auth.js**: `register()`, `login()`, `logout()`, `checkAuth()`, `updateUIAuthState()`, `toggleAuth()`
- **serve.py**: простой статический сервер Python

### In Progress
- (none)

### Blocked
- (none)

---

## Key Decisions

| Решение | Почему |
|---|---|
| **JWT в httpOnly cookie** | Защита от XSS (JS не видит токен) |
| **SameSite=Strict** | Защита от CSRF |
| **Раздельные auth.html / register.html** | Предыдущая реализация с toggle ломала область видимости JS-функций |
| **type="button" + onclick** вместо form submit | addEventListener('submit') работал нестабильно; button + onclick надёжнее |
| **Пароль: только 8+ символов + цифра** | Простое требование для пользователя; убрали uppercase/special |
| **Отказ от slug-роутинга** | MPA (Python + CORS) проще поддерживать, чем один ASP.NET с двумя ролями |
| **BCrypt** | Адаптивный хеш с солью, стандарт индустрии |
| **Ссылки через `?id=`** | Проще, чем slug; не нужно генерировать уникальные URL |

---

## Next Steps
1. `dotnet build` + `dotnet run` — запустить API на порту 5000
2. `python serve.py 8000` из frontend/ — запустить статический сервер
3. Открыть `http://localhost:8000/register.html` и протестировать:
   - некорректный email
   - пароль короче 8 символов
   - пароль без цифры
   - пароли не совпадают
   - успешная регистрация
4. Проверить вход через `auth.html`
5. Проверить страницы: артист, трек, сэмпл, альбом, поиск

---

## Critical Context
- **Сервер не запускать** из инструмента — пользователь запускает `dotnet run` вручную
- Backend на HEAD (без Slug-полей, без SlugHelper, без by-slug эндпоинтов, без wwwroot)
- Swagger на `/` (не `/swagger`)
- `API_BASE = 'http://localhost:5000/api'`, `credentials: 'include'`

---

## Relevant Files

### Backend
| Файл | Назначение |
|---|---|
| `backend/Program.cs` | Конфигурация: CORS, JWT, rate limiting, Swagger, DI |
| `backend/Controllers/AuthController.cs` | Регистрация, вход, выход, /me — httpOnly cookie |
| `backend/Controllers/AlbumsController.cs` | `GET /api/albums/{id}` |
| `backend/Controllers/ArtistsController.cs` | CRUD исполнителей |
| `backend/Controllers/TracksController.cs` | CRUD треков |
| `backend/Controllers/SamplesController.cs` | CRUD сэмплов |
| `backend/Controllers/RevisionsController.cs` | История правок |
| `backend/Services/AuthService.cs` | RegisterAsync, LoginAsync, GenerateToken |
| `backend/Services/SearchService.cs` | Поиск по трекам |
| `backend/Services/UrlValidatorService.cs` | Валидация URL |
| `backend/Services/EmbedService.cs` | Embed-виджеты |
| `backend/DTOs/AuthDtos.cs` | RegisterRequest (Regex пароля), LoginRequest, AuthResponse |
| `backend/Models/User.cs` | Пользователь (Username, Email, PasswordHash, Role, IsActive) |
| `backend/Models/Artist.cs` | Исполнитель |
| `backend/Models/Album.cs` | Альбом |
| `backend/Models/Track.cs` | Трек |
| `backend/Models/Sample.cs` | Сэмпл |
| `backend/Data/AppDbContext.cs` | EF Core контекст |
| `backend/appsettings.json` | Строка подключения, JWT Key/Issuer/Audience, Frontend.Url |

### Frontend
| Файл | Назначение |
|---|---|
| `frontend/index.html` | Главная — список исполнителей |
| `frontend/artist.html` | Детально об исполнителе |
| `frontend/album.html` | Детально об альбоме |
| `frontend/track.html` | Детально о треке |
| `frontend/sample.html` | Детально о сэмпле |
| `frontend/search.html` | Поиск |
| `frontend/auth.html` | Вход (login) |
| `frontend/register.html` | Регистрация с inline-валидацией |
| `frontend/modules/api.js` | Fetch-обёртка, все API функции |
| `frontend/modules/auth.js` | register, login, logout, checkAuth |
| `frontend/modules/render.js` | Web-интерфейс: рендер всех страниц |
| `frontend/modules/utils.js` | Хелперы: текущий пользователь, toast, форматирование |
| `frontend/style.css` | Стили |
| `frontend/serve.py` | Статический сервер Python |
