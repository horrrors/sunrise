'use strict';

// Generated curriculum data. Edit days/tasks here freely.
const Curriculum = {
  "phases": [
    {
      "id": 1,
      "title": "Фундамент",
      "weeks": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "id": 2,
      "title": "Глубина",
      "weeks": [
        5,
        6,
        7,
        8,
        9
      ]
    },
    {
      "id": 3,
      "title": "Синтез и мастерство",
      "weeks": [
        10,
        11,
        12,
        13
      ]
    }
  ],
  "weeks": [
    {
      "num": 1,
      "phase": 1,
      "theme": "Сложность, базовые структуры, модель исполнения JS, рантайм Node",
      "days": [
        {
          "id": "w1d1",
          "week": 1,
          "dow": 1,
          "track": "dsa",
          "title": "Сложность + массивы + хеш-таблицы",
          "warmup": "Оцени O() для 3 коротких сниппетов (вложенные циклы, hashmap-lookup, бинпоиск).",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: Big-O, амортизация, как растут O(1)/O(log n)/O(n)/O(n log n)/O(n^2). Записать «числа интуиции»."
            },
            {
              "id": "t2",
              "text": "Решить 2 задачи на хеш-таблицы: Two Sum, Contains Duplicate. Проговорить вслух сложность."
            },
            {
              "id": "t3",
              "text": "Конспект: когда массив, когда set/map; стоимость операций каждой структуры."
            }
          ],
          "reflectPrompt": "Где сегодня ошибся в оценке сложности и почему?",
          "resources": [
            {
              "label": "Big-O",
              "note": "bigocheatsheet.com — таблица сложностей"
            },
            {
              "label": "MDN",
              "note": "Map vs Object, Set"
            }
          ]
        },
        {
          "id": "w1d2",
          "week": 1,
          "dow": 2,
          "track": "js",
          "title": "Модель исполнения: контексты, scope chain, замыкания",
          "warmup": "Two Sum повторить по памяти за 10 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: execution context, scope chain, hoisting, TDZ. Нарисовать стек контекстов для примера."
            },
            {
              "id": "t2",
              "text": "Практика: реализовать счётчик и memoize через замыкание; объяснить, что захватывается."
            },
            {
              "id": "t3",
              "text": "Написать 5 предложений «как я объясню замыкание на ревью джуну»."
            }
          ],
          "reflectPrompt": "Что в hoisting/TDZ оказалось не так, как я думал?",
          "resources": [
            {
              "label": "MDN",
              "note": "Closures; Scope; Hoisting"
            },
            {
              "label": "Книга",
              "note": "You Don't Know JS: Scope & Closures"
            }
          ]
        },
        {
          "id": "w1d3",
          "week": 1,
          "dow": 3,
          "track": "sysdesign",
          "title": "Введение в System Design: язык и метрики",
          "warmup": "Contains Duplicate повторить за 8 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: latency vs throughput, p50/p95/p99, числа латентности (RAM/SSD/сеть/датацентр)."
            },
            {
              "id": "t2",
              "text": "Упражнение «на салфетке»: оценить QPS и хранилище для сервиса на 1M DAU."
            },
            {
              "id": "t3",
              "text": "Конспект: 4 шага разбора задачи (требования → оценки → high-level → узкие места)."
            }
          ],
          "reflectPrompt": "Какую оценку я бы не смог обосновать прямо сейчас?",
          "resources": [
            {
              "label": "Numbers",
              "note": "Latency numbers every programmer should know"
            }
          ]
        },
        {
          "id": "w1d4",
          "week": 1,
          "dow": 4,
          "track": "node",
          "title": "Рантайм Node: V8 + libuv + bindings",
          "warmup": "Оценить O() для двух решений Two Sum (brute vs hashmap).",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: из чего состоит Node (V8, libuv, C++ bindings, core JS). Что делает libuv."
            },
            {
              "id": "t2",
              "text": "Практика: запустить скрипт с sync vs async fs, объяснить, что блокирует event loop."
            },
            {
              "id": "t3",
              "text": "Конспект: чем Node-процесс отличается от «просто JS в браузере»."
            }
          ],
          "reflectPrompt": "Что именно делает libuv, чего не делает V8?",
          "resources": [
            {
              "label": "Node docs",
              "note": "The Node.js Event Loop (guide)"
            },
            {
              "label": "libuv",
              "note": "docs.libuv.org — Design overview"
            }
          ]
        },
        {
          "id": "w1d5",
          "week": 1,
          "dow": 5,
          "track": "cs",
          "title": "Сети (база): TCP/IP, TCP-handshake, HTTP/1.1",
          "warmup": "Решить Valid Anagram (хеш-таблица).",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: стек TCP/IP, 3-way handshake, что такое порт/сокет, HTTP/1.1 поверх TCP."
            },
            {
              "id": "t2",
              "text": "Практика: `curl -v` к любому сайту — разобрать вывод (DNS→TCP→TLS→HTTP)."
            },
            {
              "id": "t3",
              "text": "Конспект: почему keep-alive важен; head-of-line blocking в HTTP/1.1."
            }
          ],
          "reflectPrompt": "Что происходит «по проводу» от ввода URL до первого байта ответа?",
          "resources": [
            {
              "label": "MDN",
              "note": "Overview of HTTP; Evolution of HTTP"
            }
          ]
        },
        {
          "id": "w1d6",
          "week": 1,
          "dow": 6,
          "track": "patterns",
          "title": "SOLID на TS + еженедельная рефлексия лидерства",
          "warmup": "Повторить любую задачу недели по памяти.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: 5 принципов SOLID, по одному идиоматичному TS-примеру нарушения/исправления."
            },
            {
              "id": "t2",
              "text": "Практика: взять кусок своего кода из Atlas, найти нарушение SRP/DIP, отрефакторить в блокноте."
            },
            {
              "id": "t3",
              "text": "Behavioral-рефлексия: вспомнить случай, где ты влиял на решение без формальной власти. Записать Ситуация→Действие→Результат."
            }
          ],
          "reflectPrompt": "Какой принцип SOLID я чаще всего нарушаю в реальном коде?",
          "resources": [
            {
              "label": "Refactoring",
              "note": "refactoring.guru — SOLID"
            },
            {
              "label": "Staff",
              "note": "StaffEng.com — архетипы"
            }
          ]
        },
        {
          "id": "w1d7",
          "week": 1,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 2,
      "phase": 1,
      "theme": "JS-прототипы, фазы event loop в Node, основы ОС, порождающие паттерны",
      "days": [
        {
          "id": "w2d1",
          "week": 2,
          "dow": 1,
          "track": "dsa",
          "title": "Два указателя + скользящее окно",
          "warmup": "Реши Valid Palindrome двумя указателями за 10 мин, проговори инвариант движения указателей.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: два указателя (встречное движение / быстрый-медленный) и скользящее окно (фиксированное vs переменное). Записать триггеры «когда какой паттерн»."
            },
            {
              "id": "t2",
              "text": "Решить 3 задачи: Two Sum II (sorted), Longest Substring Without Repeating Characters, Minimum Size Subarray Sum. Проговорить инвариант окна вслух."
            },
            {
              "id": "t3",
              "text": "Конспект: как окно расширяется/сужается и почему амортизированная сложность O(n), а не O(n^2)."
            }
          ],
          "reflectPrompt": "По какому признаку в задаче я узнаю «это скользящее окно», а не вложенный перебор?",
          "resources": [
            {
              "label": "NeetCode",
              "note": "Two Pointers; Sliding Window — список паттернов"
            },
            {
              "label": "MDN",
              "note": "String/Array методы: charCodeAt, индексация"
            }
          ]
        },
        {
          "id": "w2d2",
          "week": 2,
          "dow": 2,
          "track": "js",
          "title": "Прототипы: цепочка, this и семантика new",
          "warmup": "Реши Squares of a Sorted Array двумя указателями за 10 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: [[Prototype]], __proto__ vs prototype, как идёт поиск по цепочке, Object.create, class как сахар над прототипами. Нарисовать цепочку для экземпляра class."
            },
            {
              "id": "t2",
              "text": "Практика: реализовать new вручную (функция myNew), привязку через call/apply/bind; разобрать 4 правила определения this (default/implicit/explicit/new)."
            },
            {
              "id": "t3",
              "text": "Конспект: 5 предложений «как я объясню на ревью, почему метод-стрелка в классе ломает/чинит this и когда это уместно»."
            }
          ],
          "reflectPrompt": "В каком случае из моего кода потеря this уже приводила к багу и как прототип/привязка это объясняют?",
          "resources": [
            {
              "label": "MDN",
              "note": "Inheritance and the prototype chain; this; Function.prototype.bind"
            },
            {
              "label": "Книга",
              "note": "You Don't Know JS: this & Object Prototypes"
            }
          ]
        },
        {
          "id": "w2d3",
          "week": 2,
          "dow": 3,
          "track": "sysdesign",
          "title": "Балансировка нагрузки и горизонтальное масштабирование",
          "warmup": "Реши Container With Most Water двумя указателями за 10 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: L4 vs L7 балансировка, алгоритмы (round-robin, least-connections, consistent hashing), health-checks; stateless-сервисы и куда выносить состояние (sticky sessions vs внешний стор)."
            },
            {
              "id": "t2",
              "text": "Упражнение: спроектировать горизонтальное масштабирование stateful-обработчика очереди как в Atlas — где появляется состояние, как партиционировать нагрузку, как не сломать порядок событий."
            },
            {
              "id": "t3",
              "text": "Конспект: чек-лист «что мешает сервису масштабироваться горизонтально» (локальное состояние, локальные локи, неидемпотентность)."
            }
          ],
          "reflectPrompt": "Какой компонент в Atlas сейчас мешает добавить ещё один инстанс без побочных эффектов?",
          "resources": [
            {
              "label": "AWS docs",
              "note": "Elastic Load Balancing — типы балансировщиков"
            },
            {
              "label": "Книга",
              "note": "Designing Data-Intensive Applications, гл. 6 (Partitioning)"
            }
          ]
        },
        {
          "id": "w2d4",
          "week": 2,
          "dow": 4,
          "track": "node",
          "title": "Фазы event loop: timers/poll/check/close и микротаски",
          "warmup": "Реши Move Zeroes быстрым-медленным указателем за 8 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: порядок фаз libuv (timers → pending → poll → check → close), где исполняются setTimeout/setImmediate/I/O-колбэки; микротаски (process.nextTick, промисы) и когда дренируется очередь между фазами."
            },
            {
              "id": "t2",
              "text": "Практика: написать скрипт со смесью setTimeout(0), setImmediate, fs.readFile-колбэка, Promise.then и process.nextTick; предсказать порядок вывода, запустить, объяснить расхождения."
            },
            {
              "id": "t3",
              "text": "Конспект: как «отравление» nextTick/микротасками голодает фазы event loop и как это проявилось бы в задержке доставки outbox/timeline в Atlas."
            }
          ],
          "reflectPrompt": "Почему setImmediate и setTimeout(0) дают непредсказуемый порядок в main-модуле, но детерминированный внутри I/O-колбэка?",
          "resources": [
            {
              "label": "Node docs",
              "note": "The Node.js Event Loop, Timers, and process.nextTick()"
            },
            {
              "label": "Node docs",
              "note": "setImmediate() vs setTimeout()"
            }
          ]
        },
        {
          "id": "w2d5",
          "week": 2,
          "dow": 5,
          "track": "cs",
          "title": "ОС: процессы vs потоки, планировщик, контекстное переключение",
          "warmup": "Реши Remove Duplicates from Sorted Array двумя указателями за 8 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: адресное пространство процесса vs общая память потоков, состояния процесса, вытесняющий планировщик и кванты, стоимость context switch (регистры, TLB-флаши, кэш-промахи)."
            },
            {
              "id": "t2",
              "text": "Практика: запустить нагрузку и посмотреть переключения/потоки (top -H, vmstat или ps -M); связать с тем, что Node — один JS-поток + пул потоков libuv (UV_THREADPOOL_SIZE)."
            },
            {
              "id": "t3",
              "text": "Конспект: почему CPU-bound работа в Node блокирует event loop и какие у неё альтернативы (worker_threads, вынос в отдельный процесс/сервис)."
            }
          ],
          "reflectPrompt": "Где в Atlas CPU-bound операция могла бы незаметно съедать латентность всего инстанса и как это диагностировать?",
          "resources": [
            {
              "label": "Книга",
              "note": "Operating Systems: Three Easy Pieces — Processes; Scheduling"
            },
            {
              "label": "Node docs",
              "note": "Worker threads; libuv thread pool"
            }
          ]
        },
        {
          "id": "w2d6",
          "week": 2,
          "dow": 6,
          "track": "patterns",
          "title": "Порождающие GoF на идиоматичном TS: Factory/Builder/Singleton",
          "warmup": "Повтори по памяти любую задачу на скользящее окно за 10 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: Factory Method vs Abstract Factory, Builder для сложной конфигурации, Singleton и его проблемы (тестируемость, скрытые зависимости). По одному идиоматичному TS-примеру на каждый."
            },
            {
              "id": "t2",
              "text": "Практика: взять создание объекта из Atlas (например конфигурация обработчика события или клиента очереди), переписать через Builder/Factory; заменить Singleton на инъекцию зависимости через модуль/DI."
            },
            {
              "id": "t3",
              "text": "Конспект: когда Singleton оправдан, а когда это маскированный глобал; чем модульный синглтон в Node отличается от классического."
            }
          ],
          "reflectPrompt": "Какой из моих текущих «синглтонов» на самом деле скрытая глобальная зависимость, мешающая тестам?",
          "resources": [
            {
              "label": "Refactoring",
              "note": "refactoring.guru — Creational Patterns"
            },
            {
              "label": "Книга",
              "note": "Design Patterns (GoF) — Creational"
            }
          ]
        },
        {
          "id": "w2d7",
          "week": 2,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 3,
      "phase": 1,
      "theme": "Event loop глубоко, основы TypeScript, конкурентность, структурные паттерны",
      "days": [
        {
          "id": "w3d1",
          "week": 3,
          "dow": 1,
          "track": "dsa",
          "title": "Префиксные суммы + бинарный поиск (в т.ч. по ответу)",
          "warmup": "Рекап: посчитай вручную префиксный массив для [3,-1,4,2] и ответь на 2 range-sum запроса; на бумаге выпиши инвариант границ [lo, hi) для бинпоиска.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: префиксные суммы (1D и разностный массив для range-update), классический бинпоиск и шаблон «бинарный поиск по ответу» (предикат монотонен → ищем границу). Записать единый инвариант границ, чтобы не путать lo/hi/mid."
            },
            {
              "id": "t2",
              "text": "Решить 2 задачи на префиксы: Subarray Sum Equals K (через hashmap префиксов) и Range Sum Query Immutable. Проговорить вслух, почему hashmap превращает O(n^2) в O(n)."
            },
            {
              "id": "t3",
              "text": "Решить 1 задачу на бинпоиск по ответу: Koko Eating Bananas (или Minimum Speed to Arrive on Time). Явно выписать предикат feasible(x) и доказать его монотонность."
            },
            {
              "id": "t4",
              "text": "Конспект: чек-лист «когда префиксы, когда бинпоиск по ответу»; типичные баги границ (off-by-one, overflow при mid)."
            }
          ],
          "reflectPrompt": "Какой предикат feasible(x) ты сформулировал сегодня и был ли он на самом деле монотонным — или ты это просто предположил?",
          "resources": [
            {
              "label": "Sedgewick, Algorithms",
              "note": "Binary search и инварианты границ"
            },
            {
              "label": "LeetCode Explore",
              "note": "Binary Search: поиск по ответу (search space)"
            }
          ]
        },
        {
          "id": "w3d2",
          "week": 3,
          "dow": 2,
          "track": "js",
          "title": "Event loop глубоко: call stack, микро/макротаски, порядок",
          "warmup": "Алго-разминка: реши Valid Parentheses через стек — это прямая аналогия call stack, проговори LIFO-инвариант.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: фазы libuv (timers, pending, poll, check, close) + очереди микротасок (Promise/queueMicrotask) и process.nextTick. Записать правило: микротаски и nextTick осушаются полностью между макрозадачами."
            },
            {
              "id": "t2",
              "text": "Практика: предсказать на бумаге вывод сниппета с setTimeout(0) + Promise.then + process.nextTick + setImmediate, затем запустить в Node и сверить. Объяснить каждое расхождение."
            },
            {
              "id": "t3",
              "text": "Эксперимент: написать функцию, которая в цикле планирует микротаски и «голодает» макроочередь (starvation); затем переписать через setImmediate, чтобы вернуть управление loop. Зафиксировать разницу в поведении."
            },
            {
              "id": "t4",
              "text": "Конспект-привязка к Atlas: где в нашем обработчике outbox/timeline синхронный CPU-блок или цепочка промисов могла бы задержать таймеры/heartbeat — выписать 1-2 реальных места риска."
            }
          ],
          "reflectPrompt": "В каком месте предсказанный порядок вывода разошёлся с реальным и какую модель event loop это исправило у тебя в голове?",
          "resources": [
            {
              "label": "Node.js docs",
              "note": "The Node.js Event Loop, Timers, and process.nextTick()"
            },
            {
              "label": "MDN",
              "note": "Microtasks and the JavaScript runtime / Event loop"
            }
          ]
        },
        {
          "id": "w3d3",
          "week": 3,
          "dow": 3,
          "track": "sysdesign",
          "title": "SQL vs NoSQL, базовая индексация и моделирование данных",
          "warmup": "Алго-разминка: реши Two Sum через hashmap и проговори, что индекс в БД — это та же идея «structure for fast lookup», только на диске (B-tree/hash).",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: когда реляционная модель vs документная/KV (консистентность, схема, паттерны доступа, джойны vs денормализация). Записать решающее правило: моделируй от запросов, а не от сущностей."
            },
            {
              "id": "t2",
              "text": "Индексы в PostgreSQL: B-tree, составной индекс и важность порядка колонок, покрывающий индекс (INCLUDE), частичный индекс. Записать, почему индекс на (a,b) не помогает запросу только по b."
            },
            {
              "id": "t3",
              "text": "Практика: взять таблицу timeline/outbox из Atlas, написать 2 реальных запроса и через EXPLAIN ANALYZE посмотреть Seq Scan vs Index Scan; добавить подходящий составной индекс и сравнить план."
            },
            {
              "id": "t4",
              "text": "Конспект: схема данных одного агрегата Atlas в реляционном и в документном виде; перечислить, какие запросы каждая модель удешевляет, а какие удорожает."
            }
          ],
          "reflectPrompt": "Какой запрос Atlas ты сегодня ускорил индексом и понял ли ты, ПОЧЕМУ планировщик выбрал именно этот план, а не угадал?",
          "resources": [
            {
              "label": "PostgreSQL docs",
              "note": "Indexes (B-tree, multicolumn, partial, covering) и Using EXPLAIN"
            },
            {
              "label": "Kleppmann, Designing Data-Intensive Applications",
              "note": "Глава 2-3: модели данных и storage/indexing"
            }
          ]
        },
        {
          "id": "w3d4",
          "week": 3,
          "dow": 4,
          "track": "ts",
          "title": "Структурная типизация + generics (ограничения, дефолты, вывод)",
          "warmup": "Алго-разминка: повтори паттерн two pointers на Reverse String / Move Zeroes — лёгкая задача, чтобы не терять алго-форму.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: структурная (duck) типизация vs номинальная, почему «лишние» поля проходят при присваивании, но не при object literal (excess property check). Записать, где это удобно, а где опасно (например, расширяемые DTO)."
            },
            {
              "id": "t2",
              "text": "Generics: ограничения через extends, дефолтные параметры типа, вывод типа из аргументов. Написать дженерик-функцию pick<T, K extends keyof T> и getOrThrow для безопасного доступа к Map/конфигу."
            },
            {
              "id": "t3",
              "text": "Практика на Atlas: типизировать дженерик-обёртку результата (Result<T, E> или типизированный обработчик события timeline), чтобы тип payload выводился из имени события, а не приходил any."
            },
            {
              "id": "t4",
              "text": "Конспект: когда брендировать тип (nominal через branded types) для UserId/OrderId, чтобы структурная совместимость не давала случайно перепутать идентификаторы."
            }
          ],
          "reflectPrompt": "Где сегодня структурная типизация дала ложное чувство безопасности — и помог бы branded type это закрыть?",
          "resources": [
            {
              "label": "TypeScript Handbook",
              "note": "Generics; Type Compatibility (structural typing)"
            },
            {
              "label": "TypeScript docs",
              "note": "keyof, Indexed Access Types, Generic Constraints"
            }
          ]
        },
        {
          "id": "w3d5",
          "week": 3,
          "dow": 5,
          "track": "cs",
          "title": "Конкурентность: гонки данных, мьютексы/семафоры, deadlock",
          "warmup": "Алго-разминка: реши задачу на очередь/стек (например, Implement Queue using Stacks) — модель FIFO/LIFO пригодится для рассуждений о порядке доступа.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: data race vs race condition, критическая секция, mutex vs semaphore vs мьютекс с counting; четыре условия Коффмана для deadlock. Записать минимальный пример гонки на инкременте счётчика."
            },
            {
              "id": "t2",
              "text": "Практика: смоделировать ограничение конкурентности в Node — написать простой semaphore/limiter (или взять p-limit мысленно) для пула из N параллельных задач; объяснить, почему single-threaded JS всё равно требует логических локов на ресурсе (БД-строка, внешний API)."
            },
            {
              "id": "t3",
              "text": "Привязка к Atlas: разобрать, как outbox/timeline защищает от двойной обработки (SELECT ... FOR UPDATE / advisory lock / идемпотентный ключ). Выписать, какое условие Коффмана мы рвём, чтобы избежать deadlock между воркерами."
            },
            {
              "id": "t4",
              "text": "Конспект: чек-лист предотвращения deadlock (единый порядок захвата локов, таймауты, lock-free через идемпотентность) с конкретными примерами из наших воркеров."
            }
          ],
          "reflectPrompt": "Какой ресурс в Atlas сейчас защищён только «удачей» single-threaded рантайма, а не явной идемпотентностью или локом на уровне БД?",
          "resources": [
            {
              "label": "OSTEP (Three Easy Pieces)",
              "note": "Concurrency: Locks, Semaphores, Deadlock"
            },
            {
              "label": "PostgreSQL docs",
              "note": "Explicit Locking: FOR UPDATE и Advisory Locks"
            }
          ]
        },
        {
          "id": "w3d6",
          "week": 3,
          "dow": 6,
          "track": "patterns",
          "title": "Структурные GoF: Adapter, Decorator, Facade",
          "warmup": "Алго-разминка: лёгкая задача на связный список (Merge Two Sorted Lists) — тренируем композицию узлов, перекликается с «обёртыванием» в Decorator.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: Adapter (приведение чужого интерфейса к нашему), Decorator (наращивание поведения без наследования, сохраняя интерфейс), Facade (упрощённый фасад над сложной подсистемой). Записать, чем Decorator отличается от Adapter по намерению, а не по форме."
            },
            {
              "id": "t2",
              "text": "Практика: написать Adapter для внешнего AI/LLM-клиента под наш внутренний интерфейс, затем Decorator поверх него для retry/логирования/метрик — без изменения исходного клиента."
            },
            {
              "id": "t3",
              "text": "Привязка к Atlas: спроектировать Facade над подсистемой outbox+timeline+очередь, чтобы вызывающий код видел один метод publishEvent(); выписать, какую сложность фасад прячет и какой ценой (риск «божественного фасада»)."
            },
            {
              "id": "t4",
              "text": "Конспект: таблица «проблема → паттерн → когда НЕ применять»; пометить, где в Atlas декораторы лучше сделать через композицию middleware, а не классы."
            }
          ],
          "reflectPrompt": "Где в Atlas ты сегодня узнал Decorator/Facade «в дикой природе» и где фасад уже начал превращаться в свалку логики?",
          "resources": [
            {
              "label": "GoF, Design Patterns",
              "note": "Structural patterns: Adapter, Decorator, Facade"
            },
            {
              "label": "Refactoring Guru",
              "note": "Adapter / Decorator / Facade: намерение и структура"
            }
          ]
        },
        {
          "id": "w3d7",
          "week": 3,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 4,
      "phase": 1,
      "theme": "Async внутри JS, потоки Node, модели I/O, поведенческие паттерны",
      "days": [
        {
          "id": "w4d1",
          "week": 4,
          "dow": 1,
          "track": "dsa",
          "title": "Стек/очередь/связный список + монотонный стек",
          "warmup": "Рекап: на бумаге проиграй push/pop стека и enqueue/dequeue очереди на одном массиве из 6 элементов; назови сложность каждой операции.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: разбери стек, очередь и односвязный список как АТД — какие инварианты, какие операции O(1), почему. Запиши, когда массив-бэкенд лучше, чем список из узлов."
            },
            {
              "id": "t2",
              "text": "Реализуй очередь на двух стеках и проверь амортизированную O(1) для dequeue; объясни вслух, почему амортизация работает."
            },
            {
              "id": "t3",
              "text": "Реши 2 задачи на монотонный стек: Daily Temperatures и Next Greater Element I. Зафиксируй в конспекте триггер-паттерн «ищу ближайший больший/меньший справа/слева → монотонный стек»."
            },
            {
              "id": "t4",
              "text": "Конспект: связь с Atlas — представь timeline-события как очередь обработки; где FIFO-инвариант критичен, а где порядок можно нарушить."
            }
          ],
          "reflectPrompt": "На какой формулировке задачи я не сразу распознал, что нужен именно монотонный стек, а не просто перебор?",
          "resources": [
            {
              "label": "MDN",
              "note": "Array как стек/очередь: push/pop/shift/unshift и их стоимость"
            },
            {
              "label": "NeetCode",
              "note": "Раздел Stack: Daily Temperatures, монотонный стек"
            }
          ]
        },
        {
          "id": "w4d2",
          "week": 4,
          "dow": 2,
          "track": "js",
          "title": "Промисы и async/await изнутри: микротаски vs макротаски",
          "warmup": "Алго-разминка: реши Valid Parentheses на стеке за 10 минут, проговори инвариант стека вслух.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: разбери жизненный цикл промиса (pending/fulfilled/rejected), как .then регистрирует реакцию в очередь микротасков и почему микротаски выгребаются полностью между макротасками."
            },
            {
              "id": "t2",
              "text": "Практика: предскажи порядок вывода в сниппете со смесью console.log, Promise.then, queueMicrotask и setTimeout(0); затем запусти в Node и сверь. Объясни каждое расхождение."
            },
            {
              "id": "t3",
              "text": "Сделай: напиши свой минимальный thenable с методом then, чтобы увидеть, как await его разворачивает; покажи, что await всегда уступает управление хотя бы на один тик микротаска."
            },
            {
              "id": "t4",
              "text": "Конспект: чем await отличается от .then по читаемости и по обработке ошибок; где в Atlas-обработчиках последовательный await скрыто сериализует то, что можно было распараллелить через Promise.all."
            }
          ],
          "reflectPrompt": "Где в реальном коде Atlas я мог бы случайно «потерять» отказ промиса (unhandled rejection) и как это поймать?",
          "resources": [
            {
              "label": "MDN",
              "note": "Using promises; Microtask guide"
            },
            {
              "label": "Node docs",
              "note": "The event loop; process.nextTick vs queueMicrotask"
            },
            {
              "label": "Спецификация",
              "note": "Jake Archibald, In The Loop (модель задач и микротасков)"
            }
          ]
        },
        {
          "id": "w4d3",
          "week": 4,
          "dow": 3,
          "track": "sysdesign",
          "title": "Кэширование: cache-aside, TTL и стратегии инвалидации",
          "warmup": "Алго-разминка: реализуй LRU-кэш на HashMap + двусвязный список (get/put за O(1)), проговори, зачем именно двусвязный список.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: разбери паттерн cache-aside (lazy loading) — кто читает/пишет в кэш, что происходит при miss; сравни с write-through и write-back по согласованности и риску потери данных."
            },
            {
              "id": "t2",
              "text": "Изучи проблемы TTL: cache stampede при одновременном протухании, и реши на бумаге через jitter TTL и single-flight/locking; запиши, какой выбрал бы для горячего ключа."
            },
            {
              "id": "t3",
              "text": "Сделай: спроектируй стратегию инвалидации для одного реального read-эндпоинта Atlas (например агрегат timeline) — ключ кэша, TTL, событие-триггер инвалидации из outbox. Нарисуй поток на одной схеме."
            },
            {
              "id": "t4",
              "text": "Конспект: перечисли способы получить stale-данные (гонка read-после-write, инвалидация до коммита транзакции) и как cache-aside их допускает."
            }
          ],
          "reflectPrompt": "Для какого из моих эндпоинтов риск отдать устаревшие данные неприемлем, и почему там кэш-aside опасен?",
          "resources": [
            {
              "label": "AWS docs",
              "note": "Caching strategies: cache-aside, write-through"
            },
            {
              "label": "Redis docs",
              "note": "Key eviction policies и EXPIRE/TTL"
            },
            {
              "label": "Статья",
              "note": "Cache stampede / thundering herd — паттерн single-flight"
            }
          ]
        },
        {
          "id": "w4d4",
          "week": 4,
          "dow": 4,
          "track": "node",
          "title": "Node Streams: readable/writable, pipe и механизм backpressure",
          "warmup": "Алго-разминка: реши задачу на скользящее окно (Best Time to Buy and Sell Stock) — проговори, как окно «течёт» по массиву, это интуиция для потоков.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: разбери Readable (flowing vs paused, режимы data/read) и Writable (write возвращает false, событие drain); запиши, что такое highWaterMark и почему он измеряется в байтах или объектах."
            },
            {
              "id": "t2",
              "text": "Сделай: напиши пайплайн чтения большого файла → Transform (например подсчёт строк) → запись, через stream.pipeline; затем намеренно затормози writable и пронаблюдай, как backpressure тормозит readable."
            },
            {
              "id": "t3",
              "text": "Эксперимент: сравни обработку большого файла через fs.readFile целиком vs через стрим — замерь пиковую память (process.memoryUsage). Зафиксируй разницу в конспекте."
            },
            {
              "id": "t4",
              "text": "Конспект: где в Atlas стримы дали бы выигрыш (выгрузка большого экспорта timeline, проксирование тела запроса) и почему pipeline лучше ручного pipe для обработки ошибок и закрытия ресурсов."
            }
          ],
          "reflectPrompt": "В каком месте моего кода я сейчас буферизую целиком то, что стоило бы стримить, и чем это грозит под нагрузкой?",
          "resources": [
            {
              "label": "Node docs",
              "note": "Stream: Readable/Writable, backpressuring in streams"
            },
            {
              "label": "Node docs",
              "note": "stream.pipeline и Transform streams"
            }
          ]
        },
        {
          "id": "w4d5",
          "week": 4,
          "dow": 5,
          "track": "cs",
          "title": "Модели I/O: blocking, non-blocking, multiplexed (epoll/kqueue → libuv)",
          "warmup": "Алго-разминка: реши задачу на очередь — реализуй кольцевой буфер (ring buffer) фиксированного размера; это структура, на которой строятся очереди событий.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: разбери 4 модели I/O — blocking, non-blocking (busy-poll), I/O multiplexing (select/poll/epoll/kqueue), async. Запиши, чем epoll принципиально лучше select при тысячах дескрипторов."
            },
            {
              "id": "t2",
              "text": "Изучи связь с Node: как libuv использует epoll (Linux)/kqueue (macOS) для сетевого I/O, и почему файловый I/O и DNS уходят в thread pool, а не в epoll. Зарисуй схему «event loop ↔ libuv ↔ ядро»."
            },
            {
              "id": "t3",
              "text": "Сделай: набросай псевдокод цикла на epoll_wait (регистрация fd, ожидание событий, обработка готовых) и сопоставь каждый шаг с фазой event loop Node."
            },
            {
              "id": "t4",
              "text": "Конспект: объясни, почему один CPU-тяжёлый обработчик в Atlas блокирует ВЕСЬ event loop, хотя I/O асинхронно — и какие у тебя варианты (worker_threads, вынос в очередь)."
            }
          ],
          "reflectPrompt": "Какой тип операции в моём сервисе тайно сидит в thread pool libuv и может стать узким местом при росте конкурентности?",
          "resources": [
            {
              "label": "libuv docs",
              "note": "Design overview: event loop, thread pool"
            },
            {
              "label": "Книга",
              "note": "The Linux Programming Interface (Kerrisk) — глава про epoll/I/O models"
            },
            {
              "label": "Node docs",
              "note": "Don't block the event loop"
            }
          ]
        },
        {
          "id": "w4d6",
          "week": 4,
          "dow": 6,
          "track": "patterns",
          "title": "Поведенческие GoF: Strategy, Observer, Command на TS",
          "warmup": "Алго-разминка: реши задачу на связный список (Reverse Linked List итеративно) — проговори перестановку указателей вслух.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: разбери Strategy (инкапсуляция взаимозаменяемых алгоритмов), Observer (издатель/подписчик, push-уведомления) и Command (запрос как объект, undo/queue). Запиши намерение каждого одной фразой и его «запах», который он лечит."
            },
            {
              "id": "t2",
              "text": "Сделай: реализуй Strategy на TS через интерфейс с одной функцией — например выбор стратегии ретраев (fixed/exponential backoff); покажи, как DI подменяет стратегию без if-цепочек."
            },
            {
              "id": "t3",
              "text": "Сделай: сопоставь Observer с event-driven Atlas — твой EventEmitter/брокер это уже Observer; запиши, где явный паттерн избыточен в JS (функции первого класса заменяют Strategy и Command)."
            },
            {
              "id": "t4",
              "text": "Конспект: свяжи Command с outbox — каждая запись outbox это сериализованная команда с возможностью повторного выполнения; перечисли, что даёт «запрос как объект» для retry и аудита."
            }
          ],
          "reflectPrompt": "Где я недавно написал длинный switch/if, который чище выразился бы Strategy или таблицей функций?",
          "resources": [
            {
              "label": "Книга",
              "note": "Design Patterns (GoF) — Behavioral patterns: Strategy, Observer, Command"
            },
            {
              "label": "Refactoring.Guru",
              "note": "Behavioral patterns с примерами и сравнением"
            }
          ]
        },
        {
          "id": "w4d7",
          "week": 4,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 5,
      "phase": 2,
      "theme": "Рекурсия и backtracking, TS conditional/infer, backpressure, основы распределённых систем",
      "days": [
        {
          "id": "w5d1",
          "week": 5,
          "dow": 1,
          "track": "dsa",
          "title": "Рекурсия и backtracking: дерево решений и отсечения",
          "warmup": "Реши по памяти за 10 мин: сумма элементов массива двумя способами — итеративно и рекурсивно. Назови глубину стека и базовый случай.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: анатомия рекурсии (базовый случай, шаг, инвариант), рекурсия vs стек, риск stack overflow. Записать шаблон backtracking: choose → explore → un-choose."
            },
            {
              "id": "t2",
              "text": "Решить 2 задачи на backtracking: Subsets и Permutations. Нарисовать дерево решений для маленького входа, отметить где происходит отсечение (pruning)."
            },
            {
              "id": "t3",
              "text": "Конспект: оценить сложность backtracking через размер дерева перебора (ветвление^глубина); где в Atlas я уже неявно делал перебор/рекурсивный обход (например обход дерева зависимостей или вложенного timeline)."
            }
          ],
          "reflectPrompt": "Где сегодня я путал «вернуться из рекурсии» и «откатить состояние» (un-choose), и к какому багу это привело бы?",
          "resources": [
            {
              "label": "LeetCode",
              "note": "тег Backtracking — Subsets, Permutations, Combination Sum"
            },
            {
              "label": "Книга",
              "note": "Cracking the Coding Interview — глава Recursion and Dynamic Programming"
            }
          ]
        },
        {
          "id": "w5d2",
          "week": 5,
          "dow": 2,
          "track": "ts",
          "title": "Conditional types и infer: вывод типов из структуры",
          "warmup": "Алго-разминка: реши Combination Sum (backtracking, повтор паттерна вчерашнего дня) за 12 мин, вслух проговори отсечение.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: синтаксис `T extends U ? X : Y`, distributive conditional types над union, ключевое слово `infer` для захвата части типа. Записать чем distributive отличается от обёрнутого в кортеж `[T] extends [U]`."
            },
            {
              "id": "t2",
              "text": "Практика: реализовать с нуля `MyReturnType<T>`, `MyParameters<T>`, `Awaited<T>` через `infer`; затем `UnwrapPromise` и `ElementType<T[]>`. Проверить на своих типах."
            },
            {
              "id": "t3",
              "text": "Практика на Atlas: взять реальный тип события/payload из event-driven кода и написать conditional-type, который из union событий извлекает payload по полю `type` (discriminated union → mapped lookup). Законспектировать, когда это упрощает API, а когда переусложняет."
            }
          ],
          "reflectPrompt": "В каком месте мой conditional type «распределился» по union неожиданно, и как `[T]` это чинит?",
          "resources": [
            {
              "label": "TS Handbook",
              "note": "Conditional Types; Inferring Within Conditional Types (infer)"
            },
            {
              "label": "Type Challenges",
              "note": "github type-challenges — задачи medium на infer"
            }
          ]
        },
        {
          "id": "w5d3",
          "week": 5,
          "dow": 3,
          "track": "sysdesign",
          "title": "Фундамент System Design: оценки нагрузки и дизайн API (REST/GraphQL/gRPC)",
          "warmup": "Алго-разминка: оцени O() для рекурсивного обхода дерева и для backtracking-перебора подмножеств (повтор интуиции сложности).",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: ритуал оценок — DAU → QPS (средний и пиковый ×N), размер записи → объём хранилища/год, ширина канала. Записать «числа интуиции»: латентности RAM/SSD/сеть/RTT датацентра."
            },
            {
              "id": "t2",
              "text": "Сравнить REST vs GraphQL vs gRPC по осям: контракт, over/under-fetching, версионирование, streaming, нагрузка на сеть. Составить таблицу «когда что выбирать»."
            },
            {
              "id": "t3",
              "text": "Упражнение на салфетке: спроектировать публичный API для timeline-сервиса Atlas (пагинация, идемпотентность записи, версионирование контракта). Оценить QPS и хранилище при 1M DAU; обосновать выбор протокола."
            }
          ],
          "reflectPrompt": "Какую из своих оценок нагрузки для timeline я не смог бы защитить цифрами прямо сейчас?",
          "resources": [
            {
              "label": "Книга",
              "note": "Designing Data-Intensive Applications (Kleppmann) — гл. 1-2"
            },
            {
              "label": "gRPC docs",
              "note": "Core concepts; когда уместен streaming"
            },
            {
              "label": "Numbers",
              "note": "Latency numbers every programmer should know"
            }
          ]
        },
        {
          "id": "w5d4",
          "week": 5,
          "dow": 4,
          "track": "node",
          "title": "Streams и backpressure: pipeline, object mode, корректное завершение",
          "warmup": "Алго-разминка: реализуй рекурсивный обход вложенного объекта (flatten) за 12 мин — повтор рекурсии недели.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: 4 типа потоков, highWaterMark, как `.write()` возвращает false и зачем нужен `drain`; что такое backpressure и кто кого тормозит. Записать почему `data`-события без паузы ломают backpressure."
            },
            {
              "id": "t2",
              "text": "Практика: написать конвейер `pipeline(readable, transform, writable)` в object mode, который обрабатывает поток записей; искусственно замедлить writable и убедиться, что readable притормаживает (логировать highWaterMark/буфер)."
            },
            {
              "id": "t3",
              "text": "Практика на Atlas: разобрать, как outbox/обработчик очереди потребляет события — есть ли там backpressure или потенциальный неограниченный буфер в памяти при медленном consumer? Законспектировать, где `pipeline` заменил бы ручную подписку на события и убрал утечку при ошибке."
            }
          ],
          "reflectPrompt": "Где в моём коде поток мог бы переполнить память, потому что producer быстрее consumer, и я это не контролирую?",
          "resources": [
            {
              "label": "Node docs",
              "note": "Stream — Backpressuring in Streams; stream.pipeline()"
            },
            {
              "label": "Node docs",
              "note": "Stream API — object mode, highWaterMark"
            }
          ]
        },
        {
          "id": "w5d5",
          "week": 5,
          "dow": 5,
          "track": "distsys",
          "title": "Модели отказов, 8 заблуждений и логические/векторные часы",
          "warmup": "Алго-разминка: реши Generate Parentheses (backtracking) за 12 мин — повтор паттерна choose/un-choose.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: 8 fallacies of distributed computing; модели отказов (crash-stop, crash-recovery, omission, Byzantine). Записать какие заблуждения мы по факту допускали в Atlas (надёжная сеть, нулевая латентность, один администратор)."
            },
            {
              "id": "t2",
              "text": "Теория: почему физические часы врут (clock skew), логические часы Лампорта (happened-before, →) и векторные часы (как детектируют конкурентность). Прорешать на бумаге обмен сообщениями из 3 узлов, проставить метки Лампорта и векторные метки."
            },
            {
              "id": "t3",
              "text": "Практика на Atlas: разобрать реальный инцидент, где причиной была сетевая/часовая иллюзия (рассинхрон, повторная доставка, гонка двух апдейтов). Записать какие метки/ordering предотвратили бы баг и почему `updatedAt` по wall-clock — ненадёжный арбитр."
            }
          ],
          "reflectPrompt": "Какое из 8 заблуждений сильнее всего зашито в текущую архитектуру Atlas как молчаливое допущение?",
          "resources": [
            {
              "label": "Книга",
              "note": "Designing Data-Intensive Applications — гл. 8 (Trouble with Distributed Systems), гл. 9 (часы, ordering)"
            },
            {
              "label": "Статья",
              "note": "Lamport — Time, Clocks, and the Ordering of Events in a Distributed System"
            }
          ]
        },
        {
          "id": "w5d6",
          "week": 5,
          "dow": 6,
          "track": "patterns",
          "title": "DI/IoC и Repository + Unit of Work на TS",
          "warmup": "Алго-разминка: повтори по памяти любую backtracking-задачу недели (Subsets или Permutations) за 10 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: Dependency Inversion vs Dependency Injection vs IoC-контейнер; виды внедрения (constructor/property), composition root. Записать, чем DI решает проблему тестируемости и связности без магии контейнера."
            },
            {
              "id": "t2",
              "text": "Теория + практика: паттерны Repository (абстракция над хранилищем) и Unit of Work (одна транзакция = одна бизнес-операция, отслеживание изменений). Набросать на TS интерфейс `Repository<T>` и `UnitOfWork` поверх транзакции PostgreSQL."
            },
            {
              "id": "t3",
              "text": "Практика на Atlas: взять место, где доменная логика напрямую дёргает БД/ORM, и переписать через Repository + Unit of Work так, чтобы outbox-запись и доменная мутация коммитились в одной транзакции. Записать, где паттерн оправдан, а где это overengineering."
            }
          ],
          "reflectPrompt": "Где в Atlas Repository/UoW реально снижает сложность, а где я добавил бы лишний слой ради паттерна?",
          "resources": [
            {
              "label": "Книга",
              "note": "Patterns of Enterprise Application Architecture (Fowler) — Repository, Unit of Work"
            },
            {
              "label": "Refactoring",
              "note": "refactoring.guru — Dependency Injection / IoC"
            }
          ]
        },
        {
          "id": "w5d7",
          "week": 5,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 6,
      "phase": 2,
      "theme": "Деревья, TS mapped-типы, worker_threads, согласованность и CAP",
      "days": [
        {
          "id": "w6d1",
          "week": 6,
          "dow": 1,
          "track": "dsa",
          "title": "Деревья и BST: обходы, валидация, LCA",
          "warmup": "Нарисуй BST из 7 узлов и вручную выпиши все 4 обхода (pre/in/post/level). Проверь: даёт ли in-order отсортированную последовательность?",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: бинарное дерево vs BST, инвариант BST, обходы DFS (pre/in/post) рекурсивно и итеративно через стек, BFS через очередь. Записать, какой обход для какой задачи (in-order — сортировка, post-order — освобождение/агрегация снизу вверх, level-order — ближайшие уровни)."
            },
            {
              "id": "t2",
              "text": "Решить и проговорить: Validate BST (через диапазон min/max, а не сравнение с детьми — записать, почему наивная проверка ломается), Maximum Depth, Same Tree."
            },
            {
              "id": "t3",
              "text": "Решить LCA в BST (спуск по свойству) и LCA в произвольном бинарном дереве (рекурсия снизу). Конспект: чем отличаются подходы и сложности O(h) vs O(n)."
            },
            {
              "id": "t4",
              "text": "Параллель с Atlas: timeline-события естественно ложатся в дерево/иерархию (родительские/дочерние записи). Записать, где обход post-order пригодился бы для агрегации статусов снизу вверх."
            }
          ],
          "reflectPrompt": "В каких задачах сегодня тянуло сравнивать узел только с прямыми детьми вместо передачи границ диапазона, и как это ловить заранее?",
          "resources": [
            {
              "label": "Cracking the Coding Interview",
              "note": "Глава Trees and Graphs: обходы и BST-инварианты"
            },
            {
              "label": "CLRS",
              "note": "Binary Search Trees: операции и свойства in-order"
            }
          ]
        },
        {
          "id": "w6d2",
          "week": 6,
          "dow": 2,
          "track": "ts",
          "title": "Mapped types, key remapping и template literal types",
          "warmup": "Алго-разминка: реши Invert Binary Tree (рекурсия), вслух проговори сложность O(n) и глубину стека O(h).",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: mapped types ([K in keyof T]), модификаторы +/-readonly и +/-?, разбор устройства Partial/Required/Readonly/Pick/Record из lib.es5. Записать, как модификаторы снимают/добавляют readonly и optional."
            },
            {
              "id": "t2",
              "text": "Практика key remapping: написать тип, который из объекта методов делает события on${Capitalize<K>} (template literal + as в mapped type). Сделать обратный — снять префикс get из ключей."
            },
            {
              "id": "t3",
              "text": "Написать DeepReadonly<T> и DeepPartial<T> рекурсивно. Проверить на вложенном типе и зафиксировать в конспекте подводные камни с массивами и функциями."
            },
            {
              "id": "t4",
              "text": "Привязка к Atlas: набросать типобезопасный реестр событий timeline/outbox через Record<EventName, Payload> + выведение union имён событий через template literal. Записать, что это даёт на ревью (исключаем рассинхрон имени события и payload)."
            }
          ],
          "reflectPrompt": "Где сегодня тип получился умнее, чем нужно — и какой более простой вариант читался бы лучше для следующего разработчика?",
          "resources": [
            {
              "label": "TypeScript Handbook",
              "note": "Mapped Types, Key Remapping via as, Template Literal Types"
            },
            {
              "label": "TypeScript lib",
              "note": "lib.es5.d.ts: реализации Partial/Pick/Record"
            }
          ]
        },
        {
          "id": "w6d3",
          "week": 6,
          "dow": 3,
          "track": "sysdesign",
          "title": "CDN и edge-кэширование: TTL, инвалидация, иерархия кэшей",
          "warmup": "Алго-разминка: реши Two Sum через hashmap за один проход, проговори, почему именно hashmap, а не сортировка с двумя указателями.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: как работает CDN (PoP, anycast, origin shielding), pull vs push CDN, иерархия кэшей edge -> mid-tier -> origin. Записать, что именно снижает: latency, нагрузку на origin, egress."
            },
            {
              "id": "t2",
              "text": "Изучить HTTP-кэширование: Cache-Control (max-age, s-maxage, stale-while-revalidate, private/public), ETag/If-None-Match, Vary. На листочке составить заголовки для трёх случаев: статика с хэшем в имени, API-ответ для конкретного юзера, публичный редко меняющийся ресурс."
            },
            {
              "id": "t3",
              "text": "Разобрать инвалидацию: TTL-based vs purge vs versioned URL (cache busting). Записать, почему versioned URL почти всегда лучше явного purge и где purge всё же неизбежен."
            },
            {
              "id": "t4",
              "text": "Спроектировать на бумаге edge-стратегию для одного эндпоинта Atlas, отдающего публичные данные timeline: какой s-maxage, нужен ли stale-while-revalidate, как защититься от cache stampede на origin."
            }
          ],
          "reflectPrompt": "Какой ответ в системе, которую ты ведёшь, ошибочно отдаётся как кэшируемый (или наоборот) и чем это грозит?",
          "resources": [
            {
              "label": "MDN",
              "note": "HTTP caching: Cache-Control, ETag, Vary"
            },
            {
              "label": "RFC 9111",
              "note": "HTTP Caching: семантика freshness и validation"
            },
            {
              "label": "Fastly / Cloudflare docs",
              "note": "Раздел про cache hierarchy и stale-while-revalidate"
            }
          ]
        },
        {
          "id": "w6d4",
          "week": 6,
          "dow": 4,
          "track": "node",
          "title": "Параллелизм в Node: worker_threads vs cluster vs child_process",
          "warmup": "Алго-разминка: реализуй обход дерева в ширину (BFS) через очередь — пригодится как модель того, как воркеры разбирают задачи из очереди.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: разница трёх моделей. worker_threads (общая память через SharedArrayBuffer, один процесс, дёшево) vs cluster (форк процессов, шарит порт, для масштабирования HTTP) vs child_process (отдельный процесс/бинарь, изоляция). Записать таблицу: когда что и почему."
            },
            {
              "id": "t2",
              "text": "Практика: вынести CPU-bound задачу (например, тяжёлый парсинг/хеширование) в worker_thread, передать данные через postMessage и через SharedArrayBuffer. Замерить, как разгружается event loop основного потока."
            },
            {
              "id": "t3",
              "text": "Изучить подводные камни: стоимость сериализации при передаче сообщений, structuredClone vs transferable objects, что НЕ шарится между потоками, graceful shutdown воркеров. Законспектировать."
            },
            {
              "id": "t4",
              "text": "Привязка к Atlas: определить, какой участок обработки очередей/AI-воркфлоу реально CPU-bound (а не I/O-bound) и был бы кандидатом на worker_threads. Записать критерий: если профиль показывает блокировку event loop > N мс — выносим."
            }
          ],
          "reflectPrompt": "Где в текущем коде ты по привычке решил бы 'добавить воркеров', хотя проблема на самом деле I/O-bound и параллелизм не поможет?",
          "resources": [
            {
              "label": "Node.js docs",
              "note": "worker_threads, cluster, child_process"
            },
            {
              "label": "Node.js docs",
              "note": "Don't Block the Event Loop (руководство)"
            }
          ]
        },
        {
          "id": "w6d5",
          "week": 6,
          "dow": 5,
          "track": "distsys",
          "title": "Модели согласованности и CAP/PACELC",
          "warmup": "Алго-разминка: проверь, является ли бинарное дерево валидным BST (передача границ) — освежает аккуратность рассуждения об инвариантах перед разговором об инвариантах согласованности.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: спектр согласованности — linearizability (строгая, как один регистр в реальном времени), sequential, causal (сохраняет happens-before), eventual. Записать, что именно гарантирует и что НЕ гарантирует каждая модель на примере чтения после записи."
            },
            {
              "id": "t2",
              "text": "Разобрать CAP честно: при сетевом разделе выбираешь C или A; 'P' не опциональна в реальной сети. Затем PACELC: если Partition -> A/C, ELSE -> Latency/Consistency. Записать, в какой квадрант попадают известные системы (например, классический трейдофф Dynamo-стиля vs строго согласованной СУБД)."
            },
            {
              "id": "t3",
              "text": "Практика-разбор: взять PostgreSQL-репликацию (sync vs async) и сформулировать, какую модель согласованности видит читатель с реплики и какой это PACELC-выбор. Записать, как read-your-writes ломается на async-реплике."
            },
            {
              "id": "t4",
              "text": "Привязка к Atlas: outbox-паттерн даёт eventual consistency между БД и брокером. Записать, какие гарантии это даёт потребителю (at-least-once, возможные дубликаты, отсутствие глобального порядка) и где нужна идемпотентность."
            }
          ],
          "reflectPrompt": "Где в твоей системе пользователь молча ожидает линеаризуемость, а архитектура даёт лишь eventual — и чем это уже било по инцидентам?",
          "resources": [
            {
              "label": "Designing Data-Intensive Applications",
              "note": "Главы Consistency and Consensus, Replication"
            },
            {
              "label": "Jepsen / Kleppmann",
              "note": "Заметки про PACELC и определения уровней согласованности"
            }
          ]
        },
        {
          "id": "w6d6",
          "week": 6,
          "dow": 6,
          "track": "patterns",
          "title": "Гексагональная архитектура (ports/adapters) и Clean Architecture",
          "warmup": "Алго-разминка: реши Lowest Common Ancestor в бинарном дереве (рекурсия снизу) — заодно метафора 'ядро внизу, адаптеры наверху'.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: правило зависимостей (зависимости направлены внутрь, к домену), порты (интерфейсы домена) vs адаптеры (реализации для БД/брокера/HTTP), driving vs driven ports. Записать, чем гексагон и Clean похожи и где расходятся в терминологии."
            },
            {
              "id": "t2",
              "text": "Практика на TS: для одного use-case (например, публикация события в timeline) определить порт-интерфейс репозитория/паблишера в домене и два адаптера — реальный (PostgreSQL/брокер) и in-memory для тестов. Показать, что домен не импортирует инфраструктуру."
            },
            {
              "id": "t3",
              "text": "Написать тест use-case через in-memory адаптер без поднятия БД. Зафиксировать в конспекте: что именно стало проще тестировать и какой ценой (больше интерфейсов/маппинга)."
            },
            {
              "id": "t4",
              "text": "Критический разбор для Atlas: где гексагон оправдан, а где это оверинжиниринг для CRUD-модуля. Записать честный критерий применимости — простота важнее симметрии слоёв."
            }
          ],
          "reflectPrompt": "Какой слой/порт ты сегодня ввёл бы 'для чистоты', хотя он не убирает реальной боли, а лишь добавляет файлов?",
          "resources": [
            {
              "label": "Alistair Cockburn",
              "note": "Hexagonal Architecture (Ports and Adapters), оригинальная статья"
            },
            {
              "label": "Clean Architecture (Robert C. Martin)",
              "note": "Глава про Dependency Rule и границы"
            }
          ]
        },
        {
          "id": "w6d7",
          "week": 6,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 7,
      "phase": 2,
      "theme": "Графы, генераторы, профилирование Node, репликация",
      "days": [
        {
          "id": "w7d1",
          "week": 7,
          "dow": 1,
          "track": "dsa",
          "title": "Графы: представление, BFS/DFS, топологическая сортировка",
          "warmup": "Нарисуй один граф из 6 вершин двумя способами: матрица смежности и список смежности. Прикинь память и стоимость «есть ли ребро u→v» для каждого.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: способы хранения графа (adjacency list vs matrix), направленный/ненаправленный, взвешенный. Записать, когда что выбирать и оценку памяти O(V+E) vs O(V^2)."
            },
            {
              "id": "t2",
              "text": "Реализовать BFS и DFS (итеративный через стек + рекурсивный) на adjacency list. Проговорить вслух, почему BFS даёт кратчайший путь по числу рёбер в невзвешенном графе."
            },
            {
              "id": "t3",
              "text": "Решить топологическую сортировку двумя путями: алгоритм Кана (по in-degree) и DFS с пост-порядком. На примере зависимостей задач задетектить цикл и записать, как именно цикл проявляется в каждом методе."
            }
          ],
          "reflectPrompt": "Где в Atlas есть неявный граф зависимостей (порядок шагов воркфлоу, зависимости задач) и помог бы там топосорт или детект цикла?",
          "resources": [
            {
              "label": "CLRS",
              "note": "Elementary Graph Algorithms: BFS, DFS, Topological Sort"
            },
            {
              "label": "Sedgewick, Algorithms",
              "note": "Глава Graphs: представление и обход"
            }
          ]
        },
        {
          "id": "w7d2",
          "week": 7,
          "dow": 2,
          "track": "js",
          "title": "Генераторы и итераторы: протокол итерации и ленивые потоки",
          "warmup": "Алго-разминка: обойди дерево/граф из вчерашнего DFS, но оформи обход как функцию-генератор, yield-ящую вершины. Сравни с рекурсией, накапливающей массив.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: протоколы iterable и iterator (Symbol.iterator, next()/{value,done}), что под капотом у for...of и spread. Записать различие iterable vs iterator на конкретном примере."
            },
            {
              "id": "t2",
              "text": "Написать свой генератор: ленивый range, бесконечная последовательность с take(n), и генератор-пайплайн map/filter без материализации массивов. Замерить, почему это экономит память на больших данных."
            },
            {
              "id": "t3",
              "text": "Разобрать двусторонний обмен: значение, передаваемое в gen.next(value), gen.return() и gen.throw(). Конспект: где async-генераторы (for await...of) уместны для постраничной выгрузки из БД/очереди в Atlas."
            }
          ],
          "reflectPrompt": "Какой существующий кусок Atlas, грузящий всё в массив, выиграл бы от ленивого генератора, и какой именно ресурс он бы сэкономил?",
          "resources": [
            {
              "label": "MDN",
              "note": "Iteration protocols; function*; for await...of"
            },
            {
              "label": "ECMAScript spec / You Don't Know JS",
              "note": "Generators & Iterators"
            }
          ]
        },
        {
          "id": "w7d3",
          "week": 7,
          "dow": 3,
          "track": "sysdesign",
          "title": "Очереди и асинхронная обработка: transactional outbox на примере Atlas",
          "warmup": "Алго-разминка: на бумаге смоделируй обработку очереди как BFS по уровням — джобы как вершины, ретраи как повторное добавление в очередь. Где это упирается в порядок и где в дубликаты?",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: зачем очередь (сглаживание нагрузки, развязка, ретраи), at-least-once vs at-most-once vs exactly-once-иллюзия. Записать, почему dual-write в БД+брокер ненадёжен и как outbox это чинит."
            },
            {
              "id": "t2",
              "text": "Разобрать СВОЙ outbox из Atlas: как событие пишется в одной транзакции с доменными данными, как relay/poller вычитывает и публикует, как помечается отправленным. Нарисовать поток и отметить точки потери/дублирования."
            },
            {
              "id": "t3",
              "text": "Спроектировать защиту: идемпотентность консьюмера (dedup-ключ), backoff и DLQ, гарантии порядка (партиционирование по ключу агрегата). Записать 3 инварианта, которые должны держаться при сбое relay в любой момент."
            }
          ],
          "reflectPrompt": "Какой реальный инцидент с timeline/outbox в Atlas был бы предотвращён, будь консьюмер строго идемпотентным?",
          "resources": [
            {
              "label": "Microservices.io",
              "note": "Pattern: Transactional Outbox; Idempotent Consumer"
            },
            {
              "label": "Kleppmann, DDIA",
              "note": "Глава 11: Stream Processing, доставка сообщений"
            }
          ]
        },
        {
          "id": "w7d4",
          "week": 7,
          "dow": 4,
          "track": "node",
          "title": "Память и GC в Node: heap snapshots, flame graphs, поиск утечек",
          "warmup": "Алго-разминка: вспомни, почему незакрытый замыкающий контекст или растущий Map как кэш без вытеснения дают O(n) роста памяти. Прикинь на сниппете, что именно удерживает ссылку.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: V8 heap (new/old space), generational GC (scavenge vs mark-sweep-compact), что такое retained size и dominators. Записать признаки утечки в графике heap used: пила vs монотонный рост."
            },
            {
              "id": "t2",
              "text": "Снять heap snapshot работающего сервиса (--inspect / Chrome DevTools), сделать два снимка и сравнить через Comparison view. Найти растущий класс объектов и проследить retainers до корня."
            },
            {
              "id": "t3",
              "text": "Собрать CPU flame graph (--prof или clinic/0x) на горячем эндпоинте, найти самый широкий фрейм. Законспектировать чек-лист поиска утечки на проде Atlas без рестарта (RSS, --max-old-space-size, метрики GC pause)."
            }
          ],
          "reflectPrompt": "Какой кэш или подписка в Atlas сейчас не имеет границы/очистки и может утечь под нагрузкой — и как ты это докажешь снимком, а не догадкой?",
          "resources": [
            {
              "label": "Node.js docs",
              "note": "Diagnostics: heap snapshot, --prof, --inspect"
            },
            {
              "label": "V8 dev blog",
              "note": "Orinoco / Generational Garbage Collection"
            },
            {
              "label": "Clinic.js docs",
              "note": "Doctor & Flame"
            }
          ]
        },
        {
          "id": "w7d5",
          "week": 7,
          "dow": 5,
          "track": "distsys",
          "title": "Репликация: leader/follower, multi-leader, leaderless, кворумы",
          "warmup": "Алго-разминка: смоделируй кворум как условие пересечения множеств — реши на бумаге, при каких w + r > n чтения гарантированно видят последнюю запись для n=3,5.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: single-leader (sync vs async репликация, replication lag, отставшие реплики), multi-leader (конфликты записи) и leaderless (Dynamo-стиль). Записать, какие аномалии чтения (read-your-writes, monotonic reads) ломаются при async-реплике."
            },
            {
              "id": "t2",
              "text": "Разобрать PostgreSQL: streaming replication, sync vs async standby, чтение с реплики и риск устаревших данных. Записать, как это влияет на Atlas, если читать timeline с follower сразу после записи на leader."
            },
            {
              "id": "t3",
              "text": "Кворумы: w + r > n, read repair и anti-entropy, конфликт-резолюция (LWW, версии/векторные часы). Спроектировать на бумаге кворумную схему для одного гипотетического счётчика в Atlas и записать, где LWW теряет запись."
            }
          ],
          "reflectPrompt": "Где в Atlas сейчас молча читается с асинхронной реплики, и какой пользовательский баг это даёт под лагом репликации?",
          "resources": [
            {
              "label": "Kleppmann, DDIA",
              "note": "Глава 5: Replication (leader/multi-leader/leaderless, кворумы)"
            },
            {
              "label": "PostgreSQL docs",
              "note": "High Availability, Streaming Replication, synchronous_commit"
            }
          ]
        },
        {
          "id": "w7d6",
          "week": 7,
          "dow": 6,
          "track": "patterns",
          "title": "DDD тактический: entity, value object, aggregate, repository",
          "warmup": "Алго-разминка: возьми valueOf/equality — реши, по какому признаку два объекта «равны». Запиши разницу сравнения по идентичности (ссылка/id) и по значению (поля), это база для entity vs value object.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: entity (идентичность во времени) vs value object (иммутабелен, равенство по значению) vs aggregate (граница консистентности и инварианты) vs repository (доступ к агрегату как к коллекции). Записать определения своими словами с примером из Atlas."
            },
            {
              "id": "t2",
              "text": "Смоделировать один реальный кусок Atlas (например timeline или задача воркфлоу) как aggregate: выделить корень, инварианты, что внутри границы, что — только ссылка по id. Записать правило «одна транзакция = один агрегат»."
            },
            {
              "id": "t3",
              "text": "Описать repository-интерфейс для этого агрегата (без ORM-протечек в домен) и пару value object (например статус/период). Записать, какие текущие анемичные структуры в Atlas стоило бы превратить в value object и что это даст."
            }
          ],
          "reflectPrompt": "Какая бизнес-инварианта в Atlas сейчас держится разрозненными проверками в сервисах вместо границы агрегата — и где из-за этого она может нарушиться?",
          "resources": [
            {
              "label": "Eric Evans, Domain-Driven Design",
              "note": "Часть II: Building Blocks (Entities, Value Objects, Aggregates, Repositories)"
            },
            {
              "label": "Vaughn Vernon, Implementing DDD",
              "note": "Главы про Aggregates и проектирование границ"
            }
          ]
        },
        {
          "id": "w7d7",
          "week": 7,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 8,
      "phase": 2,
      "theme": "Кучи/union-find/trie, вариантность TS, шардирование, MVCC и индексы",
      "days": [
        {
          "id": "w8d1",
          "week": 8,
          "dow": 1,
          "track": "dsa",
          "title": "Кучи / priority queue + union-find + trie",
          "warmup": "Рекап недели: за 10 мин по памяти перечисли инварианты бинарной кучи (sift-up/sift-down) и нарисуй массивное представление heap для [5,3,8,1].",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: бинарная min/max-heap (массив, индексы 2i+1/2i+2), сложности push/pop O(log n), build-heap O(n). Записать, когда нужна priority queue, а когда хватит отсортированного массива."
            },
            {
              "id": "t2",
              "text": "Практика: реализовать MinHeap на TS (push/pop/peek) и решить «Kth Largest Element» и «Merge K Sorted Lists» через PQ. Проговорить сложность вслух."
            },
            {
              "id": "t3",
              "text": "Изучить union-find (DSU) с path compression + union by rank и trie (вставка/поиск/префикс). Реализовать DSU, решить «Number of Connected Components»; набросать trie для автодополнения."
            },
            {
              "id": "t4",
              "text": "Конспект: таблица «структура → задача» — heap (top-K, k-way merge, Dijkstra), DSU (компоненты, циклы, Kruskal), trie (префиксы, словари). Где в Atlas пригодилась бы PQ (например, приоритет ретраев в очереди)?"
            }
          ],
          "reflectPrompt": "Почему build-heap за O(n), а не O(n log n) — смог ли я обосновать амортизацию по уровням?",
          "resources": [
            {
              "label": "Big-O",
              "note": "bigocheatsheet.com — heap/DSU/trie операции"
            },
            {
              "label": "CLRS",
              "note": "гл. Heapsort и Priority Queues; Disjoint Sets"
            }
          ]
        },
        {
          "id": "w8d2",
          "week": 8,
          "dow": 2,
          "track": "ts",
          "title": "Вариантность (co/contra/bi) + продвинутые utility-типы",
          "warmup": "Алго-разминка: за 8 мин по памяти реализовать вставку в trie (из вчерашнего) или MinHeap.push.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: ковариантность/контравариантность/бивариантность в TS. Разобрать, почему параметры функций контравариантны (strictFunctionTypes), а возвращаемые значения ковариантны; почему методы бивариантны. Записать 3 примера, где это ломает безопасность."
            },
            {
              "id": "t2",
              "text": "Практика: написать примеры, где массив `Dog[]` нельзя подставлять как `Animal[]` для записи; продемонстрировать contravariance на колбэках обработчиков событий. Объяснить `in`/`out` модификаторы вариантности в дженериках."
            },
            {
              "id": "t3",
              "text": "Изучить и реализовать свои utility-типы: `DeepPartial<T>`, `DeepReadonly<T>`, `RequireAtLeastOne<T>`, разбор встроенных `Awaited`/`Parameters`/`ReturnType` через conditional + infer."
            },
            {
              "id": "t4",
              "text": "Конспект: где в типах событий Atlas (timeline/outbox payloads) вариантность важна — например, почему обработчик более общего события безопасно принимает более конкретный payload, а наоборот нет."
            }
          ],
          "reflectPrompt": "В каком месте моего реального кода бивариантность методов скрывает потенциальный баг типизации?",
          "resources": [
            {
              "label": "TS Handbook",
              "note": "Type Compatibility; Variance; strictFunctionTypes"
            },
            {
              "label": "TS docs",
              "note": "Utility Types; Conditional Types (infer)"
            }
          ]
        },
        {
          "id": "w8d3",
          "week": 8,
          "dow": 3,
          "track": "sysdesign",
          "title": "Шардирование/партиционирование + consistent hashing",
          "warmup": "Алго-разминка: повторить DSU (union/find с path compression) по памяти за 8 мин — пригодится для интуиции про «бакеты».",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: горизонтальное шардирование vs партиционирование одной БД. Стратегии ключа шарда: hash, range, directory/lookup. Записать плюсы/минусы каждой и проблему hotspot/несбалансированных шардов."
            },
            {
              "id": "t2",
              "text": "Изучить consistent hashing: кольцо, виртуальные ноды, почему добавление/удаление ноды перемещает ~1/N ключей, а не все. Нарисовать кольцо и проследить ребалансировку при добавлении узла."
            },
            {
              "id": "t3",
              "text": "Упражнение «на салфетке»: спроектировать шардирование для таблицы timeline-событий Atlas — выбрать ключ шарда (tenant_id vs event_id), оценить cross-shard запросы и rebalancing. Записать, что ломается при range-запросах по времени."
            },
            {
              "id": "t4",
              "text": "Конспект: чек-лист выбора стратегии шардирования (паттерн доступа → ключ → ребаланс → распределённые транзакции/джойны). Где в Atlas cross-shard агрегация стала бы узким местом."
            }
          ],
          "reflectPrompt": "Какой ключ шарда я выбрал бы для Atlas и какой класс запросов он сделает дорогим?",
          "resources": [
            {
              "label": "DDIA",
              "note": "гл. 6 Partitioning (Kleppmann)"
            },
            {
              "label": "Dynamo",
              "note": "Amazon Dynamo paper — consistent hashing, virtual nodes"
            }
          ]
        },
        {
          "id": "w8d4",
          "week": 8,
          "dow": 4,
          "track": "js",
          "title": "Proxy / Reflect / WeakMap / WeakRef / Symbol",
          "warmup": "Алго-разминка: повторить «Kth Largest» через heap за 8 мин или прогнать due-задачу по top-K.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: meta-программирование через Proxy (traps: get/set/has/apply) и парный API Reflect. Записать, зачем Reflect внутри trap (корректный `receiver`, дефолтное поведение)."
            },
            {
              "id": "t2",
              "text": "Практика: реализовать через Proxy логирующую обёртку и валидацию записи в объект; сделать reactive-объект (минимальный observable) на Proxy+Reflect. Замерить накладные расходы vs прямой доступ."
            },
            {
              "id": "t3",
              "text": "Изучить WeakMap/WeakSet/WeakRef/FinalizationRegistry: почему ключи не держат GC, типичные утечки и кейсы (приватные данные, кэш по объекту-ключу). Symbol и well-known символы (Symbol.iterator, Symbol.asyncIterator)."
            },
            {
              "id": "t4",
              "text": "Конспект: где в Node-сервисе осторожно с Proxy (горячий путь — overhead) и где WeakMap решает утечку памяти (например, метаданные по объектам запроса/сессии без ручной очистки)."
            }
          ],
          "reflectPrompt": "В каком кэше или реестре Atlas WeakMap/WeakRef убрал бы скрытую утечку памяти?",
          "resources": [
            {
              "label": "MDN",
              "note": "Proxy; Reflect; WeakMap; WeakRef; Symbol"
            },
            {
              "label": "Node docs",
              "note": "FinalizationRegistry; --expose-gc для экспериментов"
            }
          ]
        },
        {
          "id": "w8d5",
          "week": 8,
          "dow": 5,
          "track": "db",
          "title": "MVCC + типы индексов (B-tree/GIN/GiST/BRIN/частичные/покрывающие)",
          "warmup": "Алго-разминка: повторить бинпоиск по памяти за 8 мин — мостик к интуиции про B-tree обход.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: MVCC в PostgreSQL — версии строк (xmin/xmax), snapshot isolation, зачем VACUUM и что такое bloat/dead tuples. Записать, чем MVCC отличается от блокировок на чтение."
            },
            {
              "id": "t2",
              "text": "Практика: выполнить два конкурентных транзакции в psql, посмотреть видимость строк; включить `EXPLAIN (ANALYZE, BUFFERS)` на запросе и прочитать план (Index Scan vs Seq Scan vs Bitmap)."
            },
            {
              "id": "t3",
              "text": "Изучить типы индексов: B-tree (диапазоны/сортировка), GIN (jsonb/полнотекст/массивы), GiST (геометрия/range), BRIN (большие отсортированные по времени таблицы), частичные и покрывающие (INCLUDE). Подобрать индекс под 3 разных запроса."
            },
            {
              "id": "t4",
              "text": "Конспект: для таблицы outbox/timeline Atlas — какой индекс под «не обработанные события» (частичный WHERE processed=false), какой под поиск по jsonb-payload (GIN), какой под выборку по времени (BRIN). Привязать к реальному инциденту с медленным запросом, если был."
            }
          ],
          "reflectPrompt": "Где в Atlas я поставил бы частичный или покрывающий индекс вместо обычного B-tree и почему это выгоднее?",
          "resources": [
            {
              "label": "PostgreSQL docs",
              "note": "MVCC; Index Types; Index-Only Scans"
            },
            {
              "label": "PostgreSQL docs",
              "note": "EXPLAIN; Routine Vacuuming"
            }
          ]
        },
        {
          "id": "w8d6",
          "week": 8,
          "dow": 6,
          "track": "patterns",
          "title": "DDD стратегический + CQRS",
          "warmup": "Алго-разминка: повторить любую задачу недели по памяти (heap/DSU/trie) за 10 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: стратегический DDD — bounded context, ubiquitous language, context map (паттерны интеграции: ACL, conformist, customer/supplier, shared kernel). Записать, чем bounded context отличается от микросервиса."
            },
            {
              "id": "t2",
              "text": "Практика: нарисовать context map для Atlas — выделить 2-3 контекста, обозначить отношения и где нужен Anti-Corruption Layer на границе с внешними системами/AI-воркфлоу."
            },
            {
              "id": "t3",
              "text": "Изучить CQRS: разделение команд и запросов, отдельные read-модели, связь с event-driven и outbox (как timeline-события строят проекции для чтения). Записать, когда CQRS оправдан, а когда это оверинжиниринг."
            },
            {
              "id": "t4",
              "text": "Behavioral-рефлексия: вспомнить случай, где размытые границы контекста (или общая БД между командами) привели к конфликту/инциденту. Записать Ситуация→Действие→Результат и как staff-инженер провёл бы границу."
            }
          ],
          "reflectPrompt": "Где в Atlas границы bounded context сейчас протекают и какой паттерн интеграции это бы починил?",
          "resources": [
            {
              "label": "Книга",
              "note": "Eric Evans — Domain-Driven Design (Strategic Design)"
            },
            {
              "label": "Книга",
              "note": "Vaughn Vernon — Implementing DDD; martinfowler.com — CQRS"
            }
          ]
        },
        {
          "id": "w8d7",
          "week": 8,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 9,
      "phase": 2,
      "theme": "Динамика, declaration-файлы TS, async_hooks, планировщик Postgres, Event Sourcing",
      "days": [
        {
          "id": "w9d1",
          "week": 9,
          "dow": 1,
          "track": "dsa",
          "title": "Динамика 1D/2D: climbing stairs, house robber, LCS",
          "warmup": "Реши Fibonacci двумя способами: наивная рекурсия и снизу-вверх с двумя переменными. Сравни число вызовов и O().",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: что такое подзадача и переход (recurrence). Записать рецепт: состояние → переход → база → порядок вычисления. Разобрать, когда хватает O(1) памяти (rolling variables), а когда нужен полный массив/таблица."
            },
            {
              "id": "t2",
              "text": "Решить 1D: Climbing Stairs и House Robber. Для каждой выписать состояние и переход словами ДО кода, затем свести память к O(1)."
            },
            {
              "id": "t3",
              "text": "Решить 2D: Longest Common Subsequence через таблицу dp[i][j]. Нарисовать заполнение таблицы на маленьком примере руками, проговорить смысл каждой ячейки."
            },
            {
              "id": "t4",
              "text": "Конспект: чем top-down (мемоизация) отличается от bottom-up по памяти и стеку вызовов; когда какой выбирать."
            }
          ],
          "reflectPrompt": "Смог ли я сформулировать переход словами до того, как начал писать код, или подгонял формулу под примеры?",
          "resources": [
            {
              "label": "Книга",
              "note": "CLRS — глава Dynamic Programming (LCS, rod cutting)"
            },
            {
              "label": "NeetCode",
              "note": "1-D и 2-D Dynamic Programming — список паттернов"
            }
          ]
        },
        {
          "id": "w9d2",
          "week": 9,
          "dow": 2,
          "track": "ts",
          "title": "Declaration-файлы, module augmentation и строгость компилятора",
          "warmup": "Алго-разминка: повтори House Robber по памяти за 10 мин, проговори переход вслух.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: что такое .d.ts, declare module/global, ambient-декларации; зачем @types и как TS резолвит типы для JS-пакета без типов. Записать разницу между типизацией кода и описанием внешнего модуля."
            },
            {
              "id": "t2",
              "text": "Практика: написать .d.ts для маленького нетипизированного JS-модуля (или подмодуля из Atlas-зависимостей); подключить через typeRoots/paths и проверить, что типы видны."
            },
            {
              "id": "t3",
              "text": "Практика module augmentation: расширить существующий интерфейс — например, добавить поле в Express Request или в типы своего конфига Atlas — через declare module. Понять, почему именно augmentation, а не переопределение."
            },
            {
              "id": "t4",
              "text": "Изучить флаги строгости: strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride. Включить один новый флаг на куске кода и записать, какие реальные баги/допущения он вскрыл."
            }
          ],
          "reflectPrompt": "Какой флаг строгости вскрыл скрытое предположение в моём коде, о котором я не подозревал?",
          "resources": [
            {
              "label": "TS Handbook",
              "note": "Declaration Files (.d.ts), Declaration Merging"
            },
            {
              "label": "TS docs",
              "note": "tsconfig — Strict checks (раздел Type Checking)"
            }
          ]
        },
        {
          "id": "w9d3",
          "week": 9,
          "dow": 3,
          "track": "sysdesign",
          "title": "Разбор кейса целиком: лента активности / timeline (на базе Atlas)",
          "warmup": "Алго-разминка: повтори LCS — на бумаге заполни таблицу для двух коротких строк за 10 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Пройти 4 шага разбора для activity-timeline: требования (кто пишет/читает, объёмы, что считается «активностью»), оценки QPS чтения/записи и хранилища, high-level схема, узкие места. Записать как мини design doc."
            },
            {
              "id": "t2",
              "text": "Сравнить fan-out on write (push в ленты подписчиков) и fan-out on read (сборка при запросе): на каких профилях нагрузки Atlas что выгоднее, проблема «звёзд» с миллионами подписчиков, гибрид. Зафиксировать выбор и обоснование."
            },
            {
              "id": "t3",
              "text": "Спроектировать модель хранения и пагинацию: cursor-based по (created_at, id), горячий кеш ленты, дедупликация и идемпотентность событий. Связать с тем, как события попадают в timeline в реальном Atlas."
            },
            {
              "id": "t4",
              "text": "Записать 3 открытых вопроса/трейдоффа, которые я бы вынес в RFC по этому кейсу (консистентность ленты, удаление/редактирование событий, ранжирование vs хронология)."
            }
          ],
          "reflectPrompt": "Какой архитектурный выбор для timeline в Atlas я сделал по инерции, а не потому что он оптимален для нашего профиля нагрузки?",
          "resources": [
            {
              "label": "System Design",
              "note": "Design a News Feed / Timeline — стандартный кейс (fan-out trade-offs)"
            },
            {
              "label": "Книга",
              "note": "Designing Data-Intensive Applications, гл. 1 (Twitter timeline пример)"
            }
          ]
        },
        {
          "id": "w9d4",
          "week": 9,
          "dow": 4,
          "track": "node",
          "title": "AsyncLocalStorage, async_hooks и распространение контекста при ошибках",
          "warmup": "Алго-разминка: реши Min Cost Climbing Stairs (вариация DP) за 12 мин, сведи память к O(1).",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: зачем async_hooks и AsyncLocalStorage, как сохраняется контекст через await/callbacks/Promise-цепочки, чем это лучше передачи requestId параметром по всему стеку. Записать стоимость и оговорки по производительности."
            },
            {
              "id": "t2",
              "text": "Практика: сделать middleware, кладущий correlationId/traceId в AsyncLocalStorage, и логгер, который автоматически подмешивает его во все записи. Проверить, что id переживает несколько await."
            },
            {
              "id": "t3",
              "text": "Практика на ошибках: смоделировать, где контекст теряется (event emitters, setInterval, пулы), и где unhandledRejection/uncaughtException ломают propagation. Записать паттерн корректного оборачивания ошибок без потери контекста."
            },
            {
              "id": "t4",
              "text": "Связать с Atlas: как ALS упростил бы трассировку инцидента — сквозной id через очереди/outbox-воркеры. Набросать, где бы я внедрил его и какие границы (process boundary) он не пересекает."
            }
          ],
          "reflectPrompt": "В каком месте Atlas я сейчас вручную таскаю requestId через слои, и где ALS убрал бы этот шум?",
          "resources": [
            {
              "label": "Node docs",
              "note": "AsyncLocalStorage; async_hooks"
            },
            {
              "label": "Node docs",
              "note": "process — events 'uncaughtException', 'unhandledRejection'"
            }
          ]
        },
        {
          "id": "w9d5",
          "week": 9,
          "dow": 5,
          "track": "db",
          "title": "Планировщик Postgres, EXPLAIN (ANALYZE, BUFFERS) и блокировки очереди (FOR UPDATE SKIP LOCKED)",
          "warmup": "Алго-разминка: повтори переход House Robber и оцени, как он отображается на «состояние = строка таблицы». 10 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: как планировщик выбирает план (cost model, статистика, Seq Scan vs Index Scan vs Bitmap), что меняет ANALYZE и random_page_cost. Записать, как читать дерево плана сверху вниз."
            },
            {
              "id": "t2",
              "text": "Практика: на реальном/похожем запросе Atlas запустить EXPLAIN (ANALYZE, BUFFERS); сопоставить estimated vs actual rows, найти расхождение статистики, посмотреть shared hit/read (буферы). Зафиксировать, где план уходит в Seq Scan и почему."
            },
            {
              "id": "t3",
              "text": "Теория+практика изоляции: уровни (Read Committed, Repeatable Read, Serializable), что такое блокировки строк, deadlock. Воспроизвести два конкурентных UPDATE и посмотреть ожидание/дедлок."
            },
            {
              "id": "t4",
              "text": "Паттерн очереди: реализовать выборку задач через SELECT ... FOR UPDATE SKIP LOCKED. Объяснить, почему это правильный способ раздавать работу воркерам outbox/queue в Atlas без двойной обработки. Записать сравнение с advisory locks."
            }
          ],
          "reflectPrompt": "Какое расхождение между планом и реальностью я увидел в EXPLAIN ANALYZE, и что оно говорит о моих индексах или статистике?",
          "resources": [
            {
              "label": "PostgreSQL docs",
              "note": "Using EXPLAIN; Transaction Isolation; Explicit Locking (FOR UPDATE / SKIP LOCKED)"
            },
            {
              "label": "PostgreSQL docs",
              "note": "Planner Cost Constants; How the Planner Uses Statistics"
            }
          ]
        },
        {
          "id": "w9d6",
          "week": 9,
          "dow": 6,
          "track": "patterns",
          "title": "Event Sourcing + Saga + Outbox: теория под практику Atlas",
          "warmup": "Алго-разминка: повтори LCS по памяти, проговори, почему это 2D-DP, а не жадность. 10 мин.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория Event Sourcing: состояние как лог событий, проекции/read-models, replay, версионирование событий, snapshots. Записать честные минусы (эволюция схемы событий, eventual consistency проекций) и когда ES не нужен."
            },
            {
              "id": "t2",
              "text": "Теория Saga: оркестрация vs хореография, компенсирующие транзакции вместо распределённого 2PC. Набросать сагу для реального многошагового процесса в Atlas и продумать компенсации при сбое на шаге N."
            },
            {
              "id": "t3",
              "text": "Теория Outbox (добить под свою практику): почему dual-write в БД и брокер небезопасен, как transactional outbox + relay даёт at-least-once, роль идемпотентности на потребителе. Сопоставить с тем, как outbox устроен в Atlas сейчас, и записать слабые места."
            },
            {
              "id": "t4",
              "text": "Behavioral-рефлексия недели: вспомнить случай, где я повлиял на архитектурное решение (например, выбор outbox/event-driven) без формальной власти. Записать в формате Ситуация→Действие→Результат для staff-нарратива."
            }
          ],
          "reflectPrompt": "Где в Atlas мы платим цену eventual consistency, не сделав это осознанным архитектурным выбором?",
          "resources": [
            {
              "label": "microservices.io",
              "note": "Patterns: Event Sourcing, Saga, Transactional Outbox"
            },
            {
              "label": "Книга",
              "note": "Vaughn Vernon — Implementing DDD (Event Sourcing, Sagas/Process Managers)"
            }
          ]
        },
        {
          "id": "w9d7",
          "week": 9,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 10,
      "phase": 3,
      "theme": "DP advanced, профилирование, репликация БД, капстоун (старт)",
      "days": [
        {
          "id": "w10d1",
          "week": 10,
          "dow": 1,
          "track": "dsa",
          "title": "Динамика advanced: интервалы и подпоследовательности",
          "warmup": "Рекап недели: запиши формулу перехода для классической 1D-динамики (House Robber или LIS O(n^2)) по памяти за 10 мин — состояние, переход, база.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: два семейства advanced-DP. Интервальная (dp[i][j] по подотрезку, обход по длине отрезка) и DP на подпоследовательностях (LIS/LCS). Записать общий шаблон: что есть состояние, как растёт по длине, где база."
            },
            {
              "id": "t2",
              "text": "Решить LCS и LIS: LIS сначала O(n^2), потом O(n log n) через бинпоиск по хвостам. Проговорить вслух, почему patience-вариант корректен."
            },
            {
              "id": "t3",
              "text": "Решить одну интервальную задачу: Matrix Chain Multiplication или Burst Balloons. Конспект: почему обход именно по длине интервала, а не по индексам слева направо."
            }
          ],
          "reflectPrompt": "Что было труднее увидеть: само состояние DP или корректный порядок обхода, и почему?",
          "resources": [
            {
              "label": "CLRS",
              "note": "глава Dynamic Programming: matrix-chain, LCS"
            },
            {
              "label": "cp-algorithms.com",
              "note": "LIS (включая O(n log n)) и интервальная DP"
            }
          ]
        },
        {
          "id": "w10d2",
          "week": 10,
          "dow": 2,
          "track": "node",
          "title": "Профилирование Node: perf_hooks, --inspect, flame graphs",
          "warmup": "Алго-разминка: реши Kadane (Maximum Subarray) за 10 мин — повтор DP-паттерна из вчерашнего дня, проговори O(n)/O(1).",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: инструменты диагностики CPU в Node. perf_hooks (performance.now, PerformanceObserver, mark/measure), --inspect + Chrome DevTools CPU-профиль, --prof + tick-processor, генерация flame graph. Записать, какой инструмент для какого вопроса (latency функции vs горячий стек vs аллокации)."
            },
            {
              "id": "t2",
              "text": "Практика: взять реальный или синтетический горячий путь (например сериализация большого payload или CPU-bound трансформация как в обработчике timeline-события Atlas), обмерить через perf_hooks, затем снять CPU-профиль через --inspect и найти top-3 самофункции по self-time."
            },
            {
              "id": "t3",
              "text": "Сделать: построить flame graph по этому пути, отметить самый широкий фрейм. Записать вывод — где время реально тратится против того, где ты думал до замера."
            },
            {
              "id": "t4",
              "text": "Конспект: чек-лист «как я подхожу к перф-инциденту в проде» — порядок шагов от метрики p99 до flame graph, чтобы не оптимизировать вслепую."
            }
          ],
          "reflectPrompt": "Где замер противоречил моей интуиции о том, что было узким местом?",
          "resources": [
            {
              "label": "Node docs",
              "note": "perf_hooks (Performance measurement APIs)"
            },
            {
              "label": "Node docs",
              "note": "Diagnostics — Profiling и Flame Graphs (guide)"
            }
          ]
        },
        {
          "id": "w10d3",
          "week": 10,
          "dow": 3,
          "track": "sysdesign",
          "title": "Полный дизайн: система нотификаций + настоящий design doc",
          "warmup": "Алго-разминка: реши Merge Intervals за 10 мин — повтор паттерна на отрезках, перекликается с интервальной DP.",
          "tasks": [
            {
              "id": "t1",
              "text": "Требования и оценки: фиксировать функциональные (push/email/SMS/in-app, шаблоны, предпочтения пользователя, дедупликация) и нефункциональные (доставка, latency, всплески). Оценить QPS и хранилище на салфетке для целевого DAU."
            },
            {
              "id": "t2",
              "text": "High-level дизайн: ingestion API → очередь → воркеры по каналам → провайдеры. Проработать идемпотентность и дедуп (ключ события), ретраи с backoff, rate limiting на провайдера, fan-out на per-user предпочтения. Нарисовать схему."
            },
            {
              "id": "t3",
              "text": "Написать настоящий design doc (1.5–2 стр.) по структуре: контекст и цели, требования, оценки, дизайн с диаграммой, ключевые решения и trade-offs, режимы отказа, открытые вопросы. Это артефакт, а не черновик в голове."
            },
            {
              "id": "t4",
              "text": "Записать 3 самых спорных trade-off (at-least-once vs at-most-once на канал, синхронный vs батч fan-out, единая очередь vs очередь на канал) и аргументы за выбранный вариант."
            }
          ],
          "reflectPrompt": "Какое из принятых решений я хуже всего смогу защитить под напором, и какого факта мне для этого не хватает?",
          "resources": [
            {
              "label": "Книга",
              "note": "Designing Data-Intensive Applications — messaging, доставка сообщений"
            },
            {
              "label": "Google",
              "note": "Design Docs at Google (структура технического дизайн-документа)"
            }
          ]
        },
        {
          "id": "w10d4",
          "week": 10,
          "dow": 4,
          "track": "js",
          "title": "Глубокие edge-cases: coercion, equality, числа и точность",
          "warmup": "Алго-разминка: реши Two Sum по памяти за 8 мин — поддержка хеш-паттерна.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: абстрактные алгоритмы приведения (ToPrimitive, ToNumber, ToString), == против === и SameValueZero (как в Set/Map/includes) против Object.is. Записать таблицу ловушек: NaN, +0/-0, null vs undefined в ==, [] == ![]."
            },
            {
              "id": "t2",
              "text": "Практика: предсказать результат 12–15 коварных выражений (coercion, сравнения, +/* со смешанными типами) на бумаге, затем проверить в REPL. Для каждой ошибки записать, какой именно шаг алгоритма ты пропустил."
            },
            {
              "id": "t3",
              "text": "Числа и точность: почему 0.1 + 0.2 !== 0.3 (IEEE 754 double), что такое Number.EPSILON, Number.MAX_SAFE_INTEGER и когда нужен BigInt. Записать правило для денежных/ID-значений в Atlas — где float недопустим."
            }
          ],
          "reflectPrompt": "Какой edge-case приведения реально может укусить в коде Atlas, и где он мог бы спрятаться?",
          "resources": [
            {
              "label": "MDN",
              "note": "Equality comparisons and sameness; Type coercion"
            },
            {
              "label": "ECMAScript spec",
              "note": "Abstract Operations — ToPrimitive, ToNumber"
            }
          ]
        },
        {
          "id": "w10d5",
          "week": 10,
          "dow": 5,
          "track": "db",
          "title": "PostgreSQL: репликация, партиционирование, шардинг, пулинг",
          "warmup": "Алго-разминка: реши Binary Search (или поиск по ответу) за 10 мин — повтор паттерна бинпоиска.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория репликации: streaming (физическая, по WAL) против logical (по декодированию WAL в строки). Синхронная vs асинхронная, replication lag, read replicas и где они ломают консистентность чтения. Записать, когда нужна logical (селективная репликация, мажорный апгрейд, CDC)."
            },
            {
              "id": "t2",
              "text": "Партиционирование vs шардинг: декларативное партиционирование Postgres (range/list/hash) внутри одного инстанса против шардинга по нескольким нодам. Записать, какую проблему решает каждое (размер таблицы/вакуум/прунинг против горизонтального масштаба записи) и цену шардинга (кросс-шард join, распределённые транзакции)."
            },
            {
              "id": "t3",
              "text": "Пулинг: зачем pgbouncer, режимы session/transaction/statement, как transaction-pooling ломает prepared statements и сессионные фичи. Прикинуть, какой режим подошёл бы пулу соединений сервиса вроде Atlas и почему."
            },
            {
              "id": "t4",
              "text": "Сделать: на локальной таблице (например events-таблица как у timeline) написать partition by range по дате, вставить данные в 2 партиции, через EXPLAIN убедиться в partition pruning. Записать наблюдение."
            }
          ],
          "reflectPrompt": "Что я раньше путал — партиционирование и шардинг — и где именно проходит граница между ними?",
          "resources": [
            {
              "label": "PostgreSQL docs",
              "note": "Streaming Replication; Logical Replication; Table Partitioning"
            },
            {
              "label": "pgbouncer docs",
              "note": "pooling modes (session/transaction/statement)"
            }
          ]
        },
        {
          "id": "w10d6",
          "week": 10,
          "dow": 6,
          "track": "patterns",
          "title": "Капстоун #1: event-driven сервис с outbox — старт design doc",
          "warmup": "Алго-разминка: реши Valid Parentheses (стек) за 8 мин — повтор стекового паттерна; behavioral-рефлексия отдельно ниже.",
          "tasks": [
            {
              "id": "t1",
              "text": "Выбрать домен капстоуна (например сервис нотификаций или processing-пайплайн событий timeline) и зафиксировать границы. Описать домен по DDD: агрегаты, доменные события, инварианты. Записать, что публикуется наружу как событие."
            },
            {
              "id": "t2",
              "text": "Спроектировать transactional outbox: запись бизнес-изменения и outbox-строки в одной транзакции, relay-процесс/CDC читает outbox и публикует в брокер. Проработать at-least-once + идемпотентность потребителя (dedup-ключ), упорядочивание, очистку outbox. Нарисовать схему потока."
            },
            {
              "id": "t3",
              "text": "Начать design doc капстоуна: контекст и цель, доменная модель, потоки событий, схема outbox, гарантии доставки и их обоснование, режимы отказа (падение relay, дубли, дыры в порядке), открытые вопросы. Сегодня — каркас и первые два раздела."
            },
            {
              "id": "t4",
              "text": "Behavioral-рефлексия (staff): вспомни случай в Atlas, где outbox/инцидент с доставкой потребовал твоего технического решения. Записать Ситуация→Действие→Результат как staff-нарратив влияния."
            }
          ],
          "reflectPrompt": "Где мой дизайн outbox молча предполагает порядок или exactly-once, которых на самом деле нет?",
          "resources": [
            {
              "label": "microservices.io",
              "note": "Transactional Outbox; Polling Publisher; CDC"
            },
            {
              "label": "Книга",
              "note": "Implementing Domain-Driven Design (Vaughn Vernon) — domain events"
            }
          ]
        },
        {
          "id": "w10d7",
          "week": 10,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 11,
      "phase": 3,
      "theme": "Графы advanced, type-level TS, Raft, капстоун (ядро)",
      "days": [
        {
          "id": "w11d1",
          "week": 11,
          "dow": 1,
          "track": "dsa",
          "title": "Графы advanced: Dijkstra + union-find (DSU)",
          "warmup": "Рекап BFS/DFS: за 10 мин восстанови по памяти обход графа на adjacency list и оцени O(V+E). Нарисуй мини-граф из 5 узлов.",
          "tasks": [
            {
              "id": "t1",
              "text": "Теория: Dijkstra на бинарной куче (priority queue), почему не работает с отрицательными рёбрами, сложность O((V+E) log V). Записать инвариант «извлечённый узел финализирован»."
            },
            {
              "id": "t2",
              "text": "Реализовать Dijkstra на TS поверх min-heap (или массива с extract-min) для взвешенного графа; прогнать на 1 задаче типа Network Delay Time, проговорить вслух разбор."
            },
            {
              "id": "t3",
              "text": "Изучить и закодить Union-Find с path compression и union by rank; решить задачу на компоненты связности (Number of Provinces / Redundant Connection)."
            },
            {
              "id": "t4",
              "text": "Конспект: когда Dijkstra, когда BFS (невзвешенный), когда DSU (динамическая связность, циклы, Kruskal). Привязать к реальному: граф зависимостей шагов AI-воркфлоу в Atlas."
            }
          ],
          "reflectPrompt": "В какой задаче ты бы перепутал Dijkstra и BFS и какой признак графа сразу подсказывает правильный выбор?",
          "resources": [
            {
              "label": "CLRS",
              "note": "Глава Single-Source Shortest Paths (Dijkstra) и Data Structures for Disjoint Sets"
            },
            {
              "label": "Competitive Programmer's Handbook (Laaksonen)",
              "note": "Разделы Shortest paths и Union-Find"
            }
          ]
        },
        {
          "id": "w11d2",
          "week": 11,
          "dow": 2,
          "track": "ts",
          "title": "Type-level мини-проект: типобезопасный query-билдер на типах",
          "warmup": "Алго-разминка: за 15 мин повтори паттерн two pointers на 1 лёгкой задаче (Valid Palindrome или Merge Sorted Array), проговори инвариант указателей.",
          "tasks": [
            {
              "id": "t1",
              "text": "Повторить инструменты type-level: generics с constraints, conditional types, infer, mapped types, template literal types. Записать мини-шпаргалку «что для чего»."
            },
            {
              "id": "t2",
              "text": "Спроектировать и реализовать типобезопасный билдер: цепочка .select().where().build(), где каждый шаг сужает тип результата (накопление выбранных полей через дженерик-аккумулятор). Добиться, чтобы невалидное поле было ошибкой компиляции."
            },
            {
              "id": "t3",
              "text": "Написать набор type-tests (через ожидаемые ошибки // @ts-expect-error и проверки Equal<A,B>), покрывающих happy path и 2 невалидных случая."
            },
            {
              "id": "t4",
              "text": "Конспект: где type-level магия оправдана, а где это accidental complexity и лучше runtime-валидация (zod). Привязать к Atlas: стоит ли типизировать схему событий outbox на уровне типов."
            }
          ],
          "reflectPrompt": "Какой кусок твоего билдера дал самую непонятную ошибку компилятора и как бы ты упростил типы, чтобы сообщение стало читаемым?",
          "resources": [
            {
              "label": "TypeScript Handbook",
              "note": "Разделы Conditional Types, Mapped Types, Template Literal Types"
            },
            {
              "label": "type-challenges (репозиторий)",
              "note": "Medium/Hard задачи на conditional и template literal types"
            }
          ]
        },
        {
          "id": "w11d3",
          "week": 11,
          "dow": 3,
          "track": "sysdesign",
          "title": "Полный дизайн: distributed rate limiter",
          "warmup": "Алго-разминка: за 15 мин повтори sliding window на 1 задаче (Longest Substring Without Repeating Characters) — тот же паттерн окна, что в rate limiting.",
          "tasks": [
            {
              "id": "t1",
              "text": "Разобрать алгоритмы: token bucket, leaky bucket, fixed window, sliding window log, sliding window counter. Записать trade-off по точности, памяти и всплескам (burst)."
            },
            {
              "id": "t2",
              "text": "Спроектировать распределённый rate limiter на Redis: где хранить счётчики, атомарность через Lua-скрипт, что делать при недоступности Redis (fail-open vs fail-closed), консистентность между инстансами."
            },
            {
              "id": "t3",
              "text": "Нарисовать end-to-end дизайн: уровни (edge/gateway/per-service), ключи лимитов (user/IP/API-key/tenant), ответ 429 + заголовки Retry-After/X-RateLimit-*, наблюдаемость."
            },
            {
              "id": "t4",
              "text": "Конспект: как бы ты добавил per-tenant rate limiting перед очередями Atlas, чтобы один арендатор не засыпал воркеры; какой алгоритм выбрал и почему."
            }
          ],
          "reflectPrompt": "Какой из режимов отказа Redis (fail-open или fail-closed) ты выбрал для своего дизайна и какой инцидент этот выбор может породить?",
          "resources": [
            {
              "label": "System Design Interview (Alex Xu), том 1",
              "note": "Глава Design a Rate Limiter"
            },
            {
              "label": "Redis docs",
              "note": "Atomic scripting с EVAL/Lua, INCR с EXPIRE"
            }
          ]
        },
        {
          "id": "w11d4",
          "week": 11,
          "dow": 4,
          "track": "node",
          "title": "Graceful shutdown: сигналы и надёжность воркеров",
          "warmup": "Алго-разминка: за 15 мин повтори очередь/стек на 1 задаче (Implement Queue using Stacks или валидация скобок), проговори амортизацию операций.",
          "tasks": [
            {
              "id": "t1",
              "text": "Изучить жизненный цикл процесса: SIGTERM vs SIGINT vs SIGKILL, порядок при docker stop / k8s (preStop hook + terminationGracePeriodSeconds), почему KILL нельзя перехватить. Записать последовательность шагов корректного завершения."
            },
            {
              "id": "t2",
              "text": "Реализовать graceful shutdown для воркера на TS: перестать брать новые задачи из очереди, дождаться in-flight с таймаутом, закрыть пулы (PG, Redis), снять подписки, затем exit. Добавить hard-timeout с принудительным выходом."
            },
            {
              "id": "t3",
              "text": "Разобрать надёжность: что с задачей, которую воркер не успел доделать (visibility timeout / повторная доставка), идемпотентность повторов, защита от двойной обработки. Связать с at-least-once семантикой."
            },
            {
              "id": "t4",
              "text": "Конспект: чек-лист graceful shutdown для drain-воркера Atlas (outbox) — что закрывать и в каком порядке, какой реальный инцидент случается без дренажа (потеря/дубликат сообщения при деплое)."
            }
          ],
          "reflectPrompt": "В каком месте твоего drain-воркера потеря сигнала или слишком короткий grace period приведёт к потере или дублю сообщения?",
          "resources": [
            {
              "label": "Node.js docs",
              "note": "Process: signal events (SIGTERM/SIGINT), process.exit, beforeExit"
            },
            {
              "label": "Kubernetes docs",
              "note": "Pod lifecycle: termination, preStop hook, terminationGracePeriodSeconds"
            }
          ]
        },
        {
          "id": "w11d5",
          "week": 11,
          "dow": 5,
          "track": "distsys",
          "title": "Консенсус: Raft вглубь (+ интуиция Paxos)",
          "warmup": "Алго-разминка: за 15 мин повтори бинарный поиск по ответу на 1 задаче (например поиск в повёрнутом массиве) — пригодится интуиция про инварианты и границы, как в логе Raft.",
          "tasks": [
            {
              "id": "t1",
              "text": "Разобрать Raft по подсистемам: leader election (terms, randomized timeouts, split vote), log replication (AppendEntries, matchIndex/nextIndex), safety (commit только записей текущего терма). Записать ключевые инварианты."
            },
            {
              "id": "t2",
              "text": "Проиграть на бумаге сценарий: лидер падает с незакоммиченными записями, новый лидер с более полным логом перезатирает хвост фолловера. Зарисовать состояние логов до/после."
            },
            {
              "id": "t3",
              "text": "Сжатая интуиция Paxos vs Raft: почему Raft проще для понимания (understandability как цель дизайна), роль кворума большинства, зачем нужен persistent state перед ответом. Записать различия в 5 пунктах."
            },
            {
              "id": "t4",
              "text": "Конспект: где Atlas неявно полагается на консенсус/кворум (выбор лидера у Postgres-репликации, leader election в Redis Sentinel/etcd-координация), и какие гарантии это даёт твоему outbox при failover."
            }
          ],
          "reflectPrompt": "Почему Raft не позволяет коммитить запись предыдущего терма напрямую по числу реплик, и какой баг это предотвращает?",
          "resources": [
            {
              "label": "In Search of an Understandable Consensus Algorithm (Raft paper, Ongaro & Ousterhout)",
              "note": "Разделы leader election, log replication, safety"
            },
            {
              "label": "raft.github.io",
              "note": "Визуализация Raft и список реализаций"
            }
          ]
        },
        {
          "id": "w11d6",
          "week": 11,
          "dow": 6,
          "track": "patterns",
          "title": "Капстоун #2: ядро outbox + drain worker + идемпотентность",
          "warmup": "Алго-разминка: за 15 мин повтори хеш-множество на 1 задаче (Contains Duplicate / First Unique Character) — прямая интуиция для дедупликации по идемпотентному ключу.",
          "tasks": [
            {
              "id": "t1",
              "text": "Спроектировать схему: таблица outbox (id, aggregate_id, type, payload, status, created_at, attempts, available_at) и таблица processed_messages (idempotency_key, обработано) для дедупликации потребителя. Записать индексы под выборку pending."
            },
            {
              "id": "t2",
              "text": "Реализовать запись в outbox в той же транзакции, что и доменное изменение (transactional outbox), чтобы не было dual-write. Покрыть тестом инвариант «или оба, или ничего»."
            },
            {
              "id": "t3",
              "text": "Реализовать drain worker: SELECT ... FOR UPDATE SKIP LOCKED батчами, публикация, отметка done, backoff на ошибках через available_at; обеспечить at-least-once и идемпотентность на стороне потребителя по ключу."
            },
            {
              "id": "t4",
              "text": "Прогнать сбой: упасть после публикации, но до отметки done — убедиться, что повтор не создаёт дубль эффекта (благодаря processed_messages). Законспектировать, как это закрывает реальный инцидент дублей timeline в Atlas."
            }
          ],
          "reflectPrompt": "Что в твоём ядре ломается при двух drain-воркерах одновременно, и спасает ли только SKIP LOCKED или нужна ещё идемпотентность у потребителя?",
          "resources": [
            {
              "label": "microservices.io (Chris Richardson)",
              "note": "Паттерны Transactional Outbox и Polling Publisher"
            },
            {
              "label": "PostgreSQL docs",
              "note": "SELECT FOR UPDATE SKIP LOCKED, поведение блокировок"
            }
          ]
        },
        {
          "id": "w11d7",
          "week": 11,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 12,
      "phase": 3,
      "theme": "Hard-задачи, распределённые транзакции, наблюдаемость, капстоун (тесты)",
      "days": [
        {
          "id": "w12d1",
          "week": 12,
          "dow": 1,
          "track": "dsa",
          "title": "Смешанные hard-задачи: разбор ради глубины, не скорость",
          "warmup": "Прогон due-повторов из spaced-repetition: восстанови по памяти идею двух любых паттернов (например, монотонный стек и бинпоиск по ответу) и где они применимы.",
          "tasks": [
            {
              "id": "t1",
              "text": "Изучить: взять 1 hard-задачу на динамику/интервалы (например, Burst Balloons или Maximum Profit in Job Scheduling) и разобрать без таймера — сначала наивное решение, потом оптимизация, проговаривая переход состояний."
            },
            {
              "id": "t2",
              "text": "Сделать: взять 1 hard-задачу на графы (например, Word Ladder II или Alien Dictionary) и довести до рабочего кода, явно выписав инвариант и порядок обхода."
            },
            {
              "id": "t3",
              "text": "Записать: для обеих задач — что было «ключевым озарением», какой паттерн распознан поздно и какой сигнал в условии должен был навести на него раньше."
            }
          ],
          "reflectPrompt": "Какой именно сигнал в условии hard-задачи я научился сегодня распознавать как «здесь нужен этот паттерн»?",
          "resources": [
            {
              "label": "Книга",
              "note": "Cracking the Coding Interview — главы про DP и графы (как справочник по паттернам, не для зубрёжки)"
            },
            {
              "label": "CP-Algorithms",
              "note": "cp-algorithms.com — разделы Dynamic Programming, Graph"
            }
          ]
        },
        {
          "id": "w12d2",
          "week": 12,
          "dow": 2,
          "track": "js",
          "title": "Консолидация JS: самопроверка по event loop, замыканиям, прототипам",
          "warmup": "Лёгкая алго-разминка: реши Valid Parentheses (стек) по памяти, проговори сложность.",
          "tasks": [
            {
              "id": "t1",
              "text": "Самопроверка вслепую: на чистом листе восстанови по памяти карту JS-движка — call stack, microtask vs macrotask очереди, порядок при смешении Promise/setTimeout/queueMicrotask. Затем сверь с реальным запуском сниппета в Node."
            },
            {
              "id": "t2",
              "text": "Изучить пробелы: где при самопроверке сбился (this/new, prototype chain, value vs reference, GC mark-and-sweep) — перечитай именно эти разделы и закрой дыру одним мини-экспериментом в REPL."
            },
            {
              "id": "t3",
              "text": "Записать: список из 3–5 тем JS, которые всё ещё «плывут», с пометкой в очередь повторов; сформулируй для каждой один проверочный вопрос самому себе."
            }
          ],
          "reflectPrompt": "Какая тема JS дала наибольший разрыв между «думал, что знаю» и тем, что смог объяснить с листа?",
          "resources": [
            {
              "label": "MDN",
              "note": "Event loop; Closures; Inheritance and the prototype chain"
            },
            {
              "label": "Книга",
              "note": "You Don't Know JS — Scope & Closures; Async & Performance"
            }
          ]
        },
        {
          "id": "w12d3",
          "week": 12,
          "dow": 3,
          "track": "sysdesign",
          "title": "Design doc по своей системе (Atlas activity-timeline): полноценный черновик",
          "warmup": "Лёгкая алго-разминка: реши Merge Intervals, проговори, почему сортировка обязательна.",
          "tasks": [
            {
              "id": "t1",
              "text": "Изучить структуру: разбери канонический шаблон design doc (Context/Goals, Non-goals, Proposed design, Alternatives considered, Trade-offs, Risks, Rollout). Выпиши, чего не хватало в твоих прошлых RFC."
            },
            {
              "id": "t2",
              "text": "Сделать: напиши настоящий черновик design doc по timeline/outbox из Atlas — реальные требования, оценки нагрузки, схема данных, путь записи и чтения, выбор очереди, обработка отказов. Не теоретический кейс, а твоя система."
            },
            {
              "id": "t3",
              "text": "Записать раздел «Alternatives & Trade-offs»: минимум 2 отвергнутых варианта (например, синхронная запись без outbox, или CDC вместо outbox) с явной причиной отказа — это staff-навык защиты решения."
            }
          ],
          "reflectPrompt": "Какое архитектурное решение в Atlas я раньше принимал «по умолчанию», но теперь не смог бы обосновать в design doc без новых аргументов?",
          "resources": [
            {
              "label": "Google",
              "note": "Design Docs at Google (раздел в книге Software Engineering at Google)"
            },
            {
              "label": "StaffEng",
              "note": "staffeng.com — про написание и защиту RFC/design docs"
            }
          ]
        },
        {
          "id": "w12d4",
          "week": 12,
          "dow": 4,
          "track": "node",
          "title": "Консолидация Node: самопроверка по event loop, стримам, диагностике",
          "warmup": "Лёгкая алго-разминка: реши Top K Frequent Elements (хеш + куча), проговори выбор структуры.",
          "tasks": [
            {
              "id": "t1",
              "text": "Самопроверка вслепую: восстанови по памяти фазы event loop Node (timers/pending/poll/check/close), где живут microtasks, что делает thread pool libuv. Сверь, запустив сниппет с setImmediate vs setTimeout vs process.nextTick."
            },
            {
              "id": "t2",
              "text": "Изучить пробелы: прогони мини-практику по слабому месту — backpressure в стримах (pipeline + объект, который медленно пишет), либо AsyncLocalStorage для контекста запроса; закрой именно ту тему, что поплыла на самопроверке."
            },
            {
              "id": "t3",
              "text": "Записать: чек-лист «как я диагностирую утечку памяти / залипший event loop в проде» (perf_hooks, --inspect, heap snapshot, флейм-граф) — привяжи к реальному инциденту в Atlas, если был."
            }
          ],
          "reflectPrompt": "Что из внутренностей Node я уверенно объясню коллеге, а где всё ещё нужен «фокус на удачу»?",
          "resources": [
            {
              "label": "Node docs",
              "note": "The Node.js Event Loop; Stream (backpressure, pipeline); AsyncLocalStorage"
            },
            {
              "label": "libuv",
              "note": "docs.libuv.org — Thread pool work scheduling"
            }
          ]
        },
        {
          "id": "w12d5",
          "week": 12,
          "dow": 5,
          "track": "distsys",
          "title": "Распределённые транзакции: 2PC, саги, семантики доставки и иллюзия exactly-once",
          "warmup": "Лёгкая алго-разминка: реши Course Schedule (топосортировка) — связь с порядком шагов саги.",
          "tasks": [
            {
              "id": "t1",
              "text": "Изучить: 2PC (фазы prepare/commit, чем плох — блокировка при отказе координатора) vs сага (оркестрация vs хореография, компенсирующие транзакции). Выпиши, когда какой подход и почему распределённый ACID-коммит обычно избегают."
            },
            {
              "id": "t2",
              "text": "Изучить + связать: семантики доставки (at-most-once / at-least-once / «exactly-once») и почему end-to-end exactly-once — иллюзия; реальный рецепт = at-least-once доставка + идемпотентный консьюмер + дедупликация. Привяжи к outbox в Atlas: какую семантику он даёт на самом деле."
            },
            {
              "id": "t3",
              "text": "Записать: спроектируй на бумаге сагу для реального бизнес-процесса из Atlas (например, событие timeline → нотификация → внешний вызов) с шагами, компенсациями и точкой, где нужна идемпотентность/дедуп по ключу."
            }
          ],
          "reflectPrompt": "Где в Atlas мы по факту полагаемся на «exactly-once», хотя реально это at-least-once + идемпотентность — и что сломается, если идемпотентность убрать?",
          "resources": [
            {
              "label": "Книга",
              "note": "Designing Data-Intensive Applications (Kleppmann) — гл. 9, распределённые транзакции и консенсус"
            },
            {
              "label": "Microservices",
              "note": "microservices.io — паттерны Saga и Transactional Outbox"
            }
          ]
        },
        {
          "id": "w12d6",
          "week": 12,
          "dow": 6,
          "track": "patterns",
          "title": "Капстоун #3: тесты + наблюдаемость сервиса (метрики, логи, трейсы)",
          "warmup": "Лёгкая алго-разминка: реши LRU Cache (hashmap + двусвязный список) — заодно вспомни, как кэш влияет на наблюдаемые латентности.",
          "tasks": [
            {
              "id": "t1",
              "text": "Сделать (тесты): покрой капстоун-сервис тестами на критических путях — юнит на доменную логику и интеграционный тест на outbox/обработку события, включая идемпотентность (повторная доставка не дублирует эффект)."
            },
            {
              "id": "t2",
              "text": "Сделать (наблюдаемость): добавь 3 столпа — структурные логи с correlation/trace id, метрики в стиле RED (rate/errors/duration) на ключевой эндпоинт и трейс хотя бы одного сквозного пути запроса. Сформулируй 1 SLI и черновой SLO."
            },
            {
              "id": "t3",
              "text": "Записать + рефлексия лидерства: короткий «runbook» — что мониторить, какой алерт по error budget, как читать трейс при инциденте. Behavioral: вспомни случай, где наблюдаемость (или её отсутствие) решила исход инцидента — запиши Ситуация→Действие→Результат."
            }
          ],
          "reflectPrompt": "Если бы этот сервис упал в 3 ночи, хватило бы текущих метрик/логов/трейсов, чтобы понять причину без чтения кода — и чего именно не хватает?",
          "resources": [
            {
              "label": "Google SRE",
              "note": "Site Reliability Engineering — главы Monitoring, SLO, error budgets"
            },
            {
              "label": "OpenTelemetry",
              "note": "opentelemetry.io — концепции traces, metrics, logs"
            }
          ]
        },
        {
          "id": "w12d7",
          "week": 12,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    },
    {
      "num": 13,
      "phase": 3,
      "theme": "Консолидация, ретроспектива, завершение капстоуна",
      "days": [
        {
          "id": "w13d1",
          "week": 13,
          "dow": 1,
          "track": "dsa",
          "title": "Прогон due-повторов + добивка слабых паттернов",
          "warmup": "Открой свой трекер интервального повторения и выпиши 3 due-задачи; для каждой за 60 сек проговори вслух паттерн и сложность по памяти, не открывая решение.",
          "tasks": [
            {
              "id": "t1",
              "text": "Прогнать все due-повторы из своего spaced-repetition списка: пере-решить 3-4 задачи, помеченные как «забыл/тормозил». Цель — узнавание паттерна за 30-60 сек, а не код наизусть."
            },
            {
              "id": "t2",
              "text": "Выбрать 1 системно слабый паттерн за фазу (по статистике ошибок — например two pointers, monotonic stack или binary search по ответу) и решить 2 свежие задачи именно на него, проговаривая инвариант цикла вслух."
            },
            {
              "id": "t3",
              "text": "Обновить конспект-шпаргалку «триггеры паттернов»: для каждого добитого паттерна записать 1 строку «когда вижу X в условии — беру Y». Перенести освоенные задачи на больший интервал повтора."
            }
          ],
          "reflectPrompt": "Какой паттерн всё ещё не «щёлкает» с первого взгляда и что конкретно мешает его опознать в условии?",
          "resources": [
            {
              "label": "NeetCode",
              "note": "Roadmap — карта паттернов для ревизии слабых мест"
            },
            {
              "label": "Grokking the Coding Interview",
              "note": "Каталог паттернов и их триггеров в условии"
            }
          ]
        },
        {
          "id": "w13d2",
          "week": 13,
          "dow": 2,
          "track": "ts",
          "title": "Систематизация заметок по TypeScript за фазу",
          "warmup": "Алго-разминка: за 10-15 мин пере-реши 1 лёгкую задачу на хеш-таблицу или two pointers по памяти, чтобы поддержать ежедневный ритм.",
          "tasks": [
            {
              "id": "t1",
              "text": "Собрать все разрозненные TS-заметки фазы в один структурированный документ по разделам: система типов, generics/constraints, conditional + mapped types, narrowing, утилитные типы. Выкинуть дубли и устаревшее."
            },
            {
              "id": "t2",
              "text": "Для 3 самых неочевидных тем (например variance, infer, discriminated unions) написать собственный минимальный пример на 5-10 строк, который доказывает, что понял механику, а не запомнил формулировку."
            },
            {
              "id": "t3",
              "text": "Связать с реальностью Atlas: записать 2-3 места в кодовой базе (например типизация событий timeline, payload-ов outbox), где строгие типы реально ловили бы баги, и оформить как итоговый вывод фазы."
            }
          ],
          "reflectPrompt": "Какая TS-концепция из заметок до сих пор держится только на «магии», а не на понимании того, что делает компилятор?",
          "resources": [
            {
              "label": "TypeScript Handbook",
              "note": "Разделы Generics, Conditional Types, Narrowing"
            },
            {
              "label": "Type Challenges",
              "note": "Репозиторий для самопроверки понимания типов"
            }
          ]
        },
        {
          "id": "w13d3",
          "week": 13,
          "dow": 3,
          "track": "sysdesign",
          "title": "Консолидация дизайн-разборов фазы",
          "warmup": "Алго-разминка: за 10-15 мин повтори паттерн скользящего окна на 1 короткой задаче, чтобы не терять ежедневный навык.",
          "tasks": [
            {
              "id": "t1",
              "text": "Перечитать все разборы системного дизайна за фазу и свести их в одну таблицу: задача → ключевые ограничения → принятые трейдоффы → что бы изменил сейчас. Найти повторяющиеся темы (партиционирование, идемпотентность, backpressure)."
            },
            {
              "id": "t2",
              "text": "Выбрать 1 разбор со слабой аргументацией и переписать секцию трейдоффов заново: явно сформулировать, какой нефункциональный атрибут (latency, consistency, cost) приносится в жертву ради какого."
            },
            {
              "id": "t3",
              "text": "Привязать к Atlas: на основе консолидации написать 1 короткую заметку «как бы я спроектировал timeline + outbox с нуля сегодня» и сравнить с текущей реализацией — что совпало, что упустил."
            }
          ],
          "reflectPrompt": "В каком из своих дизайн-разборов трейдоффы были названы, но не обоснованы цифрами или сценарием нагрузки?",
          "resources": [
            {
              "label": "Designing Data-Intensive Applications",
              "note": "Главы про репликацию, партиционирование, consistency для сверки выводов"
            },
            {
              "label": "System Design Primer",
              "note": "Чек-лист нефункциональных требований и трейдоффов"
            }
          ]
        },
        {
          "id": "w13d4",
          "week": 13,
          "dow": 4,
          "track": "node",
          "title": "Систематизация заметок по Node.js за фазу",
          "warmup": "Алго-разминка: за 10-15 мин пере-реши 1 лёгкую задачу на стек или очередь по памяти — поддержать ежедневный ритм перед основным блоком.",
          "tasks": [
            {
              "id": "t1",
              "text": "Свести все Node-заметки фазы в единый документ по разделам: event loop и фазы, потоки/backpressure, worker threads, управление памятью и GC, обработка ошибок и graceful shutdown. Убрать дубликаты."
            },
            {
              "id": "t2",
              "text": "Для 2-3 самых тонких тем (порядок microtasks vs macrotasks, backpressure в pipe, утечки через незакрытые ресурсы) написать минимальный воспроизводимый сниппет и проверить поведение запуском, а не по памяти."
            },
            {
              "id": "t3",
              "text": "Привязать к Atlas: записать 2 реальных места (обработка очередей, воркеры AI-воркфлоу), где знание event loop или backpressure объясняет наблюдавшийся инцидент или latency-спайк, и оформить как вывод фазы."
            }
          ],
          "reflectPrompt": "Какое поведение рантайма Node ты раньше принимал на веру, а сегодня смог проверить экспериментом и удивился результату?",
          "resources": [
            {
              "label": "Node.js docs",
              "note": "Guides — The event loop, Backpressuring in Streams"
            },
            {
              "label": "Node.js docs",
              "note": "Diagnostics — memory, worker_threads"
            }
          ]
        },
        {
          "id": "w13d5",
          "week": 13,
          "dow": 5,
          "track": "distsys",
          "title": "Консолидация фундамента: распределённые системы и БД",
          "warmup": "Алго-разминка: за 10-15 мин повтори бинарный поиск (включая поиск границы) на 1 задаче — держим ежедневный алго-ритм.",
          "tasks": [
            {
              "id": "t1",
              "text": "Собрать заметки фазы по распределёнке и БД в одну карту понятий: доставка сообщений (at-least/exactly-once), идемпотентность, outbox/CDC, изоляция транзакций и MVCC в PostgreSQL, индексы и блокировки. Отметить связи между темами."
            },
            {
              "id": "t2",
              "text": "Для 2 ключевых понятий (например уровни изоляции и аномалии, exactly-once как иллюзия поверх at-least-once + дедупликация) написать своими словами объяснение «как будто коллеге на ревью», без копирования из источника."
            },
            {
              "id": "t3",
              "text": "Привязать к Atlas: разобрать один реальный инцидент через призму фундамента — например дубли из-за ретраев outbox или гонка на уровне READ COMMITTED — и записать, какое теоретическое понятие объясняет корневую причину."
            }
          ],
          "reflectPrompt": "Какой распределённый трейдофф (consistency vs availability, latency vs durability) ты раньше формулировал лозунгами, а теперь можешь объяснить через конкретный механизм?",
          "resources": [
            {
              "label": "Designing Data-Intensive Applications",
              "note": "Главы Transactions, Consistency and Consensus"
            },
            {
              "label": "PostgreSQL docs",
              "note": "Concurrency Control — Transaction Isolation, MVCC"
            }
          ]
        },
        {
          "id": "w13d6",
          "week": 13,
          "dow": 6,
          "track": "patterns",
          "title": "Капстоун wrap-up и ретро «что вырос, куда дальше»",
          "warmup": "Алго-разминка: за 10-15 мин пере-реши 1 ранее сложную задачу, которую закрыл в фазе, и отметь, насколько быстрее идёт сейчас — это и есть замер прогресса.",
          "tasks": [
            {
              "id": "t1",
              "text": "Довести капстоун до состояния «можно показать»: обновить README с описанием архитектуры и принятых паттернов (например outbox, event-driven обработка, разделение слоёв DDD), зафиксировать оставшиеся TODO как осознанные ограничения, а не недоделки."
            },
            {
              "id": "t2",
              "text": "Провести само-ревью капстоуна по чек-листу staff-уровня: где паттерн применён по делу, а где это лишняя сложность (привязка к simplicity-first); выписать 2-3 места, которые упростил бы или спроектировал иначе."
            },
            {
              "id": "t3",
              "text": "Написать ретро фазы по структуре: что вырос (конкретные навыки с доказательством), где остались пробелы, и 3 направления на следующую фазу с критерием «как пойму, что вырос». Сохранить как опорную точку роста к staff/principal."
            }
          ],
          "reflectPrompt": "Какой паттерн в капстоуне ты добавил из инженерного страха, а не из реальной потребности, и убрал бы его теперь во имя простоты?",
          "resources": [
            {
              "label": "Refactoring (Fowler)",
              "note": "Каталог запахов кода для само-ревью капстоуна"
            },
            {
              "label": "Staff Engineer (Will Larson)",
              "note": "Ориентиры роста для секции «куда дальше»"
            }
          ]
        },
        {
          "id": "w13d7",
          "week": 13,
          "dow": 7,
          "track": "rest",
          "title": "Разгрузка / повторы",
          "warmup": null,
          "tasks": [],
          "reflectPrompt": "Что закрепить из недели? Прогон due-повторов.",
          "resources": []
        }
      ]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = Curriculum;
if (typeof window !== 'undefined') window.Curriculum = Curriculum;
