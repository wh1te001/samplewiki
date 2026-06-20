# SampleWiki — Каталог музыкальных сэмплов

Веб-каталог музыкальных заимствований (Wikipedia для сэмплов). Трек A содержит сэмпл из трека B — SampleWiki показывает, кто кого засемплировал.

## Технологический стек

| Компонент | Технология |
|---|---|
| Backend API | ASP.NET Core (.NET 8) — порт 5000 |
| Frontend | Статические HTML + Vanilla JS + CSS (MPA) |
| Статический сервер | Python http.server — порт 8000 |
| База данных | MySQL (Entity Framework Core + Pomelo) |
| Аутентификация | JWT в httpOnly cookie (HMAC-SHA256, 24ч) |
| Хеширование паролей | BCrypt.Net |
| Документация API | Swagger (на корне /) |
| Rate Limiting | FixedWindow, 10/min/IP |

## Архитектура

```
Браузер ──GET──→ Python :8000 (serve.py)
                  ↓
              index.html, artist.html, track.html, ...
                  ↓ (JS fetch с credentials: 'include')
ASP.NET :5000 ──→ MySQL
```

Фронтенд и бэкенд — два разных сервера. Фронтенд общается с API через `fetch` + `credentials: 'include'` (httpOnly cookie). CORS настроен под `localhost:8000`.

## Быстрый старт

### Требования
- .NET 8.0 SDK
- MySQL 8.0+
- Python 3.x
- Браузер Chrome/Firefox/Edge

### Запуск (3 команды)

```bash
# 1. Backend
cd backend
dotnet run

# 2. Frontend (новый терминал)
cd frontend
python serve.py

# 3. Откройте в браузере
# http://localhost:8000
```

### Конфигурация

Единственное, что нужно настроить — IP-адрес (для локальной разработки `127.0.0.1`):

| Файл | Параметр |
|---|---|
| `backend/appsettings.json` | `VpsIp: "127.0.0.1"` |
| `frontend/modules/config.js` | `VPS_IP = '127.0.0.1'` |

## Страницы

| URL | Описание |
|---|---|
| `/index.html` | Главная — список исполнителей |
| `/artist.html?id=1` | Исполнитель + альбомы + треки |
| `/album.html?id=1` | Альбом + треки + обложки |
| `/track.html?id=1` | Трек + сэмплы (откуда и куда) |
| `/sample.html?id=1` | Детально о сэмпле |
| `/search.html?q=...` | Поиск |
| `/auth.html` | Вход |
| `/register.html` | Регистрация |
| `/submit.html` | Создание сэмпла (авторизованные) |

## Модель данных

```
Artist ──1:N──→ Album ──1:N──→ Track ──1:N──→ Sample
                                   ↑              ↓
                                   │    SampledBy │
                                   └──────←───────┘
User ──1:N──→ Track
User ──1:N──→ Revision
Album ──1:N──→ Artwork
```

- **Artist**: имя, описание, WikiLink
- **Album**: название, год, ArtistId
- **Track**: название, номер, жанр, ResourceUrl, AlbumId, ArtistId, UserId; Samples + SampledBy
- **Sample**: тип (Sample/Interpolation/Remake/Cover), StartTimeSeconds, TrackId, SampledTrackId
- **User**: имя, email, BCrypt-хеш, роль (Guest/User/Admin), IsActive, LastLoginAt
- **Revision**: TrackId, UserId, JSON-снапшот изменений, временная метка

## API Endpoints

### Auth
```
POST /api/auth/register   Регистрация (httpOnly cookie)
POST /api/auth/login      Вход (httpOnly cookie)
POST /api/auth/logout     Выход (очистка cookie)
GET  /api/auth/me         Текущий пользователь
```

### Artists
```
GET  /api/artists         Все исполнители
GET  /api/artists/{id}    Исполнитель с альбомами/треками
POST /api/artists         Создать [Authorize]
```

### Tracks
```
GET  /api/tracks              Все треки
GET  /api/tracks/{id}         Трек с иерархией
GET  /api/tracks/album/{id}   Треки альбома
POST /api/tracks              Создать [Authorize]
PUT  /api/tracks/{id}         Обновить [Authorize]
```

### Samples
```
GET  /api/samples              Все сэмплы
GET  /api/samples/{id}         Сэмпл с деталями
GET  /api/samples/track/{id}   Сэмплы трека
POST /api/samples              Создать [Authorize]
PUT  /api/samples/{id}         Обновить [Authorize]
```

### Albums
```
GET  /api/albums/{id}   Альбом с треками/исполнителем/обложками
```

### Search
```
GET  /api/search/artists?q=      Поиск исполнителей (автокомплит)
GET  /api/search/tracks?q=&artistId=  Поиск треков (автокомплит)
```

### Submit
```
POST /api/submit   Создать сэмпл (артист + альбом + трек + сэмпл в одной транзакции) [Authorize]
```

### Upload
```
POST /api/upload   Загрузить изображение (multipart/form-data) [Authorize]
```

### Revisions
```
GET  /api/revisions              Все правки
GET  /api/revisions/track/{id}   Правки трека
GET  /api/revisions/user/{id}    Правки пользователя
```

## Функциональность

### Backend
- ✅ Аутентификация (JWT httpOnly cookie, BCrypt, Rate Limiting)
- ✅ REST API (20+ endpoints)
- ✅ CRUD для исполнителей, альбомов, треков, сэмплов
- ✅ Создание сэмпла в одной транзакции (submit)
- ✅ Загрузка изображений
- ✅ Поиск артистов/треков (автокомплит)
- ✅ Валидация embed-ссылок (YouTube, VK Video, Rutube)
- ✅ Встраивание медиаплееров с таймкодами
- ✅ История ревизий (JSON-снапшоты)
- ✅ Swagger-документация

### Frontend
- ✅ Дизайн в стиле whosampled.com (тёмный navbar, красный акцент, Open Sans)
- ✅ Таблицы для треков, breadcrumbs, Song Connections
- ✅ Inline-поиск в navbar на всех страницах
- ✅ Форма создания сэмпла с автокомплитом и загрузкой файлов
- ✅ Регистрация/вход с inline-валидацией
- ✅ Отображение reverse samples (SampledBy — «Использован в»)
- ✅ Адаптивный дизайн
- ✅ Toast-уведомления
- ✅ XSS-защита (экранирование HTML)

## Безопасность

- **JWT в httpOnly cookie** — JS не видит токен, защита от XSS
- **SameSite=Strict** — защита от CSRF
- **BCrypt** — хеширование паролей с солью
- **Rate Limiting** — 10 запросов в минуту на IP для Auth
- **CORS** — только `localhost:8000`, AllowCredentials
- **Валидация** — Data Annotations на бэкенде + inline на фронтенде
- **Блокировка аккаунтов** — поле `IsActive`
- **Пароль** — минимум 8 символов + хотя бы 1 цифра

## Структура проекта

```
SampleWiki/
├── backend/
│   ├── Controllers/       # Auth, Artists, Tracks, Samples, Albums, Search, Submit, Upload, Revisions
│   ├── Models/            # User, Artist, Album, Track, Sample, Revision, Artwork
│   ├── Services/          # AuthService, SearchService, UrlValidatorService, EmbedService
│   ├── DTOs/              # AuthDtos и другие модели передачи данных
│   ├── Data/              # AppDbContext (EF Core)
│   ├── Interceptors/      # Аудит ревизий
│   ├── sql/               # SQL скрипты миграций
│   ├── Program.cs         # Точка входа (CORS, JWT, Swagger, DI)
│   └── appsettings.json   # Конфигурация (VpsIp, MySQL, JWT)
│
├── frontend/
│   ├── index.html         # Главная — список исполнителей
│   ├── artist.html        # Детально об исполнителе
│   ├── album.html         # Детально об альбоме
│   ├── track.html         # Детально о треке
│   ├── sample.html        # Детально о сэмпле
│   ├── search.html        # Поиск
│   ├── auth.html          # Вход
│   ├── register.html      # Регистрация
│   ├── submit.html        # Создание сэмпла
│   ├── style.css          # Стили (Open Sans, whosampled-дизайн)
│   ├── serve.py           # Статический сервер Python
│   └── modules/
│       ├── config.js      # Единственное место для VPS_IP
│       ├── api.js         # Fetch-обёртка с credentials: 'include'
│       ├── auth.js        # Регистрация, вход, выход, checkAuth
│       ├── render.js      # Отрисовка всех страниц
│       ├── submit.js      # Автокомплит, валидация, отправка submit
│       └── utils.js       # Хелперы (toast, форматирование, navbarSearch)
```
