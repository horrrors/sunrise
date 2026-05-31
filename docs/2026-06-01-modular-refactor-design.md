# Sunrise — Modular App Refactor — Design / Spec

**Дата:** 2026-06-01 · **Статус:** утверждён к реализации

## 1. Цель и философия
Превратить 5 самостоятельных тем-HTML (с дублированным контроллером ~2000 строк) в **одно модульное приложение**: одна HTML-структура, один контроллер `app.js`, темы — отдельные CSS-файлы (переключаемые на лету), весь текст/данные — в JSON (JS-обёртка). Изменение поведения — в одном месте; новая тема — один CSS-файл.

## 2. Ограничения (держим)
- Открытие **двойным кликом** через `file://`, **офлайн**, **без сервера и сборки**, ваниль (без фреймворка/бандлера).
- Поэтому данные — `.js`-обёртки (`window.SUNRISE.* = {…JSON…}`), грузятся через `<script src>`; темы-CSS — через `<link>` (свап href работает на file://). `fetch`/ES-`import` локального файла на file:// НЕ используем (CORS).
- **Сохранить всё текущее поведение** и совместимость: state v2, `progress.json`, навигация дня, календарь, 30 трофеев + тултипы, конфетти, сюрприз, comeback, ротация motd, выделяемый текст, экспорт/импорт.
- Тем-украшения-DOM (тикер/ханко) — **упрощаем** (характер тем — цвет/типографика/тени/анимация на единой разметке).

## 3. Архитектура (обзор)
Слои с чёткими границами:
- **Ядро** `logic.js` — чистые функции (состояние, предикаты бейджей, серия, календарь, прогресс, import/export). Без DOM. Тестируется.
- **Контроллер/вью** `app.js` — единственный, трогает DOM/localStorage/Date. Рендерит каноничную разметку, вешает события, эффекты, свитч тем.
- **Данные/текст** `data/*.js` — `window.SUNRISE.curriculum`, `window.SUNRISE.content`.
- **Темы** `themes/*.css` — стиль поверх каноничной разметки.

## 4. Структура файлов
```
index.html        — скелет; <link id="themeCss">; порядок: data/* → logic.js → app.js
app.js            — контроллер/вью
logic.js          — чистое ядро (+ тесты)
data/curriculum.js— window.SUNRISE = window.SUNRISE||{}; window.SUNRISE.curriculum = {phases, weeks}
data/content.js   — window.SUNRISE.content = { ui, tracks, badges, mottos, surprises, themes }
themes/neon.css · japanese.css · emerald.css · dashboard.css · bonus.css
test/logic.test.js · test/app.test.js
docs/…
```
Удаляются: `theme-neon/japanese/emerald/dashboard/bonus.html` (старые) и `index.html`-галерея (заменяется приложением).

## 5. Каноничная разметка (контракт; app.js рендерит, темы стилизуют)
Стабильные id/классы — НЕ менять без обновления тем:
- Шапка `header.app-header`: `.brand`, `#themeSelect`, `#daySelect`, `#calBtn`, `#trophiesBtn`, `#exportBtn`, `#importBtn`, `#importFile`, `#phaseLabel`.
- `#dashboard` — 4 карточки `.stat-card` с модификаторами `data-kind="progress|streak|phases|tracks"`; внутри `.eyebrow`, значение (`.ring`/`.streak-num`/`.prow`+`.bar`).
- Блок дня: `.day-rail` → `#prevDay.day-nav`, `section.today-wrap` → `#todayCard.today`, `#nextDay.day-nav`; баннер `#comeback`.
  - Внутри `#todayCard`: `.trackpill`, `.today-title`, `.warm`, `#taskList` (задачи `.task` > `input#cb_<taskId>` + `.box` + `.task-text`), `#reflect` (textarea), `.res-row .chip`, `#markReview` (для dsa), `#nextDayCta` (когда день закрыт).
  - На элементы с треком ставится `data-track="dsa|js|ts|node|sysdesign|patterns|distsys|db|cs|rest"` — **цвет трека задаёт CSS темы** (не JS).
- Календарь-модалка: `#calModal.modal` → `#calPrev`, `#calTitle`, `#calNext`, `#calClose`, `.cal-dow`, `#calGrid` (ячейки `.cday[.done|.today|.other]`).
- Трофеи-модалка: `#trophiesModal.modal` → `#trophiesTitle`, `#trophiesClose`, `#trophiesGrid` (плитки `.badge[.on|.off]` с `data-tip`).
- Футер: `#motd`.
- Эффекты (спавнит app.js, стилизует тема): `.confetti-piece`, `.toast`, `.badge-toast`.
Модалки скроллятся целиком (`.modal{overflow-y:auto; align-items:flex-start}`, панель `overflow:visible` — тултипы не режутся).

## 6. Контракт тем (CSS)
Каждая тема — один CSS-файл, который:
1. задаёт переменные на `:root` (палитра/шрифты/радиусы): напр. `--bg, --panel, --line, --ink, --ink-dim, --ink-faint, --accent, --gold, --font-display, --font-body, --font-mono`, цвета треков `--track-dsa … --track-cs`, цвета эффектов `--confetti-1..4`;
2. стилизует все каноничные хуки из §5 (включая `.confetti-piece/.toast/.badge-toast`, `.modal`, `.badge`, `.cday`, `.stat-card`, `.task` и т.д.);
3. подключает шрифты (Google Fonts `<link>` уже в скелете? — нет: шрифты грузит сама тема через `@import`/`@font-face` с офлайн-фолбэком на системные).
Темы НЕ содержат JS. Идентичность — через эти средства; bespoke-DOM нет.

**Переключение:** `#themeSelect` (опции из `content.themes`) → `themeCss.href='themes/'+id+'.css'`, запись в `localStorage('sunriseTheme')`, и `document.documentElement.dataset.theme=id`. При старте — применить сохранённую (дефолт — первая из `content.themes`). Свап `<link>` работает на file://.

## 7. Данные/текст
- `data/curriculum.js`: `window.SUNRISE.curriculum = { phases:[…], weeks:[…] }` — те же 13 недель / 91 день, форма JSON (без функций; rest-дни — обычные объекты).
- `data/content.js`: `window.SUNRISE.content = {`
  - `ui:` подписи (бренд-сабтайтл, «Разминка», «Рефлексия», кнопки экспорт/импорт, заголовки карточек/модалок, «Следующий день →», «дней подряд» и т.п.),
  - `tracks: { dsa:{label,kanji}, … }` (цвет — в CSS),
  - `badges: { <id>: {title, desc, icon} }` — текст всех 30 ачивок,
  - `mottos: […]` (фразы футера), `surprises: […]`,
  - `themes: [ {id,name}, … ]` (для селектора)
  `}`.
- Грузятся `<script src>` в `index.html`; механизм допускает динамическую подгрузку (инъекция `<script>`), если позже что-то выносим.

## 8. Изменения в `logic.js`
- **Вынос текста бейджей:** `BADGES = [{ id, predicate }]` (без title/desc/icon). `evaluateBadges(curriculum,state,today)` → `[{ id, unlocked, at }]`. `syncBadges` без изменений. Текст бейджей (`title/desc/icon`) живёт в `content.badges` и подмешивается в `app.js` при рендере. Остальное ядро без изменений.
- Тесты ядра остаются (проверяют unlocked по id и `BADGES.length===30`); ассертов на текст бейджей нет/убираем.

## 9. `app.js` — обязанности (поверхность)
`init()` (читает `SUNRISE`, грузит state, применяет тему, `renderAll`, вешает события) · `loadState/saveState` (через logic) · `renderAll` → `renderDaySelect/renderToday/renderDashboard/renderCalendar(on open)/renderTrophies/renderComeback/renderMotd` · `dayIndex/goToDay/syncDayNav` · `onDayCompleted` + `celebrate/showBadgeToast/showSurprise` (обобщённый DOM) · `applyTheme(id)` + `#themeSelect` · `_rotateMotd` · экспорт/импорт · хелперы `esc/todayStr/dowName/trackMeta(content)`. Текст — только из `content`; цвет трека — только из CSS (через `data-track`).

## 10. Поток данных / порядок загрузки
`index.html` грузит `data/curriculum.js`, `data/content.js`, `logic.js`, `app.js` (в этом порядке). `app.js.init()`: `SUNRISE.*` → state (localStorage/`parseImported`) → применить тему (`<link>`) → `renderAll`. Действия → мутация через `logic` → `saveState` → ре-рендер. Смена темы → свап href + запись. Завершение дня → эффекты + `syncBadges`.

## 11. Тестирование
- `test/logic.test.js` — текущие 37 (правка под §8).
- **`test/app.test.js` — постоянный контракт-тест** (vm + fake-DOM, как мы гоняли вручную): грузит `index.html` + data + logic + app, проверяет: рендер дашборда/дня/селекта; навигацию prev/next; открытие календаря (рисует `cday`) и трофеев (30 плиток с `data-tip`); завершение дня → бейдж в state + тосты не падают; смену темы (`themeCss.href` меняется, `localStorage` пишется); ротацию motd не падает. Регрессия теперь ловится автоматически, без ручных verify-скриптов.

## 12. Миграция / совместимость
- Поведение и хранилище — без потерь (state v2, `progress.json`, `localStorage` ключи).
- Удалить старые `theme-*.html` и галерею после переноса.
- Темы переписываются как CSS-only по §5/§6 (упрощённые, без bespoke-DOM), сохраняя узнаваемость каждой.

## 13. Обработка ошибок
- Битый/нет `localStorage` → свежее состояние. Нет/битая тема → дефолтная. Нет `SUNRISE.*` → понятное сообщение в консоль, страница не белая (рендер заглушки). Импорт битого JSON → алерт, текущее не затирается.

## 14. Вне scope
Серверный режим/настоящие `.json`+fetch; фреймворк/бандлер; новые фичи (только перенос существующих). Новые темы — после рефактора (теперь это 1 CSS-файл).

## 15. Фазы реализации (для плана)
1. Скелет `index.html` + зафиксировать каноничные хуки (§5).
2. `app.js` — собрать единый контроллер из текущих тем; эффекты обобщить.
3. `data/curriculum.js` + `data/content.js` (вынести весь текст; decouple бейдж-текста из `logic.js`).
4. Тема **bonus** как первая CSS-only (эталон) по §6; затем neon, japanese, emerald, dashboard.
5. Селектор тем + персист.
6. Тесты: `logic.test.js` (правка) + `app.test.js` (контракт).
7. Верификация паритета поведения; удалить старые `theme-*.html`/галерею.
