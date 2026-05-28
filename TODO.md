# TODO — SampleWiki

## Выполнено
- [x] SPA-навигация: hash-роутинг (#artists, #artist/5, #track/3, #sample/2) + кнопки браузера
- [x] YouTube embed: `?origin=`, `referrerpolicy`, `web-share`
- [x] Исправлены битые YouTube ссылки в seed (5 из 7)
- [x] `StartTimeSeconds` добавлен в модель Sample (бэкенд + SQL + DTO)
- [x] Таймкоды на странице трека: кликабельные бейджи, перематывают embed
- [x] Таймкоды на странице сэмпла: кнопка «Сэмпл начинается на X:XX» → прыжок
- [x] Все видео в 16:9 (aspect-ratio), без фиксированной высоты
- [x] Страница сэмпла: два трека (сэмплер + источник) с ссылками на их страницы
- [x] Sample model: вместо Title/SourceUrl → SampledTrackId (FK → Tracks)
- [x] Новые артисты/треки в seed: King Crimson, Volcano Choir, George Duke
- [x] Регистрация и авторизация (бэкенд: AuthController + JWT, фронтенд: форма логин/регистрация, localStorage)

## Нужно сделать
- [x] **Регистрация и авторизация** — нормальная форма логина/регистрации
- [x] **Безопасная регистрация и авторизация** — хеширование паролей (bcrypt), httpOnly cookies вместо localStorage, валидация на бэкенде (сложность пароля, email), rate limiting (10 запр/мин), CORS restricted + credentials, JWT issuer/audience
- [ ] **CRUD для сэмплов** — форма добавления/редактирования сэмпла (выбор треков, тип, таймкод, описание)
- [ ] **CRUD для треков** — форма добавления/редактирования трека (название, артист, альбом, YouTube ссылка, жанр)
- [ ] **CRUD для артистов** — форма добавления/редактирования артиста
- [ ] **Привязка к пользователю** — только авторизованные могут добавлять/редактировать сэмплы
- [ ] **Авто-плей при клике на таймкод** — `postMessage seekTo` работает, `playVideo` блокируется браузером (cross-origin). Варианты: Muted autoplay, или Web Audio API, или YouTube IFrame API без `enablejsapi` через кастомный плеер
- [ ] **Чистые URL (History API + slug)** — вместо `/#track/3` сделать `/kanye-west/stronger`
  - [ ] `serve.py` — HTTP-сервер с fallback на `index.html`
  - [ ] `slugify()` — функция для генерации ЧПУ из названий
  - [ ] Роутинг: `hashchange` → `pushState` + `popstate`, парсинг `pathname`
  - [ ] Обновить все `navigateTo()` и ссылки в `render.js`
  - [ ] Артисты: `/{artist-slug}`
  - [ ] Треки: `/{artist-slug}/{track-slug}`
  - [ ] Сэмплы: `/sample/{id}/{artist-slug}-samples-{artist-slug}-{title-slug}`
- [ ] **Переделать лейаут** — привести дизайн к whosampled-like
- [ ] **Переход SPA → MPA** — разделить index.html на отдельные страницы (главная, артист, трек, сэмпл, альбом, авторизация), отказаться от JS-роутинга
- [ ] **Удалить страницу "История"** — убрать из навбара и из роутинга
- [ ] **Разобраться со всем остальным** — рефакторинг, баги, доработки

## В планах (дальние)
- [ ] Раздел «Похожие треки/исполнители»
- [ ] Страница артиста — показать какие треки сэмплировали его песни
- [ ] Рейтинг/комментарии для сэмплов
- [ ] Показать на странице трека: какие другие треки сэмплируют ЭТОТ трек (reverse samples)

## Запуск проекта
```bash
# 1. MariaDB — через XAMPP (phpMyAdmin на localhost/phpmyadmin)
#    или через командную строку:
mysql -u root < backend/sql/create_tables.sql
mysql -u root < backend/sql/seed_sample_data.sql

# 2. Бэкенд (ASP.NET Core 8.0)
cd backend
dotnet run

# 3. Фронтенд (любой HTTP-сервер, не file://!)
cd frontend
python -m http.server 8000
# Открыть: http://localhost:8000
```
