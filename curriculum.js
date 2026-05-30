'use strict';

const phases = [
  { id: 1, title: 'Фундамент', weeks: [1, 2, 3, 4] },
  { id: 2, title: 'Глубина', weeks: [5, 6, 7, 8, 9] },
  { id: 3, title: 'Синтез и мастерство', weeks: [10, 11, 12, 13] },
];

const REST = (num) => ({
  id: `w${num}d7`, week: num, dow: 7, track: 'rest', title: 'Разгрузка / повторы',
  warmup: null, tasks: [], reflectPrompt: 'Что закрепить из недели? Прогон due-повторов.', resources: [],
});

const weeks = [
  {
    num: 1, phase: 1, theme: 'Сложность, базовые структуры, модель исполнения JS, рантайм Node',
    days: [
      { id: 'w1d1', week: 1, dow: 1, track: 'dsa', title: 'Сложность + массивы + хеш-таблицы',
        warmup: 'Оцени O() для 3 коротких сниппетов (вложенные циклы, hashmap-lookup, бинпоиск).',
        tasks: [
          { id: 't1', text: 'Теория: Big-O, амортизация, как растут O(1)/O(log n)/O(n)/O(n log n)/O(n^2). Записать «числа интуиции».' },
          { id: 't2', text: 'Решить 2 задачи на хеш-таблицы: Two Sum, Contains Duplicate. Проговорить вслух сложность.' },
          { id: 't3', text: 'Конспект: когда массив, когда set/map; стоимость операций каждой структуры.' },
        ],
        reflectPrompt: 'Где сегодня ошибся в оценке сложности и почему?',
        resources: [ { label: 'Big-O', note: 'bigocheatsheet.com — таблица сложностей' }, { label: 'MDN', note: 'Map vs Object, Set' } ] },
      { id: 'w1d2', week: 1, dow: 2, track: 'js', title: 'Модель исполнения: контексты, scope chain, замыкания',
        warmup: 'Two Sum повторить по памяти за 10 мин.',
        tasks: [
          { id: 't1', text: 'Теория: execution context, scope chain, hoisting, TDZ. Нарисовать стек контекстов для примера.' },
          { id: 't2', text: 'Практика: реализовать счётчик и memoize через замыкание; объяснить, что захватывается.' },
          { id: 't3', text: 'Написать 5 предложений «как я объясню замыкание на ревью джуну».' },
        ],
        reflectPrompt: 'Что в hoisting/TDZ оказалось не так, как я думал?',
        resources: [ { label: 'MDN', note: 'Closures; Scope; Hoisting' }, { label: 'Книга', note: "You Don't Know JS: Scope & Closures" } ] },
      { id: 'w1d3', week: 1, dow: 3, track: 'sysdesign', title: 'Введение в System Design: язык и метрики',
        warmup: 'Contains Duplicate повторить за 8 мин.',
        tasks: [
          { id: 't1', text: 'Теория: latency vs throughput, p50/p95/p99, числа латентности (RAM/SSD/сеть/датацентр).' },
          { id: 't2', text: 'Упражнение «на салфетке»: оценить QPS и хранилище для сервиса на 1M DAU.' },
          { id: 't3', text: 'Конспект: 4 шага разбора задачи (требования → оценки → high-level → узкие места).' },
        ],
        reflectPrompt: 'Какую оценку я бы не смог обосновать прямо сейчас?',
        resources: [ { label: 'Numbers', note: 'Latency numbers every programmer should know' } ] },
      { id: 'w1d4', week: 1, dow: 4, track: 'node', title: 'Рантайм Node: V8 + libuv + bindings',
        warmup: 'Оценить O() для двух решений Two Sum (brute vs hashmap).',
        tasks: [
          { id: 't1', text: 'Теория: из чего состоит Node (V8, libuv, C++ bindings, core JS). Что делает libuv.' },
          { id: 't2', text: 'Практика: запустить скрипт с sync vs async fs, объяснить, что блокирует event loop.' },
          { id: 't3', text: 'Конспект: чем Node-процесс отличается от «просто JS в браузере».' },
        ],
        reflectPrompt: 'Что именно делает libuv, чего не делает V8?',
        resources: [ { label: 'Node docs', note: 'The Node.js Event Loop (guide)' }, { label: 'libuv', note: 'docs.libuv.org — Design overview' } ] },
      { id: 'w1d5', week: 1, dow: 5, track: 'cs', title: 'Сети (база): TCP/IP, TCP-handshake, HTTP/1.1',
        warmup: 'Решить Valid Anagram (хеш-таблица).',
        tasks: [
          { id: 't1', text: 'Теория: стек TCP/IP, 3-way handshake, что такое порт/сокет, HTTP/1.1 поверх TCP.' },
          { id: 't2', text: 'Практика: `curl -v` к любому сайту — разобрать вывод (DNS→TCP→TLS→HTTP).' },
          { id: 't3', text: 'Конспект: почему keep-alive важен; head-of-line blocking в HTTP/1.1.' },
        ],
        reflectPrompt: 'Что происходит «по проводу» от ввода URL до первого байта ответа?',
        resources: [ { label: 'MDN', note: 'Overview of HTTP; Evolution of HTTP' } ] },
      { id: 'w1d6', week: 1, dow: 6, track: 'patterns', title: 'SOLID на TS + еженедельная рефлексия лидерства',
        warmup: 'Повторить любую задачу недели по памяти.',
        tasks: [
          { id: 't1', text: 'Теория: 5 принципов SOLID, по одному идиоматичному TS-примеру нарушения/исправления.' },
          { id: 't2', text: 'Практика: взять кусок своего кода из Atlas, найти нарушение SRP/DIP, отрефакторить в блокноте.' },
          { id: 't3', text: 'Behavioral-рефлексия: вспомнить случай, где ты влиял на решение без формальной власти. Записать Ситуация→Действие→Результат.' },
        ],
        reflectPrompt: 'Какой принцип SOLID я чаще всего нарушаю в реальном коде?',
        resources: [ { label: 'Refactoring', note: 'refactoring.guru — SOLID' }, { label: 'Staff', note: 'StaffEng.com — архетипы' } ] },
      REST(1),
    ],
  },
  // weeks 2..13 authored in Tasks 9-11
];

const Curriculum = { phases, weeks };

if (typeof module !== 'undefined' && module.exports) module.exports = Curriculum;
if (typeof window !== 'undefined') window.Curriculum = Curriculum;
