# 🎵 SampleWiki - Дипломный проект

> **Каталог музыкальных сэмплов** - полноценное веб-приложение с REST API backend и интерактивным frontend.

## 🎯 Описание проекта

**SampleWiki** - это платформа для каталогизации музыкальных сэмплов, интерполяций и ремиксов. Пользователи могут добавлять исполнителей, альбомы, треки и сэмплы из различных источников (YouTube, SoundCloud, Bandcamp), просматривать историю изменений и искать информацию.

## 📚 Структура проекта

```
SampleWiki/
├── backend/                 # ASP.NET Core 8.0 REST API
│   ├── Controllers/         # REST endpoints (Auth, Artists, Tracks, Samples, Revisions)
│   ├── Models/              # Сущности БД (User, Artist, Album, Track, Sample, Artwork, Revision)
│   ├── Services/            # Бизнес-логика (Auth, UrlValidator, Embed, Search)
│   ├── Data/                # Entity Framework Core DbContext
│   ├── DTOs/                # Модели передачи данных
│   ├── Interceptors/        # Аудит и логирование
│   ├── Program.cs           # Точка входа с конфигурацией
│   ├── appsettings.json     # Конфигурация (MySQL, JWT)
│   └── backend.csproj       # Зависимости
│
├── frontend/                # Vanilla JavaScript приложение
│   ├── index.html           # Главная HTML страница
│   ├── style.css            # Dark theme стили
│   ├── app.js               # Главная логика приложения
│   └── modules/             # JavaScript модули
│       ├── api.js           # Fetch wrapper с Authorization
│       ├── auth.js          # Управление аутентификацией
│       ├── render.js        # Рендеринг компонентов
│       └── utils.js         # Утилиты и форматирование
│
├── QUICKSTART.md            # Быстрый старт за 5 минут
├── SETUP_INSTRUCTIONS.md    # Полная инструкция развертывания
├── DIPLOMA_CHECKLIST.md     # Чек-лист соответствия требованиям
├── SUMMARY.md               # Полный список файлов
└── README.md                # Этот файл
```

## 🚀 Быстрый старт

### Требования
- .NET 8.0 SDK
- MySQL 8.0+
- Браузер (Chrome, Firefox, Edge)

### Запуск (3 команды)

```powershell
# 1. Backend
cd backend
dotnet run

# 2. Frontend (новый терминал)
cd frontend
python -m http.server 8000

# 3. Откройте в браузере
# http://localhost:8000
```

**Полная инструкция:** см. [QUICKSTART.md](QUICKSTART.md)

## 🎨 Функциональность

### Backend
- ✅ **Аутентификация** - Регистрация, вход, JWT токены, BCrypt пароли
- ✅ **REST API** - 18+ endpoints для управления данными
- ✅ **Исполнители** - CRUD операции для исполнителей
- ✅ **Альбомы** - Каталог альбомов с метаданными
- ✅ **Треки** - Управление треками с жанрами и длительностью
- ✅ **Сэмплы** - Учет сэмплов с типами (Sample, Interpolation, Cover, Remix)
- ✅ **Платформы** - Поддержка YouTube, SoundCloud, Bandcamp
- ✅ **История** - Отслеживание всех изменений (audit log)
- ✅ **Поиск** - Глобальный поиск по всем сущностям
- ✅ **Swagger** - Интерактивная API документация

### Frontend
- ✅ **Dark Theme** - Современное оформление с оранжевым акцентом
- ✅ **Навигация** - SPA с переключением между разделами
- ✅ **Список исполнителей** - Grid layout с карточками
- ✅ **Детали** - Полная информация об исполнителе с альбомами
- ✅ **Поиск** - Глобальный поиск по всем сущностям в реальном времени
- ✅ **История правок** - Просмотр changelog всех изменений
- ✅ **Видео эмбеды** - Встраивание видео с ленивой загрузкой
- ✅ **Уведомления** - Toast сообщения (успех, ошибка, информация)
- ✅ **Адаптивность** - Mobile-friendly дизайн
- ✅ **Безопасность** - XSS защита, правильное использование токенов

## 🔌 API Endpoints

### Аутентификация
```
POST   /api/auth/register      Регистрация
POST   /api/auth/login         Вход
GET    /api/auth/me            Информация о текущем пользователе
```

### Исполнители
```
GET    /api/artists            Получить всех
GET    /api/artists/{id}       Получить по ID
POST   /api/artists            Создать [Authorize]
PUT    /api/artists/{id}       Обновить [Authorize]
DELETE /api/artists/{id}       Удалить [Authorize(Admin)]
```

### Треки
```
GET    /api/tracks             Получить всех
GET    /api/tracks/{id}        Получить по ID
GET    /api/tracks/album/{id}  Получить по альбому
POST   /api/tracks             Создать [Authorize]
PUT    /api/tracks/{id}        Обновить [Authorize]
DELETE /api/tracks/{id}        Удалить [Authorize]
```

### Сэмплы
```
GET    /api/samples            Получить всех
GET    /api/samples/{id}       Получить по ID
GET    /api/samples/track/{id} Получить по треку
POST   /api/samples            Создать [Authorize]
PUT    /api/samples/{id}       Обновить [Authorize]
DELETE /api/samples/{id}       Удалить [Authorize]
```

### История
```
GET    /api/revisions          Получить все правки
GET    /api/revisions/track/{id}  Получить по треку
GET    /api/revisions/user/{id}   Получить по пользователю
```

## 🔐 Безопасность

- **Хеширование паролей** - BCrypt с солью
- **JWT токены** - 24-часовой срок действия
- **Authorization** - Защита endpoints через [Authorize] атрибуты
- **Role-based** - Разные уровни доступа (User, Admin)
- **CORS** - Настроена политика для frontend
- **XSS защита** - Экранирование HTML в frontend

## 💻 Технологический стек

### Backend
- **.NET 8.0** - Современный runtime
- **ASP.NET Core** - Web framework
- **Entity Framework Core** - ORM
- **MySQL** (Pomelo) - База данных
- **JWT** - Аутентификация
- **BCrypt** - Хеширование паролей
- **Swagger** - API документация

### Frontend
- **Vanilla JavaScript** - ES6+ без фреймворков
- **HTML5** - Семантичный HTML
- **CSS3** - Современные стили
- **Fetch API** - HTTP запросы
- **sessionStorage** - Хранение токена

## 📖 Документация

1. **[QUICKSTART.md](QUICKSTART.md)** - Начните отсюда (5 минут)
2. **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Полная инструкция
3. **[DIPLOMA_CHECKLIST.md](DIPLOMA_CHECKLIST.md)** - Чек-лист требований
4. **[SUMMARY.md](SUMMARY.md)** - Список всех файлов

## 🧪 Тестирование

### Swagger UI
- Откройте http://localhost:5000 после запуска backend
- Все endpoints можно тестировать интерактивно

### cURL примеры
```bash
# Регистрация
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Pass123"}'

# Получить исполнителей
curl http://localhost:5000/api/artists

# Создать исполнителя (требует token)
curl -X POST http://localhost:5000/api/artists \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"The Beatles","description":"Rock band"}'
```

**Полные примеры:** см. [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)

## 📊 Требования соответствия

✅ **Все требования дипломного проекта выполнены:**
- ✅ Полноценный REST API с 18+ endpoints
- ✅ Аутентификация и авторизация
- ✅ Работа с реляционной базой данных
- ✅ Интерактивный веб-интерфейс
- ✅ Управление данными (CRUD)
- ✅ История изменений
- ✅ Поиск по данным
- ✅ Валидация и обработка ошибок
- ✅ Документация и примеры
- ✅ Чистый, хорошо организованный код

## 🐛 Решение проблем

### MySQL connection error
```
Убедитесь что MySQL запущен: mysql -u root -p
```

### Port 5000 уже используется
```
Измените порт в Program.cs или:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend не загружается
```
Проверьте консоль браузера (F12) и DevTools Network таб
```

**Полная помощь:** см. [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md#-решение-проблем)

## 📞 Контакты и поддержка

- 📚 **Документация:** [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- ✅ **Чек-лист:** [DIPLOMA_CHECKLIST.md](DIPLOMA_CHECKLIST.md)  
- 🚀 **Быстрый старт:** [QUICKSTART.md](QUICKSTART.md)

## 📄 Лицензия

Дипломный проект. Использование в образовательных целях.

---

**Статус:** ✅ **ГОТОВО К СДАЧЕ**  
**Версия:** 1.0 Production-ready  
**Дата:** 17 мая 2026

🎉 **Приложение полностью функционально и готово к защите диплома!**
