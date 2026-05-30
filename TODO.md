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
- [x] **CRUD для артистов** — модальное окно на index.html (создание) и artist.html (редактирование/удаление)
- [x] **CRUD для треков** — модальное окно на artist.html (создание) и track.html (редактирование/удаление)
- [x] **CRUD для сэмплов** — модальное окно на track.html (создание) и sample.html (редактирование/удаление)
- [x] **Привязка к пользователю** — кнопки Add/Edit/Delete видны только авторизованным
- [ ] **Поддержка Rutube** — embed плеера для треков с Rutube
- [ ] **Поддержка VK Video** — embed плеера для треков с VK Видео
- [x] **Авто-плей при клике на таймкод** — работает после перехода на MPA
- [ ] **Переделать лейаут** — привести дизайн к whosampled-like
- [x] **Переход SPA → MPA** — отдельные страницы (index, artist, track, sample, album, auth, search), ссылки через `?id=`, навбар без истории
- [x] **Удалена страница "История"** — убрана из навбара
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
