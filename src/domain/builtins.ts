import type { BadgeRule } from './types/badge-rule.ts';
import type { Theme, Localized } from './types/entities.ts';

// Languages the switcher offers. EN is the primary/fallback language (see i18n.ts).
export const SUPPORTED_LANGS: readonly { id: string; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'ru', label: 'RU' },
];

// Bilingual UI defaults (ported from data/app-defaults.js `ui`). Each value is a
// Localized map resolved by Tracker via tr(). Array-valued keys (streakWords) are
// a separate export so this stays Record<string, Localized>.
export const DEFAULT_UI: Record<string, Localized> = {
  summaryTitle: { en: 'Summary', ru: 'Сводка' },
  todayTitle: { en: 'Today', ru: 'Сегодня' },
  warmup: { en: 'Warm-up', ru: 'Разминка' },
  reflect: { en: 'Reflection', ru: 'Рефлексия' },
  export: { en: 'Export', ru: 'Экспорт' },
  import: { en: 'Import', ru: 'Импорт' },
  cardMap: { en: 'Progress map', ru: 'Карта прогресса' },
  trophies: { en: 'Trophies', ru: 'Трофеи' },
  nextDay: { en: 'Next day →', ru: 'Следующий день →' },
  restTitle: { en: 'Rest day', ru: 'Разгрузка' },
  overallTitle: { en: 'Overall progress', ru: 'Общий прогресс' },
  streakTitle: { en: 'Streak', ru: 'Серия' },
  phasesTitle: { en: 'Phases', ru: 'Фазы' },
  tracksTitle: { en: 'Tracks', ru: 'Треки' },
  daysOf: { en: 'days done of {n}', ru: 'пройдено дней из {n}' },
  newTrophy: { en: '🏆 New trophy!', ru: '🏆 Новый трофей!' },
  comeback: {
    en: 'Welcome back — {n} days done in total. Let’s keep going.',
    ru: 'С возвращением — всего пройдено {n} дней. Продолжаем.',
  },
  importOk: { en: 'Progress imported.', ru: 'Прогресс импортирован.' },
  importFail: {
    en: 'Import failed: {e}\nCurrent progress unchanged.',
    ru: 'Импорт не удался: {e}\nТекущий прогресс не изменён.',
  },
  weekAbbr: { en: 'Wk', ru: 'Нед' },
  inARow: { en: 'in a row', ru: 'подряд' },
  phaseWord: { en: 'Phase', ru: 'Фаза' },
  phaseLabel: { en: '', ru: '' },
  todayVert: { en: 'TODAY', ru: 'TODAY' },
  restVert: { en: 'REST', ru: 'REST' },
  taskPlaceholder: { en: 'Short note...', ru: 'Короткая заметка...' },
  prevDayAria: { en: 'Previous day', ru: 'Предыдущий день' },
  nextDayAria: { en: 'Next day', ru: 'Следующий день' },
  theme: { en: 'Theme', ru: 'Тема' },
  pack: { en: 'Program', ru: 'Программа' },
  menu: { en: 'Menu', ru: 'Меню' },
  language: { en: 'Language', ru: 'Язык' },
  hint: { en: 'What counts as a strong answer', ru: 'Что считается сильным ответом' },
  copy: { en: 'Copy', ru: 'Копировать' },
  copyAi: { en: 'Copy with AI prompt', ru: 'Скопировать с промптом для ИИ' },
  copied: { en: 'Copied', ru: 'Скопировано' },
  copiedAi: {
    en: 'AI prompt copied — paste it into an AI chat',
    ru: 'Промпт для ИИ скопирован — вставь его в чат с ИИ',
  },
  // {guidance} is replaced with a filled aiPromptGuidance line (or '') by Tracker.aiPrompt
  aiPrompt: {
    en: 'I’m working through a study program and I’m currently on the topic “{title}” (track: {track}). Break down this task like an experienced mentor:\n\n{text}\n{guidance}\nFirst explain the idea and intuition in plain words, then give a full breakdown: for a problem — name the pattern, the approach, and the time/space complexity, and only after that the code; for theory — a structured explanation with examples. Answer in English.',
    ru: 'Я прохожу учебную программу и сейчас на теме «{title}» (трек: {track}). Разбери это задание как опытный наставник:\n\n{text}\n{guidance}\nСначала объясни идею и интуицию простыми словами, затем дай развёрнутый разбор: для задачи — назови паттерн, подход и сложность по времени и памяти, и только после этого код; для теории — структурированное объяснение с примерами. Отвечай на русском.',
  },
  aiPromptGuidance: {
    en: 'Criterion for a strong answer: {guidance}',
    ru: 'Критерий сильного ответа: {guidance}',
  },
  shortcuts: { en: 'Keyboard shortcuts', ru: 'Горячие клавиши' },
  scDay: { en: 'Previous / next day', ru: 'Предыдущий / следующий день' },
  scTick: { en: 'Move between tasks', ru: 'Переход между задачами' },
  scMark: { en: 'Toggle a task', ru: 'Отметить задачу' },
  scMap: { en: 'Progress map', ru: 'Карта прогресса' },
  scTrophies: { en: 'Trophies', ru: 'Трофеи' },
  scHelp: { en: 'This help', ru: 'Эта подсказка' },
  scClose: { en: 'Close dialog', ru: 'Закрыть окно' },
};

// Plural forms per language; indexed by pluralIndex(lang, n). See src/domain/plural.ts.
export const DEFAULT_STREAK_WORDS: Record<string, readonly string[]> = {
  en: ['day', 'days'],
  ru: ['день', 'дня', 'дней'],
};

export const DEFAULT_MOTTOS: readonly Localized[] = [
  { en: '一歩一歩 · step by step', ru: '一歩一歩 · шаг за шагом' },
];

// GENERIC, pack-agnostic badge rules (a pack may override by reusing the same id).
export const GENERIC_BADGES: readonly BadgeRule[] = [
  {
    id: 'first-light',
    type: 'days-done',
    gte: 1,
    title: { en: 'First Light', ru: 'First Light' },
    desc: { en: 'First fully completed day', ru: 'Первый полностью закрытый день' },
    icon: '🌅',
  },
  {
    id: 'streak-3',
    type: 'streak',
    gte: 3,
    title: { en: 'Warm-up', ru: 'Разогрев' },
    desc: { en: '3-day streak', ru: 'Серия 3 дня подряд' },
    icon: '🌱',
  },
  {
    id: 'streak-7',
    type: 'streak',
    gte: 7,
    title: { en: '7 Days', ru: '7 дней' },
    desc: { en: '7-day streak', ru: 'Серия 7 дней подряд' },
    icon: '🔥',
  },
  {
    id: 'streak-14',
    type: 'streak',
    gte: 14,
    title: { en: '14 Days', ru: '14 дней' },
    desc: { en: '14-day streak', ru: 'Серия 14 дней подряд' },
    icon: '🌋',
  },
  {
    id: 'streak-30',
    type: 'streak',
    gte: 30,
    title: { en: '30 Days', ru: '30 дней' },
    desc: { en: '30-day streak', ru: 'Серия 30 дней подряд' },
    icon: '⚡',
  },
  {
    id: 'streak-100',
    type: 'streak',
    gte: 100,
    title: { en: '100 Days', ru: '100 дней' },
    desc: { en: '100-day streak', ru: 'Серия 100 дней подряд' },
    icon: '💯',
  },
  {
    id: 'days-10',
    type: 'days-done',
    gte: 10,
    title: { en: '10 Days', ru: '10 дней' },
    desc: { en: '10 days of the program done', ru: '10 дней программы пройдено' },
    icon: '📅',
  },
  {
    id: 'days-25',
    type: 'days-done',
    gte: 25,
    title: { en: '25 Days', ru: '25 дней' },
    desc: { en: '25 days of the program done', ru: '25 дней программы пройдено' },
    icon: '🗓️',
  },
  {
    id: 'days-50',
    type: 'days-done',
    gte: 50,
    title: { en: '50 Days', ru: '50 дней' },
    desc: { en: '50 days of the program done', ru: '50 дней программы пройдено' },
    icon: '📆',
  },
  {
    id: 'halfway',
    type: 'percent',
    gte: 50,
    title: { en: 'Halfway', ru: 'Экватор' },
    desc: { en: 'Half of the program done', ru: 'Пройдена половина программы' },
    icon: '🌗',
  },
  {
    id: 'finisher',
    type: 'all-done',
    title: { en: 'Finisher', ru: 'Финишер' },
    desc: { en: 'Every day of the program done', ru: 'Пройдены все дни программы' },
    icon: '🎓',
  },
  {
    id: 'tasks-100',
    type: 'tasks-done',
    gte: 100,
    title: { en: '100 Tasks', ru: '100 задач' },
    desc: { en: '100 tasks completed', ru: '100 задач выполнено' },
    icon: '✅',
  },
  {
    id: 'scribe-10',
    type: 'reflections',
    gte: 10,
    title: { en: 'Scribe', ru: 'Летописец' },
    desc: { en: '10 reflections written', ru: '10 рефлексий написано' },
    icon: '✍️',
  },
  {
    id: 'scribe-30',
    type: 'reflections',
    gte: 30,
    title: { en: 'Chronicler', ru: 'Хронист' },
    desc: { en: '30 reflections written', ru: '30 рефлексий написано' },
    icon: '📜',
  },
  {
    id: 'perfect-week',
    type: 'groups-complete',
    gte: 1,
    title: { en: 'Perfect Week', ru: 'Идеальная неделя' },
    desc: { en: 'A full week completed', ru: 'Неделя пройдена целиком' },
    icon: '🌟',
  },
  {
    id: 'weeks-4',
    type: 'groups-complete',
    gte: 4,
    title: { en: 'A Month In', ru: 'Месяц в деле' },
    desc: { en: '4 full weeks completed', ru: '4 недели пройдены целиком' },
    icon: '📈',
  },
  {
    id: 'comeback',
    type: 'comeback',
    title: { en: 'Comeback', ru: 'Comeback' },
    desc: { en: 'Came back after a break', ru: 'Вернулся после пропуска' },
    icon: '🩹',
  },
  {
    id: 'night-owl',
    type: 'hour-range',
    from: 22,
    to: 5,
    title: { en: 'Night Owl', ru: 'Night Owl' },
    desc: {
      en: 'Closed a day after 22:00 or before 5:00',
      ru: 'Закрыл день после 22:00 или до 5:00',
    },
    icon: '🦉',
  },
  {
    id: 'early-lark',
    type: 'hour-range',
    from: 5,
    to: 8,
    title: { en: 'Early Lark', ru: 'Early Lark' },
    desc: { en: 'Closed a day before 8:00 AM', ru: 'Закрыл день до 8:00 утра' },
    icon: '🐦',
  },
  {
    id: 'weekend',
    type: 'weekday',
    days: [6, 7],
    title: { en: 'Weekend Warrior', ru: 'Воин выходного' },
    desc: {
      en: 'Closed a day on Saturday or Sunday',
      ru: 'Закрыл день в субботу или воскресенье',
    },
    icon: '🌴',
  },
];

export const BUILTIN_THEMES: readonly Theme[] = [
  {
    schema: 'sunrise.theme/v1',
    id: 'bonus',
    name: 'Neo-Brutalist Riso',
    version: '1.0.0',
    cssHref: 'themes/bonus.css',
  },
  {
    schema: 'sunrise.theme/v1',
    id: 'neon',
    name: 'Neon · Acid',
    version: '1.0.0',
    cssHref: 'themes/neon.css',
  },
  {
    schema: 'sunrise.theme/v1',
    id: 'japanese',
    name: 'Japanese · 和',
    version: '1.0.0',
    cssHref: 'themes/japanese.css',
  },
  {
    schema: 'sunrise.theme/v1',
    id: 'emerald',
    name: 'Emerald · Marble',
    version: '1.0.0',
    cssHref: 'themes/emerald.css',
  },
  {
    schema: 'sunrise.theme/v1',
    id: 'dashboard',
    name: 'Colorful Dashboard',
    version: '1.0.0',
    cssHref: 'themes/dashboard.css',
  },
];
