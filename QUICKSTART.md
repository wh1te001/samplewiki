# 🚀 QUICK START - Быстрый старт SampleWiki

## За 5 минут к работающему приложению

### Требования:
- .NET 8.0 SDK установлен
- MySQL сервер запущен
- Браузер (Chrome, Firefox, Edge)

---

## Шаг 1: Запуск Backend (2 минуты)

```powershell
cd c:\Users\wh1te\Desktop\ебучий диплом\choto\backend

# Восстановление пакетов
dotnet restore

# Компиляция и запуск (с автоматическими миграциями)
dotnet run
```

✅ **Ожидается:** `🚀 Сервер запущен на http://localhost:5000`

---

## Шаг 2: Запуск Frontend (1 минута)

### Вариант A: Live Server (VS Code)

1. Откройте папку `frontend` в VS Code
2. Кликните правой кнопкой на `index.html`
3. Выберите "Open with Live Server"
4. Браузер откроется автоматически

### Вариант B: Python HTTP Server

```powershell
cd c:\Users\wh1te\Desktop\ебучий диплом\choto\frontend
python -m http.server 8000
```

Откройте браузер: http://localhost:8000

---

## Шаг 3: Первый тест (2 минуты)

### Регистрация:

1. Нажмите "Вход" в навигации
2. Нажмите кнопку "Регистрация"
3. Заполните:
   - Имя: `test_user`
   - Email: `test@example.com`
   - Пароль: `TestPass123`
4. Нажмите "Зарегистрироваться"

### Создание данных через Swagger:

1. Откройте http://localhost:5000
2. Нажмите "Try it out" для любого POST endpoint
3. Заполните данные и нажмите "Execute"

**Пример - создание исполнителя:**

```json
{
  "name": "The Beatles",
  "description": "Легендарная британская рок-группа",
  "wikiLink": "https://en.wikipedia.org/wiki/The_Beatles"
}
```

---

## Проверка что все работает

### ✅ Признаки успешной работы:

1. **Backend:** 
   - http://localhost:5000 открывается в браузере
   - Swagger доступен
   - Console показывает логи

2. **Frontend:**
   - http://localhost:8000 открывается (или Live Server URL)
   - Видна навигация и список исполнителей
   - Может быть пусто (если нет данных)

3. **API:**
   - GET http://localhost:5000/api/artists работает
   - Регистрация успешно проходит
   - Уведомления (toast) показываются

---

## Быстрые команды

```powershell
# Backend
cd backend && dotnet run                    # Запуск
dotnet build                                # Компиляция
dotnet ef database update                   # Миграции

# Frontend
python -m http.server 8000                  # HTTP сервер Python

# Тестирование API
curl http://localhost:5000/api/artists      # Получить исполнителей
```

---

## Структура файлов

```
choto/
├── backend/
│   ├── Program.cs                   # Точка входа (DI, CORS, Auth)
│   ├── Models/                      # Сущности БД
│   ├── Controllers/                 # API endpoints
│   ├── Services/                    # Бизнес логика
│   ├── Data/                        # DbContext и миграции
│   ├── DTOs/                        # Модели запроса/ответа
│   ├── Interceptors/                # Аудит и логирование
│   ├── appsettings.json             # Конфигурация
│   └── backend.csproj               # Зависимости
│
├── frontend/
│   ├── index.html                   # Главная HTML
│   ├── style.css                    # Стили (Dark Theme)
│   ├── app.js                       # Главная логика
│   ├── modules/
│   │   ├── api.js                   # Fetch wrapper
│   │   ├── auth.js                  # Аутентификация
│   │   ├── render.js                # Рендеринг компонентов
│   │   └── utils.js                 # Утилиты
│   └── README.md
│
├── SETUP_INSTRUCTIONS.md            # Полная инструкция
├── DIPLOMA_CHECKLIST.md             # Чек-лист соответствия
└── QUICKSTART.md                    # Этот файл
```

---

## Основные URL

| Назначение | URL |
|-----------|-----|
| API Swagger | http://localhost:5000 |
| API Artists | http://localhost:5000/api/artists |
| Frontend | http://localhost:8000 |
| Login | http://localhost:8000 → Вход |
| Artists | http://localhost:8000 → Исполнители |

---

## Решение проблем

### "Connection refused" при backend запуске
→ MySQL не запущен. Запустите: `mysql -u root`

### "Port 5000 already in use"
→ Измените порт в `Program.cs` или завершите процесс:
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS ошибка в браузере
→ Проверьте что backend работает и CORS включен в `Program.cs`

### Frontend не загружается
→ Проверьте пути в `index.html` и DevTools (F12) консоль

---

## Теперь готово! 🎉

Полная документация в `SETUP_INSTRUCTIONS.md`  
Чек-лист требований в `DIPLOMA_CHECKLIST.md`

Приложение полностью функционально и готово к сдаче дипломного проекта!
