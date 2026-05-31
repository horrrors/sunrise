# Sunrise — Dopamine / Habit Features — Design & API Contract

**Дата:** 2026-05-31 · **Статус:** утверждён к реализации

## Цель
Добавить «полезный дофамин» для привычки: цепочка-календарь, серия (строгая, без заморозки), мягкое возвращение, праздник завершения дня, бейджи-вехи (мини-виджет), сюрприз-награда. Логика — общая и тестируемая (`logic.js`); визуал — в каждой из 5 тем.

## Решения (утверждены)
- **Строгое завершение:** день засчитан только когда ВСЕ его задачи отмечены.
- **Серия без заморозки:** пропуск рвёт серию; якорь «сегодня/вчера» (один пропущенный день не обнуляет мгновенно). Срыв смягчает «возвращение».
- **Полка трофеев** — компактный мини-виджет в дашборде.
- Сова/Жаворонок требуют часа завершения → храним `completedHour`.
- Дни отдыха не считаются пропуском (серия держится на «сегодня/вчера»-якоре).
- Сюрприз — рандом в UI-слое (~12%), чтобы логика осталась чистой.
- Все 5 тем. Старые `progress.json` (v1) открываются (миграция в v2).

---

## Данные — State v2
```js
// State = {
//   version: 2,
//   days: { [dayId]: { tasks:{[taskId]:true}, reflection:string,
//                      completedAt: "YYYY-MM-DD"|null,   // дата ПОЛНОГО завершения дня
//                      completedHour: 0..23|null } },    // час полного завершения
//   reviews: [{ itemId, lastDate, stage }],              // без изменений
//   badges: { [badgeId]: { at:"YYYY-MM-DD" } },          // разблокированные вехи
//   lastSurprise: { text:string, at:"YYYY-MM-DD" } | null
// }
```
`completedAt`/`completedHour` ставятся в момент, когда день становится полностью завершён (если ещё не стоят); снимаются (→null), если день «раз-закрыли».

## logic.js — API (новое/изменённое)
- `createInitialState()` → `{version:2, days:{}, reviews:[], badges:{}, lastSurprise:null}`.
- **`setTaskDone(curriculum, state, dayId, taskId, done, today, hour)`** — НОВАЯ сигнатура (добавлены `curriculum` и `hour`). Тогглит задачу; затем пересчитывает завершение: если день стал полностью закрыт и `completedAt` пуст → `completedAt=today, completedHour=hour`; если не закрыт → оба `null`. Иммутабельно.
- `isDayComplete(curriculum, state, dayId)` — без изменений (все задачи отмечены).
- `computeStreak(state, today)` — без изменений по коду, но теперь `completedAt` = только полные завершения → серия «строгая». Якорь сегодня/вчера.
- **`longestStreak(state)`** — НОВОЕ: длиннейшая серия подряд идущих дат `completedAt` за всё время (для бейджей 7/30/100).
- **`countCompletedTasks(curriculum, state, track)`** — НОВОЕ: число отмеченных задач на днях указанного трека (для Algorithmist по `dsa`).
- **`phasePct(curriculum, state, phase)`** — есть через `progressByPhase`; используем `pct===100` для Phase Cleared.
- **`BADGES`** — НОВОЕ: массив определений `{id, title, desc, icon, predicate(curriculum,state,today)->bool}`.
- **`evaluateBadges(curriculum, state, today)`** — НОВОЕ: `[{id,title,desc,icon,unlocked,at|null}]` (unlocked = из `state.badges` ИЛИ предикат сейчас true; at — из `state.badges`).
- **`syncBadges(curriculum, state, today)`** — НОВОЕ: `{state, unlocked:[ids]}` — для каждого бейджа с истинным предикатом, которого ещё нет в `state.badges`, добавляет `{at:today}`; возвращает новый state и список только что открытых (для тоста/празднования).
- **`SURPRISES`** — НОВОЕ: массив строк-плашек/цитат (данные; рандом — в UI).
- `parseImported(json)` — принимает `version` 1 ИЛИ 2. Нормализует в v2: `badges` → `{}` если нет, `lastSurprise` → null, `reviews`→[] если нет, `days` как есть (поля дней best-effort).
- Без изменений: `addDays, diffDays, phaseOfWeek, allDays, getDay, setReflection, progressByTrack, progressByPhase, overallProgress, scheduleReview, getDueReviews, completeReview, serializeState`.

## Бейджи (предикаты, чисто из state+curriculum)
| id | Название | Условие |
|---|---|---|
| `first-light` | First Light | ≥1 завершённый день |
| `streak-7` / `streak-30` / `streak-100` | 7 / 30 / 100 | `longestStreak ≥ 7/30/100` |
| `phase-1` / `phase-2` / `phase-3` | Фаза I/II/III | `progressByPhase[n].pct===100` |
| `algorithmist` | Algorithmist | `countCompletedTasks(dsa) ≥ 50` |
| `comeback` | Comeback | в отсортированных датах завершения есть разрыв ≥2 кал. дней И есть завершения после него |
| `night-owl` | Night Owl | у любого завершённого дня `completedHour>=22 || <5` |
| `early-lark` | Early Lark | у любого завершённого дня `completedHour<8` |
| `capstone` | Capstone | день `w13d6` завершён |

## UI-контракт (для Workflow-фазы; во всех 5 темах, оформление под тему)
Новые элементы и поведение (аддитивно, ничего существующего не ломаем):
- **Цепочка-календарь** — карточка-сетка с `id="chainCal"` (91 клетка, 13×7). Класс клетки: завершён / сегодня / отдых / впереди. Рендер `renderChain()`, вызывается из `renderAll()`.
- **Виджет «Трофеи»** `id="trophies"` — компактная карточка: «N/M», 3 последних/ближайших бейджа (иконки). Рендер `renderTrophies()` из `renderAll()`.
- **Серия/цепочка используют новый строгий смысл** (см. логику).
- **Завершение дня:** в обработчике чекбокса — `wasComplete=isDayComplete(...)` до, после `setTaskDone(C,state,id,t,checked,today,hour)` → `nowComplete`. Если `!was && now`: `celebrate()` (конфетти/burst, тема-специфично) + ~12% `maybeSurprise()` (показать `#surprise` тост из `L.SURPRISES`, записать `state.lastSurprise`) + `{state, unlocked}=L.syncBadges(...)`; если `unlocked.length` → бейдж-тост. Час: `new Date().getHours()`.
- **Comeback-баннер** `id="comeback"` на карточке дня: показать, если `L.evaluateBadges` отметил `comeback` или сегодня серия восстановлена после разрыва — мягкий текст «С возвращением — пройдено N дней».
- **Сюрприз-тост** `id="surprise"`, **бейдж-тост** — короткие, авто-скрытие; тема-специфичны.
- Сохранить ВСЕ прежние id и проводку (dashboard, todayCard, daySelect, phaseLabel, exportBtn, importBtn, importFile, taskList, cb_*, reflect, markReview, prevDay, nextDay, nextDayCta) и `esc()`.

## План реализации
1. **Логика (инлайн, TDD):** state v2 + миграция, новый `setTaskDone`, `longestStreak`, `countCompletedTasks`, `BADGES/evaluateBadges/syncBadges`, `SURPRISES`. Обновить затронутые тесты (строгая серия). Зелёный `node --test`.
2. **UI (Workflow, 5 агентов):** каждый добавляет chainCal, trophies, celebrate/surprise/badge-тосты, comeback-баннер, обновляет вызов `setTaskDone` и обработчик завершения — по этому контракту, оформление под тему.
3. **Верификация:** расширенный браузерный контракт по каждой теме (новые id присутствуют, завершение дня не падает, бейджи синкаются) + `node --test`. Коммит.
