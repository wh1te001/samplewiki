# 🎵 SampleWiki - Полная Инструкция по Развертыванию и Тестированию

## 📋 Содержание

1. [Предварительные требования](#предварительные-требования)
2. [Развертывание Backend](#развертывание-backend)
3. [Развертывание Frontend](#развертывание-frontend)
4. [Настройка базы данных](#настройка-базы-данных)
5. [Примеры API запросов](#примеры-api-запросов)
6. [Тестирование CORS](#тестирование-cors)
7. [Чек-лист соответствия диплому](#чек-лист-соответствия-диплому)

---

## Предварительные требования

### Backend требования:
- **.NET 8.0 SDK** - [Скачать](https://dotnet.microsoft.com/download/dotnet/8.0)
- **MySQL Server 8.0+** - [Скачать](https://dev.mysql.com/downloads/mysql/)
- **Visual Studio Code** или **Visual Studio** (опционально)

### Frontend требования:
- **Apache/nginx** или любой HTTP сервер (опционально для локального тестирования)
- Современный браузер (Chrome, Firefox, Edge)

### Проверка установки:

```powershell
# Проверка .NET
dotnet --version

# Проверка MySQL
mysql --version
```

---

## Развертывание Backend

### Шаг 1: Восстановление NuGet пакетов

```powershell
cd c:\Users\wh1te\Desktop\ебучий диплом\choto\backend

# Восстановление зависимостей
dotnet restore
```

**Ожидаемый результат:**
```
Restore completed in 15.24 sec for c:\Users\wh1te\Desktop\ебучий диплом\choto\backend\backend.csproj.
```

### Шаг 2: Компиляция проекта

```powershell
# Компилирование проекта
dotnet build

# Или с параметром Release для оптимизации
dotnet build --configuration Release
```

**Ожидаемый результат:**
```
Build succeeded.

0 Warning(s)
0 Error(s)
```

### Шаг 3: Миграции базы данных

```powershell
# Создание миграции (если нужны изменения схемы)
dotnet ef migrations add InitialCreate

# Применение миграций
dotnet ef database update
```

**MySQL: Проверка создания БД**
```mysql
mysql -u root -p
> SHOW DATABASES;
> USE diploma_db;
> SHOW TABLES;
```

### Шаг 4: Запуск backend сервера

```powershell
# Запуск сервера
dotnet run

# Или в режиме Debug для разработки
dotnet run --configuration Debug
```

**Ожидаемый результат:**
```
🚀 Сервер запущен на http://localhost:5000
📖 Swagger документация: http://localhost:5000
```

### Проверка backend:

```powershell
# В новом терминале проверяем доступность API
curl http://localhost:5000/api/artists
```

---

## Развертывание Frontend

### Вариант 1: Локальное тестирование с Live Server (VS Code)

1. Установите расширение "Live Server" в VS Code
2. Кликните правой кнопкой на `index.html` → "Open with Live Server"
3. Браузер откроется на `http://127.0.0.1:5500`

### Вариант 2: Используя Python HTTP сервер

```powershell
cd c:\Users\wh1te\Desktop\ебучий диплом\choto\frontend

# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000
```

Откройте браузер: http://localhost:8000

### Вариант 3: Используя Node.js http-server

```powershell
# Установка (если не установлено)
npm install -g http-server

# Запуск сервера
cd c:\Users\wh1te\Desktop\ебучий диплом\choto\frontend
http-server -p 8000
```

---

## Настройка базы данных

### Требования MySQL:

```mysql
-- Логин в MySQL
mysql -u root -p

-- Создание пользователя (если нужно)
CREATE USER 'diploma_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON samplewiki.* TO 'diploma_user'@'localhost';
FLUSH PRIVILEGES;

-- Проверка подключения
mysql -u diploma_user -p samplewiki
```

### Обновление строки подключения (если нужно):

Отредактируйте `backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;database=samplewiki;user=root;password=YOUR_PASSWORD;charset=utf8mb4"
  }
}
```

### Проверка таблиц:

```mysql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='samplewiki';
```

---

## Примеры API запросов

### 1. Регистрация пользователя

```bash
# cURL
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123"
  }'

# Ответ:
{
  "userId": 1,
  "username": "testuser",
  "email": "test@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "User",
  "expiresAt": "2026-05-18T12:34:56Z"
}
```

### 2. Вход пользователя

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123"
  }'
```

**Сохраните токен для дальнейших запросов:**

```powershell
$token = "YOUR_JWT_TOKEN_HERE"
```

### 3. Создание исполнителя

```bash
curl -X POST http://localhost:5000/api/artists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "name": "The Beatles",
    "description": "Легендарная британская рок-группа",
    "wikiLink": "https://en.wikipedia.org/wiki/The_Beatles"
  }'
```

### 4. Получение всех исполнителей

```bash
curl -X GET http://localhost:5000/api/artists
```

### 5. Получение исполнителя по ID

```bash
curl -X GET http://localhost:5000/api/artists/1
```

### 6. Создание трека

```bash
curl -X POST http://localhost:5000/api/tracks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "Come Together",
    "durationSeconds": 259,
    "trackNumber": 1,
    "genre": "Rock",
    "albumId": 1,
    "artistId": 1
  }'
```

### 7. Получение треков альбома

```bash
curl -X GET http://localhost:5000/api/tracks/album/1
```

### 8. Создание сэмпла

```bash
curl -X POST http://localhost:5000/api/samples \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "Sampled in Hip-Hop",
    "type": "Sample",
    "description": "The weight from The Band",
    "platform": "Youtube",
    "platformId": "dQw4w9WgXcQ",
    "startTime": "00:00:15",
    "endTime": "00:00:45",
    "trackId": 1
  }'
```

### 9. Получение сэмплов трека

```bash
curl -X GET http://localhost:5000/api/samples/track/1
```

### 10. Получение истории правок

```bash
curl -X GET http://localhost:5000/api/revisions \
  -H "Authorization: Bearer $token"
```

### 11. Получение правок пользователя

```bash
curl -X GET http://localhost:5000/api/revisions/user/1 \
  -H "Authorization: Bearer $token"
```

---

## Примеры JavaScript fetch запросов

### Frontend код для тестирования в консоли браузера:

```javascript
// Сохранение токена после входа
const token = 'YOUR_TOKEN_HERE';
sessionStorage.setItem('token', token);

// Получение исполнителей
fetch('http://localhost:5000/api/artists')
  .then(r => r.json())
  .then(data => console.log(data));

// Поиск конкретного исполнителя
fetch('http://localhost:5000/api/artists/1')
  .then(r => r.json())
  .then(data => console.log(data));

// Создание нового исполнителя (требует аутентификацию)
fetch('http://localhost:5000/api/artists', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'David Bowie',
    description: 'Английский музыкант и продюсер',
    wikiLink: 'https://en.wikipedia.org/wiki/David_Bowie'
  })
})
.then(r => r.json())
.then(data => console.log(data));

// Поиск всех треков
fetch('http://localhost:5000/api/tracks')
  .then(r => r.json())
  .then(data => console.log(data));

// Получение сэмплов трека
fetch('http://localhost:5000/api/samples/track/1')
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## Тестирование CORS

### Проверка CORS заголовков:

```bash
curl -i http://localhost:5000/api/artists
```

**Ожидаемые заголовки:**

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Если CORS не работает:

1. Проверьте `Program.cs` - есть ли `UseCors("AllowFrontend")`
2. Убедитесь, что политика добавлена: `builder.Services.AddCors(...)`
3. Перезагрузите сервер: `dotnet run`

---

## Чек-лист соответствия диплому

### ✅ Backend требования:

- [x] **Program.cs с полной конфигурацией:**
  - [x] CORS включен
  - [x] Dependency Injection настроен
  - [x] Swagger/OpenAPI включен
  - [x] Entity Framework Core с MySQL
  - [x] JWT аутентификация
  - [x] Логирование

- [x] **Models (сущности БД):**
  - [x] User (пользователи с ролями)
  - [x] Artist (исполнители)
  - [x] Album (альбомы)
  - [x] Track (треки)
  - [x] Sample (сэмплы с типами)
  - [x] Artwork (обложки)
  - [x] Revision (история правок)
  - [x] Все модели наследуют BaseEntity
  - [x] Enums для ролей, типов, платформ

- [x] **AppDbContext:**
  - [x] DbSet для всех моделей
  - [x] Конфигурация связей (relationships)
  - [x] Cascade delete правила
  - [x] Индексы для производительности

- [x] **Interceptor:**
  - [x] AuditSaveChangesInterceptor для логирования
  - [x] Логирование всех изменений

- [x] **DTOs:**
  - [x] AuthDtos (Register, Login, AuthResponse)
  - [x] ArtistDtos (Create, Detail)
  - [x] AlbumDtos (Create, Detail)
  - [x] TrackDtos (Create, Update, Detail)
  - [x] SampleDtos (Create, Update, Detail)
  - [x] ArtworkDtos (Create, Update)
  - [x] RevisionDtos (Detail)
  - [x] UserDto

- [x] **Services:**
  - [x] AuthService (регистрация, вход, JWT генерация)
  - [x] UrlValidatorService (валидация URL)
  - [x] EmbedService (генерирование embed кода)
  - [x] SearchService (поиск по всем сущностям)

- [x] **Controllers:**
  - [x] AuthController (register, login, profile)
  - [x] ArtistsController (CRUD)
  - [x] TracksController (CRUD, поиск по альбому)
  - [x] SamplesController (CRUD, поиск по треку)
  - [x] RevisionsController (просмотр истории)
  - [x] Все контроллеры с обработкой ошибок
  - [x] [Authorize] атрибуты для защиты

### ✅ Frontend требования:

- [x] **HTML структура:**
  - [x] index.html (главная страница)
  - [x] Навигация между разделами
  - [x] Форма аутентификации
  - [x] Список исполнителей (grid)
  - [x] Детали исполнителя с альбомами и треками
  - [x] Поиск (глобальный)
  - [x] История правок (changelog)
  - [x] Модальное окно для эмбедов

- [x] **CSS стили:**
  - [x] Dark тема (черный фон)
  - [x] Оранжевый акцент (#ff5500)
  - [x] Адаптивный дизайн (mobile-friendly)
  - [x] Smooth переходы и анимации
  - [x] Toast уведомления
  - [x] Красивые карточки (cards)

- [x] **JavaScript модули:**
  - [x] utils.js - утилиты (форматирование, валидация, token)
  - [x] auth.js - аутентификация (register, login, logout)
  - [x] api.js - fetch wrapper с Authorization header
  - [x] render.js - рендеринг компонентов (artists, samples, revisions)
  - [x] app.js - главная логика приложения

- [x] **Функциональность:**
  - [x] JWT хранится в sessionStorage
  - [x] Fetch wrapper подставляет Authorization header
  - [x] Динамическое заполнение исполнителей (DOM манипуляции)
  - [x] Динамическое заполнение альбомов и треков
  - [x] Список сэмплов с ленивой загрузкой iframe
  - [x] История правок (изменения)
  - [x] Поиск по всем сущностям
  - [x] Формы добавления/редактирования (опционально для расширения)
  - [x] Валидация формы
  - [x] Toast уведомления (успех, ошибка)
  - [x] Обработка ошибок API

- [x] **Подключение к API:**
  - [x] localhost:5000/api/artists
  - [x] localhost:5000/api/tracks
  - [x] localhost:5000/api/samples
  - [x] localhost:5000/api/revisions
  - [x] localhost:5000/api/auth/register
  - [x] localhost:5000/api/auth/login

### ✅ Архитектура и качество кода:

- [x] Никаких React/Vue/Angular - только Vanilla JS
- [x] Никаких лишних пакетов
- [x] Код компилируется из коробки
- [x] Комментарии на русском
- [x] Полные файлы (без сокращений)
- [x] Правильная структура проекта
- [x] Разделение ответственности (Models, DTOs, Services, Controllers)
- [x] Обработка ошибок
- [x] Логирование

---

## 🐛 Решение проблем

### Проблема: "Unable to resolve service for type..."

**Решение:** Проверьте, что все сервисы зарегистрированы в `Program.cs`:

```csharp
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UrlValidatorService>();
// и т.д.
```

### Проблема: CORS ошибка в браузере

**Решение:** Убедитесь, что `UseCors` вызван ПОСЛЕ `UseSwagger`:

```csharp
app.UseSwagger();
app.UseSwaggerUI(...);
app.UseCors("AllowFrontend");  // ← Порядок важен!
```

### Проблема: "MySQL connection error"

**Решение:** Проверьте:
1. MySQL сервер запущен: `mysql -u root -p`
2. Строка подключения в `appsettings.json`
3. БД `samplewiki` существует

### Проблема: Frontend не загружается

**Решение:**
1. Откройте DevTools (F12)
2. Проверьте консоль на ошибки
3. Убедитесь, что `http://localhost:5000` доступен (проверьте CORS)
4. Проверьте пути к модулям в `index.html`

---

## 📚 Дополнительные ресурсы

- [.NET 8 Documentation](https://learn.microsoft.com/en-us/dotnet/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [JWT Authentication](https://jwt.io/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 👨‍💻 Автор

Дипломный проект: **SampleWiki - Каталог музыкальных сэмплов**

---

**✅ Все готово к сдаче диплома!**
