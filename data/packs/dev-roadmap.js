'use strict';
(function (root) {
  var pack = {
  "schema": "sunrise.pack/v1",
  "id": "dev-roadmap",
  "name": {
    "en": "Dev Roadmap",
    "ru": "Dev Roadmap"
  },
  "version": "1.0.0",
  "locale": "ru",
  "settings": {
    "labels": {
      "phase": {
        "en": "Phase",
        "ru": "Фаза"
      },
      "group": {
        "en": "Week",
        "ru": "Неделя"
      },
      "groupAbbr": {
        "en": "Wk",
        "ru": "Нед"
      },
      "item": {
        "en": "Day",
        "ru": "День"
      }
    },
    "reflections": true,
    "warmups": true
  },
  "ui": {
    "phaseLabel": "フェーズ {p} · 第{w}週",
    "todayVert": "今日 · TODAY",
    "restVert": "休 · REST"
  },
  "tracks": [
    {
      "id": "dsa",
      "label": {
        "en": "Algorithms",
        "ru": "Алгоритмы"
      },
      "icon": "算"
    },
    {
      "id": "js",
      "label": {
        "en": "JavaScript",
        "ru": "JavaScript"
      },
      "icon": "JS"
    },
    {
      "id": "ts",
      "label": {
        "en": "TypeScript",
        "ru": "TypeScript"
      },
      "icon": "TS"
    },
    {
      "id": "node",
      "label": {
        "en": "Node.js",
        "ru": "Node.js"
      },
      "icon": "動"
    },
    {
      "id": "sysdesign",
      "label": {
        "en": "System Design",
        "ru": "System Design"
      },
      "icon": "設"
    },
    {
      "id": "patterns",
      "label": {
        "en": "Patterns",
        "ru": "Паттерны"
      },
      "icon": "匠"
    },
    {
      "id": "distsys",
      "label": {
        "en": "Distributed",
        "ru": "Распределённые"
      },
      "icon": "分"
    },
    {
      "id": "db",
      "label": {
        "en": "Databases",
        "ru": "Базы данных"
      },
      "icon": "庫"
    },
    {
      "id": "cs",
      "label": {
        "en": "CS Fundamentals",
        "ru": "CS-фундамент"
      },
      "icon": "基"
    }
  ],
  "phases": [
    {
      "id": "1",
      "title": {
        "en": "Foundation",
        "ru": "Фундамент"
      }
    },
    {
      "id": "2",
      "title": {
        "en": "Depth",
        "ru": "Глубина"
      }
    },
    {
      "id": "3",
      "title": {
        "en": "Synthesis and Mastery",
        "ru": "Синтез и мастерство"
      }
    }
  ],
  "groups": [
    {
      "id": "w1",
      "title": {
        "en": "Week 1",
        "ru": "Неделя 1"
      },
      "phase": "1",
      "theme": "Сложность, базовые структуры, модель исполнения JS, рантайм Node",
      "items": [
        {
          "id": "w1d1",
          "track": "dsa",
          "title": {
            "en": "Complexity + arrays + hash tables",
            "ru": "Сложность + массивы + хеш-таблицы"
          },
          "warmup": {
            "en": "Estimate O() for 3 short snippets (nested loops, hashmap lookup, binary search).",
            "ru": "Оцени O() для 3 коротких сниппетов (вложенные циклы, hashmap-lookup, бинпоиск)."
          },
          "reflectPrompt": {
            "en": "Where did you get complexity estimation wrong today, and why?",
            "ru": "Где сегодня ошибся в оценке сложности и почему?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: Big-O, amortization, how O(1)/O(log n)/O(n)/O(n log n)/O(n^2) grow. Write down the «intuition numbers».",
                "ru": "Теория: Big-O, амортизация, как растут O(1)/O(log n)/O(n)/O(n log n)/O(n^2). Записать «числа интуиции»."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Solve 2 hash-table problems: Two Sum, Contains Duplicate.",
                "ru": "Решить 2 задачи на хеш-таблицы: Two Sum, Contains Duplicate."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: when to use an array vs a set/map; cost of operations for each structure.",
                "ru": "Теория: когда массив, когда set/map; стоимость операций каждой структуры."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Big-O",
                "ru": "Big-O"
              },
              "note": {
                "en": "bigocheatsheet.com — complexity table",
                "ru": "bigocheatsheet.com — таблица сложностей"
              }
            },
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Map vs Object, Set",
                "ru": "Map vs Object, Set"
              }
            }
          ]
        },
        {
          "id": "w1d2",
          "track": "js",
          "title": {
            "en": "Execution model: contexts, scope chain, closures",
            "ru": "Модель исполнения: контексты, scope chain, замыкания"
          },
          "warmup": {
            "en": "Redo Two Sum from memory in 10 min.",
            "ru": "Two Sum повторить по памяти за 10 мин."
          },
          "reflectPrompt": {
            "en": "What about hoisting/TDZ turned out different from what you thought?",
            "ru": "Что в hoisting/TDZ оказалось не так, как я думал?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: execution context, scope chain, hoisting, TDZ. Draw the context stack for an example.",
                "ru": "Теория: execution context, scope chain, hoisting, TDZ. Нарисовать стек контекстов для примера."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: implement a counter and memoize using a closure.",
                "ru": "Практика: реализовать счётчик и memoize через замыкание."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: lexical closures and memory retention — which variables get captured and when this leads to leaks.",
                "ru": "Теория: лексическое замыкание и удержание памяти — какие переменные захватываются и когда это ведёт к утечкам."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Closures; Scope; Hoisting",
                "ru": "Closures; Scope; Hoisting"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "You Don't Know JS: Scope & Closures",
                "ru": "You Don't Know JS: Scope & Closures"
              }
            }
          ]
        },
        {
          "id": "w1d3",
          "track": "sysdesign",
          "title": {
            "en": "Intro to System Design: language and metrics",
            "ru": "Введение в System Design: язык и метрики"
          },
          "warmup": {
            "en": "Redo Contains Duplicate in 8 min.",
            "ru": "Contains Duplicate повторить за 8 мин."
          },
          "reflectPrompt": {
            "en": "Which estimate could you not justify right now?",
            "ru": "Какую оценку я бы не смог обосновать прямо сейчас?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: latency vs throughput, p50/p95/p99, latency numbers (RAM/SSD/network/datacenter).",
                "ru": "Теория: latency vs throughput, p50/p95/p99, числа латентности (RAM/SSD/сеть/датацентр)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Back-of-the-napkin exercise: estimate QPS and storage for a service with 1M DAU.",
                "ru": "Упражнение «на салфетке»: оценить QPS и хранилище для сервиса на 1M DAU."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: the 4 steps for breaking down a problem (requirements → estimates → high-level → bottlenecks).",
                "ru": "Теория: 4 шага разбора задачи (требования → оценки → high-level → узкие места)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Numbers",
                "ru": "Numbers"
              },
              "note": {
                "en": "Latency numbers every programmer should know",
                "ru": "Latency numbers every programmer should know"
              }
            }
          ]
        },
        {
          "id": "w1d4",
          "track": "node",
          "title": {
            "en": "The Node runtime: V8 + libuv + bindings",
            "ru": "Рантайм Node: V8 + libuv + bindings"
          },
          "warmup": {
            "en": "Estimate O() for two Two Sum solutions (brute vs hashmap).",
            "ru": "Оценить O() для двух решений Two Sum (brute vs hashmap)."
          },
          "reflectPrompt": {
            "en": "What exactly does libuv do that V8 doesn't?",
            "ru": "Что именно делает libuv, чего не делает V8?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: what Node is made of (V8, libuv, C++ bindings, core JS). What libuv does.",
                "ru": "Теория: из чего состоит Node (V8, libuv, C++ bindings, core JS). Что делает libuv."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: run a script with sync vs async fs and measure what exactly blocks the event loop.",
                "ru": "Практика: запустить скрипт с sync vs async fs и замерить, что именно блокирует event loop."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how a Node process differs from «just JS in a browser».",
                "ru": "Теория: чем Node-процесс отличается от «просто JS в браузере»."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "The Node.js Event Loop (guide)",
                "ru": "The Node.js Event Loop (guide)"
              }
            },
            {
              "label": {
                "en": "libuv",
                "ru": "libuv"
              },
              "note": {
                "en": "docs.libuv.org — Design overview",
                "ru": "docs.libuv.org — Design overview"
              }
            }
          ]
        },
        {
          "id": "w1d5",
          "track": "cs",
          "title": {
            "en": "Networking (basics): TCP/IP, TCP handshake, HTTP/1.1",
            "ru": "Сети (база): TCP/IP, TCP-handshake, HTTP/1.1"
          },
          "warmup": {
            "en": "Solve Valid Anagram (hash table).",
            "ru": "Решить Valid Anagram (хеш-таблица)."
          },
          "reflectPrompt": {
            "en": "What happens «on the wire» from entering a URL to the first byte of the response?",
            "ru": "Что происходит «по проводу» от ввода URL до первого байта ответа?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the TCP/IP stack, 3-way handshake, what a port/socket is, HTTP/1.1 over TCP.",
                "ru": "Теория: стек TCP/IP, 3-way handshake, что такое порт/сокет, HTTP/1.1 поверх TCP."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: `curl -v` to any site — break down the output (DNS→TCP→TLS→HTTP).",
                "ru": "Практика: `curl -v` к любому сайту — разобрать вывод (DNS→TCP→TLS→HTTP)."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: why keep-alive matters; head-of-line blocking in HTTP/1.1.",
                "ru": "Теория: почему keep-alive важен; head-of-line blocking в HTTP/1.1."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Overview of HTTP; Evolution of HTTP",
                "ru": "Overview of HTTP; Evolution of HTTP"
              }
            }
          ]
        },
        {
          "id": "w1d6",
          "track": "patterns",
          "title": {
            "en": "SOLID in TS + weekly leadership reflection",
            "ru": "SOLID на TS + еженедельная рефлексия лидерства"
          },
          "warmup": {
            "en": "Redo any problem from the week from memory.",
            "ru": "Повторить любую задачу недели по памяти."
          },
          "reflectPrompt": {
            "en": "Which SOLID principle do you violate most often in real code?",
            "ru": "Какой принцип SOLID я чаще всего нарушаю в реальном коде?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the 5 SOLID principles, with one idiomatic TS example of violating/fixing each.",
                "ru": "Теория: 5 принципов SOLID, по одному идиоматичному TS-примеру нарушения/исправления."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Theory: SRP and DIP — how to spot a violation from a class/module signature and which refactoring eliminates it (extracting a dependency, inverting via an interface).",
                "ru": "Теория: SRP и DIP — как распознать нарушение по сигнатуре класса/модуля и какой рефакторинг его устраняет (выделение зависимости, инверсия через интерфейс)."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Behavioral reflection: recall a case where you influenced a decision without formal authority. Write down Situation → Action → Result.",
                "ru": "Behavioral-рефлексия: вспомнить случай, где ты влиял на решение без формальной власти. Записать Ситуация→Действие→Результат."
              },
              "guidance": {
                "en": "Strong answer: you influence through data and a prototype, not through status. First align stakeholders 1:1, frame the solution as THEIR goal, show a small PoC/benchmark, and put it in writing (RFC/ADR). Staff markers: alternatives and their downsides are analyzed, the decision is reversible, and the team has taken ownership of the idea.",
                "ru": "Сильный ответ: влияешь через данные и прототип, а не через статус. Сначала выровнять стейкхолдеров 1:1, подать решение как ИХ цель, показать небольшой PoC/бенчмарк, зафиксировать письменно (RFC/ADR). Staff-маркеры: разобраны альтернативы и их минусы, решение обратимо, команда присвоила идею себе."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Refactoring",
                "ru": "Refactoring"
              },
              "note": {
                "en": "refactoring.guru — SOLID",
                "ru": "refactoring.guru — SOLID"
              }
            },
            {
              "label": {
                "en": "Staff",
                "ru": "Staff"
              },
              "note": {
                "en": "StaffEng.com — archetypes",
                "ru": "StaffEng.com — архетипы"
              }
            }
          ]
        },
        {
          "id": "w1d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What from this week should you cement?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w2",
      "title": {
        "en": "Week 2",
        "ru": "Неделя 2"
      },
      "phase": "1",
      "theme": "JS-прототипы, фазы event loop в Node, основы ОС, порождающие паттерны",
      "items": [
        {
          "id": "w2d1",
          "track": "dsa",
          "title": {
            "en": "Two pointers + sliding window",
            "ru": "Два указателя + скользящее окно"
          },
          "warmup": {
            "en": "Solve Valid Palindrome with two pointers in 10 min; state the invariant of the pointer movement out loud.",
            "ru": "Реши Valid Palindrome двумя указателями за 10 мин, проговори инвариант движения указателей."
          },
          "reflectPrompt": {
            "en": "By what signal in a problem do you recognize «this is a sliding window» rather than a nested scan?",
            "ru": "По какому признаку в задаче я узнаю «это скользящее окно», а не вложенный перебор?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: two pointers (converging / fast-slow) and sliding window (fixed vs variable). Write down the triggers for «when to use which pattern».",
                "ru": "Теория: два указателя (встречное движение / быстрый-медленный) и скользящее окно (фиксированное vs переменное). Записать триггеры «когда какой паттерн»."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Solve 3 problems: Two Sum II (sorted), Longest Substring Without Repeating Characters, Minimum Size Subarray Sum.",
                "ru": "Решить 3 задачи: Two Sum II (sorted), Longest Substring Without Repeating Characters, Minimum Size Subarray Sum."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how the window expands/shrinks and why the amortized complexity is O(n), not O(n^2).",
                "ru": "Теория: как окно расширяется/сужается и почему амортизированная сложность O(n), а не O(n^2)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "NeetCode",
                "ru": "NeetCode"
              },
              "note": {
                "en": "Two Pointers; Sliding Window — list of patterns",
                "ru": "Two Pointers; Sliding Window — список паттернов"
              }
            },
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "String/Array methods: charCodeAt, indexing",
                "ru": "String/Array методы: charCodeAt, индексация"
              }
            }
          ]
        },
        {
          "id": "w2d2",
          "track": "js",
          "title": {
            "en": "Prototypes: the chain, this, and new semantics",
            "ru": "Прототипы: цепочка, this и семантика new"
          },
          "warmup": {
            "en": "Solve Squares of a Sorted Array with two pointers in 10 min.",
            "ru": "Реши Squares of a Sorted Array двумя указателями за 10 мин."
          },
          "reflectPrompt": {
            "en": "In which case has losing this already caused a bug in your code, and how do prototypes/binding explain it?",
            "ru": "В каком случае из моего кода потеря this уже приводила к багу и как прототип/привязка это объясняют?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: [[Prototype]], __proto__ vs prototype, how the chain lookup works, Object.create, class as sugar over prototypes. Draw the chain for a class instance.",
                "ru": "Теория: [[Prototype]], __proto__ vs prototype, как идёт поиск по цепочке, Object.create, class как сахар над прототипами. Нарисовать цепочку для экземпляра class."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: implement new by hand (a myNew function), binding via call/apply/bind; break down the 4 rules for determining this (default/implicit/explicit/new).",
                "ru": "Практика: реализовать new вручную (функция myNew), привязку через call/apply/bind; разобрать 4 правила определения this (default/implicit/explicit/new)."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: why an arrow method in a class breaks/fixes this and when that's appropriate (this binding of arrow functions vs regular methods).",
                "ru": "Теория: почему метод-стрелка в классе ломает/чинит this и когда это уместно (привязка this у стрелок vs обычных методов)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Inheritance and the prototype chain; this; Function.prototype.bind",
                "ru": "Inheritance and the prototype chain; this; Function.prototype.bind"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "You Don't Know JS: this & Object Prototypes",
                "ru": "You Don't Know JS: this & Object Prototypes"
              }
            }
          ]
        },
        {
          "id": "w2d3",
          "track": "sysdesign",
          "title": {
            "en": "Load balancing and horizontal scaling",
            "ru": "Балансировка нагрузки и горизонтальное масштабирование"
          },
          "warmup": {
            "en": "Solve Container With Most Water with two pointers in 10 min.",
            "ru": "Реши Container With Most Water двумя указателями за 10 мин."
          },
          "reflectPrompt": {
            "en": "Which component in a system you know prevents adding another instance without side effects?",
            "ru": "Какой компонент в знакомой тебе системе мешает добавить ещё один инстанс без побочных эффектов?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: L4 vs L7 balancing, algorithms (round-robin, least-connections, consistent hashing), health checks; stateless services and where to move state (sticky sessions vs an external store).",
                "ru": "Теория: L4 vs L7 балансировка, алгоритмы (round-robin, least-connections, consistent hashing), health-checks; stateless-сервисы и куда выносить состояние (sticky sessions vs внешний стор)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Theory: how to horizontally scale a stateful queue handler — where state arises, how to partition the load (consistent hashing / partition key), and how to preserve event ordering.",
                "ru": "Теория: как горизонтально масштабировать stateful-обработчик очереди — где возникает состояние, как партиционировать нагрузку (consistent hashing / partition key) и как сохранить порядок событий."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: what prevents a service from scaling horizontally — local state, local locks, non-idempotency.",
                "ru": "Теория: что мешает сервису масштабироваться горизонтально — локальное состояние, локальные локи, неидемпотентность."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "AWS docs",
                "ru": "AWS docs"
              },
              "note": {
                "en": "Elastic Load Balancing — types of balancers",
                "ru": "Elastic Load Balancing — типы балансировщиков"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Designing Data-Intensive Applications, ch. 6 (Partitioning)",
                "ru": "Designing Data-Intensive Applications, гл. 6 (Partitioning)"
              }
            }
          ]
        },
        {
          "id": "w2d4",
          "track": "node",
          "title": {
            "en": "Event loop phases: timers/poll/check/close and microtasks",
            "ru": "Фазы event loop: timers/poll/check/close и микротаски"
          },
          "warmup": {
            "en": "Solve Move Zeroes with a fast-slow pointer in 8 min.",
            "ru": "Реши Move Zeroes быстрым-медленным указателем за 8 мин."
          },
          "reflectPrompt": {
            "en": "Why do setImmediate and setTimeout(0) give an unpredictable order in the main module but a deterministic one inside an I/O callback?",
            "ru": "Почему setImmediate и setTimeout(0) дают непредсказуемый порядок в main-модуле, но детерминированный внутри I/O-колбэка?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the order of libuv phases (timers → pending → poll → check → close), where setTimeout/setImmediate/I/O callbacks run; microtasks (process.nextTick, promises) and when the queue is drained between phases.",
                "ru": "Теория: порядок фаз libuv (timers → pending → poll → check → close), где исполняются setTimeout/setImmediate/I/O-колбэки; микротаски (process.nextTick, промисы) и когда дренируется очередь между фазами."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: write a script mixing setTimeout(0), setImmediate, an fs.readFile callback, Promise.then, and process.nextTick; predict the output order and run it, checking against your prediction.",
                "ru": "Практика: написать скрипт со смесью setTimeout(0), setImmediate, fs.readFile-колбэка, Promise.then и process.nextTick; предсказать порядок вывода и запустить, сверив с предсказанием."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how «poisoning» the event loop with nextTick/microtasks starves its phases and what processing delays this causes.",
                "ru": "Теория: как «отравление» nextTick/микротасками голодает фазы event loop и к каким задержкам обработки это приводит."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "The Node.js Event Loop, Timers, and process.nextTick()",
                "ru": "The Node.js Event Loop, Timers, and process.nextTick()"
              }
            },
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "setImmediate() vs setTimeout()",
                "ru": "setImmediate() vs setTimeout()"
              }
            }
          ]
        },
        {
          "id": "w2d5",
          "track": "cs",
          "title": {
            "en": "OS: processes vs threads, scheduler, context switching",
            "ru": "ОС: процессы vs потоки, планировщик, контекстное переключение"
          },
          "warmup": {
            "en": "Solve Remove Duplicates from Sorted Array with two pointers in 8 min.",
            "ru": "Реши Remove Duplicates from Sorted Array двумя указателями за 8 мин."
          },
          "reflectPrompt": {
            "en": "Where could a CPU-bound operation quietly eat the latency of the whole instance, and how would you diagnose it?",
            "ru": "Где CPU-bound операция могла бы незаметно съедать латентность всего инстанса и как это диагностировать?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: process address space vs shared thread memory, process states, the preemptive scheduler and time quanta, the cost of a context switch (registers, TLB flushes, cache misses).",
                "ru": "Теория: адресное пространство процесса vs общая память потоков, состояния процесса, вытесняющий планировщик и кванты, стоимость context switch (регистры, TLB-флаши, кэш-промахи)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: run a load and watch the context switches/threads (top -H, vmstat, or ps -M); tie it to the fact that Node is a single JS thread + the libuv thread pool (UV_THREADPOOL_SIZE).",
                "ru": "Практика: запустить нагрузку и посмотреть переключения/потоки (top -H, vmstat или ps -M); связать с тем, что Node — один JS-поток + пул потоков libuv (UV_THREADPOOL_SIZE)."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: why CPU-bound work in Node blocks the event loop and what its alternatives are (worker_threads, offloading to a separate process/service).",
                "ru": "Теория: почему CPU-bound работа в Node блокирует event loop и какие у неё альтернативы (worker_threads, вынос в отдельный процесс/сервис)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Operating Systems: Three Easy Pieces — Processes; Scheduling",
                "ru": "Operating Systems: Three Easy Pieces — Processes; Scheduling"
              }
            },
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "Worker threads; libuv thread pool",
                "ru": "Worker threads; libuv thread pool"
              }
            }
          ]
        },
        {
          "id": "w2d6",
          "track": "patterns",
          "title": {
            "en": "Creational GoF in idiomatic TS: Factory/Builder/Singleton",
            "ru": "Порождающие GoF на идиоматичном TS: Factory/Builder/Singleton"
          },
          "warmup": {
            "en": "Redo any sliding-window problem from memory in 10 min.",
            "ru": "Повтори по памяти любую задачу на скользящее окно за 10 мин."
          },
          "reflectPrompt": {
            "en": "Which of my current «singletons» is actually a hidden global dependency that gets in the way of testing?",
            "ru": "Какой из моих текущих «синглтонов» на самом деле скрытая глобальная зависимость, мешающая тестам?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: Factory Method vs Abstract Factory, Builder for complex configuration, Singleton and its problems (testability, hidden dependencies). One idiomatic TS example for each.",
                "ru": "Теория: Factory Method vs Abstract Factory, Builder для сложной конфигурации, Singleton и его проблемы (тестируемость, скрытые зависимости). По одному идиоматичному TS-примеру на каждый."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Theory: Builder/Factory for complex configuration and dependency injection instead of Singleton — which object-creation problems this solves and when it's appropriate.",
                "ru": "Теория: Builder/Factory для сложной конфигурации и инъекция зависимости вместо Singleton — какие проблемы создания объектов это решает и когда уместно."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: when a Singleton is justified and when it's a disguised global; how a module-level singleton in Node differs from the classic one.",
                "ru": "Теория: когда Singleton оправдан, а когда это маскированный глобал; чем модульный синглтон в Node отличается от классического."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Refactoring",
                "ru": "Refactoring"
              },
              "note": {
                "en": "refactoring.guru — Creational Patterns",
                "ru": "refactoring.guru — Creational Patterns"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Design Patterns (GoF) — Creational",
                "ru": "Design Patterns (GoF) — Creational"
              }
            }
          ]
        },
        {
          "id": "w2d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What to consolidate from the week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w3",
      "title": {
        "en": "Week 3",
        "ru": "Неделя 3"
      },
      "phase": "1",
      "theme": "Event loop глубоко, основы TypeScript, конкурентность, структурные паттерны",
      "items": [
        {
          "id": "w3d1",
          "track": "dsa",
          "title": {
            "en": "Prefix sums + binary search (including binary search on the answer)",
            "ru": "Префиксные суммы + бинарный поиск (в т.ч. по ответу)"
          },
          "warmup": {
            "en": "Recap: compute the prefix array for [3,-1,4,2] by hand and answer 2 range-sum queries; on paper, write out the bounds invariant [lo, hi) for binary search.",
            "ru": "Рекап: посчитай вручную префиксный массив для [3,-1,4,2] и ответь на 2 range-sum запроса; на бумаге выпиши инвариант границ [lo, hi) для бинпоиска."
          },
          "reflectPrompt": {
            "en": "Which feasible(x) predicate did you formulate today, and was it actually monotonic — or did you just assume it was?",
            "ru": "Какой предикат feasible(x) ты сформулировал сегодня и был ли он на самом деле монотонным — или ты это просто предположил?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: prefix sums (1D and the difference array for range updates), classic binary search, and the «binary search on the answer» template (the predicate is monotonic → find the boundary). Write down one unified bounds invariant so you don't confuse lo/hi/mid.",
                "ru": "Теория: префиксные суммы (1D и разностный массив для range-update), классический бинпоиск и шаблон «бинарный поиск по ответу» (предикат монотонен → ищем границу). Записать единый инвариант границ, чтобы не путать lo/hi/mid."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Solve 2 prefix-sum problems: Subarray Sum Equals K (via a prefix hashmap) and Range Sum Query Immutable.",
                "ru": "Решить 2 задачи на префиксы: Subarray Sum Equals K (через hashmap префиксов) и Range Sum Query Immutable."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Solve 1 binary-search-on-the-answer problem: Koko Eating Bananas (or Minimum Speed to Arrive on Time). Explicitly write out the feasible(x) predicate and prove its monotonicity.",
                "ru": "Решить 1 задачу на бинпоиск по ответу: Koko Eating Bananas (или Minimum Speed to Arrive on Time). Явно выписать предикат feasible(x) и доказать его монотонность."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: a checklist for «when prefix sums, when binary search on the answer»; typical bounds bugs (off-by-one, overflow in mid).",
                "ru": "Теория: чек-лист «когда префиксы, когда бинпоиск по ответу»; типичные баги границ (off-by-one, overflow при mid)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Sedgewick, Algorithms",
                "ru": "Sedgewick, Algorithms"
              },
              "note": {
                "en": "Binary search and bounds invariants",
                "ru": "Binary search и инварианты границ"
              }
            },
            {
              "label": {
                "en": "LeetCode Explore",
                "ru": "LeetCode Explore"
              },
              "note": {
                "en": "Binary Search: search on the answer (search space)",
                "ru": "Binary Search: поиск по ответу (search space)"
              }
            }
          ]
        },
        {
          "id": "w3d2",
          "track": "js",
          "title": {
            "en": "Event loop in depth: call stack, micro/macrotasks, ordering",
            "ru": "Event loop глубоко: call stack, микро/макротаски, порядок"
          },
          "warmup": {
            "en": "Algo warm-up: solve Valid Parentheses with a stack — it's a direct analogy to the call stack; say the LIFO invariant out loud.",
            "ru": "Алго-разминка: реши Valid Parentheses через стек — это прямая аналогия call stack, проговори LIFO-инвариант."
          },
          "reflectPrompt": {
            "en": "At which point did your predicted output order diverge from reality, and which event-loop model did that fix in your head?",
            "ru": "В каком месте предсказанный порядок вывода разошёлся с реальным и какую модель event loop это исправило у тебя в голове?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the libuv phases (timers, pending, poll, check, close) + the microtask queues (Promise/queueMicrotask) and process.nextTick. Write down the rule: microtasks and nextTick are fully drained between macrotasks.",
                "ru": "Теория: фазы libuv (timers, pending, poll, check, close) + очереди микротасок (Promise/queueMicrotask) и process.nextTick. Записать правило: микротаски и nextTick осушаются полностью между макрозадачами."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: predict on paper the output of a snippet with setTimeout(0) + Promise.then + process.nextTick + setImmediate, then run it in Node and check against your prediction.",
                "ru": "Практика: предсказать на бумаге вывод сниппета с setTimeout(0) + Promise.then + process.nextTick + setImmediate, затем запустить в Node и сверить с предсказанием."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Experiment: write a function that schedules microtasks in a loop and starves the macrotask queue (starvation); then rewrite it with setImmediate to yield control back to the loop. Note the difference in behavior.",
                "ru": "Эксперимент: написать функцию, которая в цикле планирует микротаски и «голодает» макроочередь (starvation); затем переписать через setImmediate, чтобы вернуть управление loop. Зафиксировать разницу в поведении."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: where a synchronous CPU block or a long promise chain in a handler can delay timers/heartbeats — and how to detect such spots.",
                "ru": "Теория: где синхронный CPU-блок или длинная цепочка промисов в обработчике может задержать таймеры/heartbeat — и как обнаружить такие места."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node.js docs",
                "ru": "Node.js docs"
              },
              "note": {
                "en": "The Node.js Event Loop, Timers, and process.nextTick()",
                "ru": "The Node.js Event Loop, Timers, and process.nextTick()"
              }
            },
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Microtasks and the JavaScript runtime / Event loop",
                "ru": "Microtasks and the JavaScript runtime / Event loop"
              }
            }
          ]
        },
        {
          "id": "w3d3",
          "track": "sysdesign",
          "title": {
            "en": "SQL vs NoSQL, basic indexing, and data modeling",
            "ru": "SQL vs NoSQL, базовая индексация и моделирование данных"
          },
          "warmup": {
            "en": "Algo warm-up: solve Two Sum with a hashmap and say out loud that a DB index is the same idea of a «structure for fast lookup», just on disk (B-tree/hash).",
            "ru": "Алго-разминка: реши Two Sum через hashmap и проговори, что индекс в БД — это та же идея «structure for fast lookup», только на диске (B-tree/hash)."
          },
          "reflectPrompt": {
            "en": "Which query did you speed up with an index today — and did you understand WHY the planner chose that exact plan, rather than guessing?",
            "ru": "Какой запрос ты сегодня ускорил индексом — и понял ли ты, ПОЧЕМУ планировщик выбрал именно этот план, а не угадал?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: when a relational model vs a document/KV model (consistency, schema, access patterns, joins vs denormalization). Write down the decisive rule: model from your queries, not from your entities.",
                "ru": "Теория: когда реляционная модель vs документная/KV (консистентность, схема, паттерны доступа, джойны vs денормализация). Записать решающее правило: моделируй от запросов, а не от сущностей."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Indexes in PostgreSQL: B-tree, composite index and the importance of column order, covering index (INCLUDE), partial index. Write down why an index on (a,b) doesn't help a query on b alone.",
                "ru": "Индексы в PostgreSQL: B-tree, составной индекс и важность порядка колонок, покрывающий индекс (INCLUDE), частичный индекс. Записать, почему индекс на (a,b) не помогает запросу только по b."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how to read EXPLAIN ANALYZE output — telling a Seq Scan from an Index Scan, estimating cost, and seeing where a composite index would speed up a query.",
                "ru": "Теория: как читать вывод EXPLAIN ANALYZE — отличать Seq Scan от Index Scan, оценивать стоимость и видеть, где составной индекс ускорит запрос."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: the data schema of a single aggregate in relational and document form — which queries each model makes cheaper, and which it makes more expensive.",
                "ru": "Теория: схема данных одного агрегата в реляционном и документном виде — какие запросы каждая модель удешевляет, а какие удорожает."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "PostgreSQL docs",
                "ru": "PostgreSQL docs"
              },
              "note": {
                "en": "Indexes (B-tree, multicolumn, partial, covering) and Using EXPLAIN",
                "ru": "Indexes (B-tree, multicolumn, partial, covering) и Using EXPLAIN"
              }
            },
            {
              "label": {
                "en": "Kleppmann, Designing Data-Intensive Applications",
                "ru": "Kleppmann, Designing Data-Intensive Applications"
              },
              "note": {
                "en": "Chapters 2-3: data models and storage/indexing",
                "ru": "Глава 2-3: модели данных и storage/indexing"
              }
            }
          ]
        },
        {
          "id": "w3d4",
          "track": "ts",
          "title": {
            "en": "Structural typing + generics (constraints, defaults, inference)",
            "ru": "Структурная типизация + generics (ограничения, дефолты, вывод)"
          },
          "warmup": {
            "en": "Algo warm-up: redo the two pointers pattern on Reverse String / Move Zeroes — an easy problem, just to keep your algo form.",
            "ru": "Алго-разминка: повтори паттерн two pointers на Reverse String / Move Zeroes — лёгкая задача, чтобы не терять алго-форму."
          },
          "reflectPrompt": {
            "en": "Where did structural typing give you a false sense of safety today — and would a branded type have closed that gap?",
            "ru": "Где сегодня структурная типизация дала ложное чувство безопасности — и помог бы branded type это закрыть?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: structural (duck) typing vs nominal typing, why «extra» fields pass on assignment but not on an object literal (excess property check). Write down where this is convenient and where it's dangerous (e.g., extensible DTOs).",
                "ru": "Теория: структурная (duck) типизация vs номинальная, почему «лишние» поля проходят при присваивании, но не при object literal (excess property check). Записать, где это удобно, а где опасно (например, расширяемые DTO)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Generics: constraints via extends, default type parameters, type inference from arguments. Write a generic function pick<T, K extends keyof T> and getOrThrow for safe access to a Map/config.",
                "ru": "Generics: ограничения через extends, дефолтные параметры типа, вывод типа из аргументов. Написать дженерик-функцию pick<T, K extends keyof T> и getOrThrow для безопасного доступа к Map/конфигу."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: a generic result wrapper (Result<T, E>) and inferring the payload type from a discriminating event field — how to keep the type from collapsing into any.",
                "ru": "Теория: дженерик-обёртка результата (Result<T, E>) и вывод типа payload из дискриминирующего поля события — как добиться, чтобы тип не сваливался в any."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: when to brand a type (nominal via branded types) for UserId/OrderId, so structural compatibility doesn't let you accidentally swap identifiers.",
                "ru": "Теория: когда брендировать тип (nominal через branded types) для UserId/OrderId, чтобы структурная совместимость не давала случайно перепутать идентификаторы."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "TypeScript Handbook",
                "ru": "TypeScript Handbook"
              },
              "note": {
                "en": "Generics; Type Compatibility (structural typing)",
                "ru": "Generics; Type Compatibility (structural typing)"
              }
            },
            {
              "label": {
                "en": "TypeScript docs",
                "ru": "TypeScript docs"
              },
              "note": {
                "en": "keyof, Indexed Access Types, Generic Constraints",
                "ru": "keyof, Indexed Access Types, Generic Constraints"
              }
            }
          ]
        },
        {
          "id": "w3d5",
          "track": "cs",
          "title": {
            "en": "Concurrency: data races, mutexes/semaphores, deadlock",
            "ru": "Конкурентность: гонки данных, мьютексы/семафоры, deadlock"
          },
          "warmup": {
            "en": "Algo warm-up: solve a queue/stack problem (e.g., Implement Queue using Stacks) — the FIFO/LIFO model will help reasoning about access order.",
            "ru": "Алго-разминка: реши задачу на очередь/стек (например, Implement Queue using Stacks) — модель FIFO/LIFO пригодится для рассуждений о порядке доступа."
          },
          "reflectPrompt": {
            "en": "Which resource is right now protected only by the «luck» of a single-threaded runtime, rather than by explicit idempotency or a DB-level lock?",
            "ru": "Какой ресурс сейчас защищён только «удачей» single-threaded рантайма, а не явной идемпотентностью или локом на уровне БД?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: data race vs race condition, the critical section, mutex vs semaphore vs counting mutex; Coffman's four conditions for deadlock. Write down a minimal example of a race on incrementing a counter.",
                "ru": "Теория: data race vs race condition, критическая секция, mutex vs semaphore vs мьютекс с counting; четыре условия Коффмана для deadlock. Записать минимальный пример гонки на инкременте счётчика."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: model a concurrency limit in Node — write a simple semaphore/limiter for a pool of N parallel tasks and verify that no more than N run at once.",
                "ru": "Практика: смоделировать ограничение конкурентности в Node — написать простой semaphore/limiter для пула из N параллельных задач и проверить, что одновременно работает не больше N."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how to guard against double processing in a queue (SELECT ... FOR UPDATE / advisory lock / idempotency key) and which Coffman condition it breaks, so there's no deadlock between workers.",
                "ru": "Теория: как защититься от двойной обработки в очереди (SELECT ... FOR UPDATE / advisory lock / идемпотентный ключ) и какое условие Коффмана это рвёт, чтобы не было deadlock между воркерами."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: a deadlock-prevention checklist — a single lock-acquisition order, timeouts, lock-free via idempotency.",
                "ru": "Теория: чек-лист предотвращения deadlock — единый порядок захвата локов, таймауты, lock-free через идемпотентность."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "OSTEP (Three Easy Pieces)",
                "ru": "OSTEP (Three Easy Pieces)"
              },
              "note": {
                "en": "Concurrency: Locks, Semaphores, Deadlock",
                "ru": "Concurrency: Locks, Semaphores, Deadlock"
              }
            },
            {
              "label": {
                "en": "PostgreSQL docs",
                "ru": "PostgreSQL docs"
              },
              "note": {
                "en": "Explicit Locking: FOR UPDATE and Advisory Locks",
                "ru": "Explicit Locking: FOR UPDATE и Advisory Locks"
              }
            }
          ]
        },
        {
          "id": "w3d6",
          "track": "patterns",
          "title": {
            "en": "Structural GoF: Adapter, Decorator, Facade",
            "ru": "Структурные GoF: Adapter, Decorator, Facade"
          },
          "warmup": {
            "en": "Algo warm-up: an easy linked-list problem (Merge Two Sorted Lists) — practicing node composition, which echoes the «wrapping» in Decorator.",
            "ru": "Алго-разминка: лёгкая задача на связный список (Merge Two Sorted Lists) — тренируем композицию узлов, перекликается с «обёртыванием» в Decorator."
          },
          "reflectPrompt": {
            "en": "Where did you recognize Decorator/Facade «in the wild» today, and where has the facade already started turning into a dumping ground for logic?",
            "ru": "Где ты сегодня узнал Decorator/Facade «в дикой природе» и где фасад уже начал превращаться в свалку логики?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: Adapter (fitting a foreign interface to ours), Decorator (adding behavior without inheritance, keeping the interface), Facade (a simplified front over a complex subsystem). Write down how Decorator differs from Adapter by intent, not by form.",
                "ru": "Теория: Adapter (приведение чужого интерфейса к нашему), Decorator (наращивание поведения без наследования, сохраняя интерфейс), Facade (упрощённый фасад над сложной подсистемой). Записать, чем Decorator отличается от Adapter по намерению, а не по форме."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: write an Adapter for an external AI/LLM client fitting it to our internal interface, then a Decorator on top of it for retry/logging/metrics — without changing the original client.",
                "ru": "Практика: написать Adapter для внешнего AI/LLM-клиента под наш внутренний интерфейс, затем Decorator поверх него для retry/логирования/метрик — без изменения исходного клиента."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: a Facade over an outbox+queue subsystem, hiding the complexity behind a single publishEvent() method — what the facade hides and at what cost (the risk of a «god facade»).",
                "ru": "Теория: Facade над подсистемой outbox+очередь, прячущий сложность за одним методом publishEvent() — что фасад скрывает и какой ценой (риск «божественного фасада»)."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: a «problem → pattern → when NOT to apply» table; where decorators are better done via middleware composition than via classes.",
                "ru": "Теория: таблица «проблема → паттерн → когда НЕ применять»; где декораторы лучше сделать через композицию middleware, а не классы."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "GoF, Design Patterns",
                "ru": "GoF, Design Patterns"
              },
              "note": {
                "en": "Structural patterns: Adapter, Decorator, Facade",
                "ru": "Structural patterns: Adapter, Decorator, Facade"
              }
            },
            {
              "label": {
                "en": "Refactoring Guru",
                "ru": "Refactoring Guru"
              },
              "note": {
                "en": "Adapter / Decorator / Facade: intent and structure",
                "ru": "Adapter / Decorator / Facade: намерение и структура"
              }
            }
          ]
        },
        {
          "id": "w3d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What to consolidate from the week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w4",
      "title": {
        "en": "Week 4",
        "ru": "Неделя 4"
      },
      "phase": "1",
      "theme": "Async внутри JS, потоки Node, модели I/O, поведенческие паттерны",
      "items": [
        {
          "id": "w4d1",
          "track": "dsa",
          "title": {
            "en": "Stack/queue/linked list + monotonic stack",
            "ru": "Стек/очередь/связный список + монотонный стек"
          },
          "warmup": {
            "en": "Recap: on paper, play through stack push/pop and queue enqueue/dequeue over a single array of 6 elements; name the complexity of each operation.",
            "ru": "Рекап: на бумаге проиграй push/pop стека и enqueue/dequeue очереди на одном массиве из 6 элементов; назови сложность каждой операции."
          },
          "reflectPrompt": {
            "en": "On which problem statement did I fail to immediately recognize that a monotonic stack was needed, rather than just brute force?",
            "ru": "На какой формулировке задачи я не сразу распознал, что нужен именно монотонный стек, а не просто перебор?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: break down stack, queue, and singly linked list as ADTs — which invariants, which operations are O(1), why. Write down when an array backend is better than a list of nodes.",
                "ru": "Теория: разбери стек, очередь и односвязный список как АТД — какие инварианты, какие операции O(1), почему. Запиши, когда массив-бэкенд лучше, чем список из узлов."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Implement a queue using two stacks and verify amortized O(1) for dequeue.",
                "ru": "Реализуй очередь на двух стеках и проверь амортизированную O(1) для dequeue."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Solve 2 monotonic-stack problems: Daily Temperatures and Next Greater Element I.",
                "ru": "Реши 2 задачи на монотонный стек: Daily Temperatures и Next Greater Element I."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: where in an event-processing queue the FIFO invariant is critical, and where the order can be broken.",
                "ru": "Теория: где в очереди обработки событий FIFO-инвариант критичен, а где порядок можно нарушить."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Array as stack/queue: push/pop/shift/unshift and their cost",
                "ru": "Array как стек/очередь: push/pop/shift/unshift и их стоимость"
              }
            },
            {
              "label": {
                "en": "NeetCode",
                "ru": "NeetCode"
              },
              "note": {
                "en": "Stack section: Daily Temperatures, monotonic stack",
                "ru": "Раздел Stack: Daily Temperatures, монотонный стек"
              }
            }
          ]
        },
        {
          "id": "w4d2",
          "track": "js",
          "title": {
            "en": "Promises and async/await from the inside: microtasks vs macrotasks",
            "ru": "Промисы и async/await изнутри: микротаски vs макротаски"
          },
          "warmup": {
            "en": "Algo warm-up: solve Valid Parentheses with a stack in 10 minutes; say the stack invariant out loud.",
            "ru": "Алго-разминка: реши Valid Parentheses на стеке за 10 минут, проговори инвариант стека вслух."
          },
          "reflectPrompt": {
            "en": "Where in real code could I accidentally «lose» a promise rejection (unhandled rejection), and how would I catch it?",
            "ru": "Где в реальном коде я мог бы случайно «потерять» отказ промиса (unhandled rejection) и как это поймать?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: break down the promise lifecycle (pending/fulfilled/rejected), how .then registers a reaction on the microtask queue, and why microtasks are fully drained between macrotasks.",
                "ru": "Теория: разбери жизненный цикл промиса (pending/fulfilled/rejected), как .then регистрирует реакцию в очередь микротасков и почему микротаски выгребаются полностью между макротасками."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: predict the output order in a snippet mixing console.log, Promise.then, queueMicrotask, and setTimeout(0); then run it in Node and check against your prediction.",
                "ru": "Практика: предскажи порядок вывода в сниппете со смесью console.log, Promise.then, queueMicrotask и setTimeout(0); затем запусти в Node и сверь с предсказанием."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Do: write your own minimal thenable with a then method to see how await unwraps it; show that await always yields control for at least one microtask tick.",
                "ru": "Сделай: напиши свой минимальный thenable с методом then, чтобы увидеть, как await его разворачивает; покажи, что await всегда уступает управление хотя бы на один тик микротаска."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: how await differs from .then in readability and error handling; where sequential await covertly serializes work that could have been parallelized with Promise.all.",
                "ru": "Теория: чем await отличается от .then по читаемости и обработке ошибок; где последовательный await скрыто сериализует то, что можно было распараллелить через Promise.all."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Using promises; Microtask guide",
                "ru": "Using promises; Microtask guide"
              }
            },
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "The event loop; process.nextTick vs queueMicrotask",
                "ru": "The event loop; process.nextTick vs queueMicrotask"
              }
            },
            {
              "label": {
                "en": "Specification",
                "ru": "Спецификация"
              },
              "note": {
                "en": "Jake Archibald, In The Loop (task and microtask model)",
                "ru": "Jake Archibald, In The Loop (модель задач и микротасков)"
              }
            }
          ]
        },
        {
          "id": "w4d3",
          "track": "sysdesign",
          "title": {
            "en": "Caching: cache-aside, TTL, and invalidation strategies",
            "ru": "Кэширование: cache-aside, TTL и стратегии инвалидации"
          },
          "warmup": {
            "en": "Algo warm-up: implement an LRU cache on a HashMap + doubly linked list (get/put in O(1)); talk through why the doubly linked list specifically.",
            "ru": "Алго-разминка: реализуй LRU-кэш на HashMap + двусвязный список (get/put за O(1)), проговори, зачем именно двусвязный список."
          },
          "reflectPrompt": {
            "en": "For which of my endpoints is the risk of serving stale data unacceptable, and why is cache-aside dangerous there?",
            "ru": "Для какого из моих эндпоинтов риск отдать устаревшие данные неприемлем, и почему там кэш-aside опасен?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: break down the cache-aside (lazy loading) pattern — who reads/writes the cache, what happens on a miss; compare with write-through and write-back on consistency and data-loss risk.",
                "ru": "Теория: разбери паттерн cache-aside (lazy loading) — кто читает/пишет в кэш, что происходит при miss; сравни с write-through и write-back по согласованности и риску потери данных."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Study TTL problems: cache stampede when entries expire simultaneously, and solve it on paper with TTL jitter and single-flight/locking; write down which you'd pick for a hot key.",
                "ru": "Изучи проблемы TTL: cache stampede при одновременном протухании, и реши на бумаге через jitter TTL и single-flight/locking; запиши, какой выбрал бы для горячего ключа."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: cache invalidation strategies for a read endpoint — cache key, TTL, an invalidation trigger event from a queue; what freshness guarantee each one gives.",
                "ru": "Теория: стратегии инвалидации кэша для read-эндпоинта — ключ кэша, TTL, событие-триггер инвалидации из очереди; какие гарантии свежести даёт каждая."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: ways to get stale data (read-after-write race, invalidation before the transaction commits) and how cache-aside allows them.",
                "ru": "Теория: способы получить stale-данные (гонка read-после-write, инвалидация до коммита транзакции) и как cache-aside их допускает."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "AWS docs",
                "ru": "AWS docs"
              },
              "note": {
                "en": "Caching strategies: cache-aside, write-through",
                "ru": "Caching strategies: cache-aside, write-through"
              }
            },
            {
              "label": {
                "en": "Redis docs",
                "ru": "Redis docs"
              },
              "note": {
                "en": "Key eviction policies and EXPIRE/TTL",
                "ru": "Key eviction policies и EXPIRE/TTL"
              }
            },
            {
              "label": {
                "en": "Article",
                "ru": "Статья"
              },
              "note": {
                "en": "Cache stampede / thundering herd — the single-flight pattern",
                "ru": "Cache stampede / thundering herd — паттерн single-flight"
              }
            }
          ]
        },
        {
          "id": "w4d4",
          "track": "node",
          "title": {
            "en": "Node Streams: readable/writable, pipe, and the backpressure mechanism",
            "ru": "Node Streams: readable/writable, pipe и механизм backpressure"
          },
          "warmup": {
            "en": "Algo warm-up: solve a sliding-window problem (Best Time to Buy and Sell Stock) — talk through how the window \"flows\" along the array; it's the intuition for streams.",
            "ru": "Алго-разминка: реши задачу на скользящее окно (Best Time to Buy and Sell Stock) — проговори, как окно «течёт» по массиву, это интуиция для потоков."
          },
          "reflectPrompt": {
            "en": "Where in my code do I currently buffer in full something I should be streaming, and how does that bite under load?",
            "ru": "В каком месте моего кода я сейчас буферизую целиком то, что стоило бы стримить, и чем это грозит под нагрузкой?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: break down Readable (flowing vs paused, data/read modes) and Writable (write returns false, the drain event); write down what highWaterMark is and why it's measured in bytes or objects.",
                "ru": "Теория: разбери Readable (flowing vs paused, режимы data/read) и Writable (write возвращает false, событие drain); запиши, что такое highWaterMark и почему он измеряется в байтах или объектах."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Do it: write a pipeline that reads a large file → Transform (e.g. counting lines) → write, using stream.pipeline; then deliberately slow down the writable and observe how backpressure throttles the readable.",
                "ru": "Сделай: напиши пайплайн чтения большого файла → Transform (например подсчёт строк) → запись, через stream.pipeline; затем намеренно затормози writable и пронаблюдай, как backpressure тормозит readable."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Experiment: compare processing a large file via fs.readFile in full vs via a stream — measure peak memory (process.memoryUsage).",
                "ru": "Эксперимент: сравни обработку большого файла через fs.readFile целиком vs через стрим — замерь пиковую память (process.memoryUsage)."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: where streams pay off (serving a large export, proxying a request body) and why pipeline beats manual pipe for error handling and resource cleanup.",
                "ru": "Теория: где стримы дают выигрыш (выгрузка большого экспорта, проксирование тела запроса) и почему pipeline лучше ручного pipe для обработки ошибок и закрытия ресурсов."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "Stream: Readable/Writable, backpressuring in streams",
                "ru": "Stream: Readable/Writable, backpressuring in streams"
              }
            },
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "stream.pipeline and Transform streams",
                "ru": "stream.pipeline и Transform streams"
              }
            }
          ]
        },
        {
          "id": "w4d5",
          "track": "cs",
          "title": {
            "en": "I/O models: blocking, non-blocking, multiplexed (epoll/kqueue → libuv)",
            "ru": "Модели I/O: blocking, non-blocking, multiplexed (epoll/kqueue → libuv)"
          },
          "warmup": {
            "en": "Algo warm-up: solve a queue problem — implement a fixed-size ring buffer; it's the structure event queues are built on.",
            "ru": "Алго-разминка: реши задачу на очередь — реализуй кольцевой буфер (ring buffer) фиксированного размера; это структура, на которой строятся очереди событий."
          },
          "reflectPrompt": {
            "en": "Which kind of operation in my service secretly sits in libuv's thread pool and could become a bottleneck as concurrency grows?",
            "ru": "Какой тип операции в моём сервисе тайно сидит в thread pool libuv и может стать узким местом при росте конкурентности?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: break down the 4 I/O models — blocking, non-blocking (busy-poll), I/O multiplexing (select/poll/epoll/kqueue), async. Write down why epoll is fundamentally better than select with thousands of descriptors.",
                "ru": "Теория: разбери 4 модели I/O — blocking, non-blocking (busy-poll), I/O multiplexing (select/poll/epoll/kqueue), async. Запиши, чем epoll принципиально лучше select при тысячах дескрипторов."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Study the connection to Node: how libuv uses epoll (Linux)/kqueue (macOS) for network I/O, and why file I/O and DNS go to the thread pool rather than epoll. Sketch a \"event loop ↔ libuv ↔ kernel\" diagram.",
                "ru": "Изучи связь с Node: как libuv использует epoll (Linux)/kqueue (macOS) для сетевого I/O, и почему файловый I/O и DNS уходят в thread pool, а не в epoll. Зарисуй схему «event loop ↔ libuv ↔ ядро»."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Do it: sketch pseudocode for an epoll_wait loop (register fd, wait for events, handle the ready ones) and map each step to a phase of Node's event loop.",
                "ru": "Сделай: набросай псевдокод цикла на epoll_wait (регистрация fd, ожидание событий, обработка готовых) и сопоставь каждый шаг с фазой event loop Node."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: why one CPU-heavy handler blocks the ENTIRE event loop even though I/O is async — and what the options are (worker_threads, offloading to a queue).",
                "ru": "Теория: почему один CPU-тяжёлый обработчик блокирует ВЕСЬ event loop, хотя I/O асинхронно — и какие варианты (worker_threads, вынос в очередь)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "libuv docs",
                "ru": "libuv docs"
              },
              "note": {
                "en": "Design overview: event loop, thread pool",
                "ru": "Design overview: event loop, thread pool"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "The Linux Programming Interface (Kerrisk) — the chapter on epoll/I/O models",
                "ru": "The Linux Programming Interface (Kerrisk) — глава про epoll/I/O models"
              }
            },
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "Don't block the event loop",
                "ru": "Don't block the event loop"
              }
            }
          ]
        },
        {
          "id": "w4d6",
          "track": "patterns",
          "title": {
            "en": "Behavioral GoF: Strategy, Observer, Command in TS",
            "ru": "Поведенческие GoF: Strategy, Observer, Command на TS"
          },
          "warmup": {
            "en": "Algo warm-up: solve a linked-list problem (Reverse Linked List, iteratively) — talk the pointer rearrangement through out loud.",
            "ru": "Алго-разминка: реши задачу на связный список (Reverse Linked List итеративно) — проговори перестановку указателей вслух."
          },
          "reflectPrompt": {
            "en": "Where did I recently write a long switch/if that would read more cleanly as a Strategy or a function table?",
            "ru": "Где я недавно написал длинный switch/if, который чище выразился бы Strategy или таблицей функций?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: break down Strategy (encapsulating interchangeable algorithms), Observer (publisher/subscriber, push notifications), and Command (a request as an object, undo/queue). Write down each one's intent in a single phrase and the \"smell\" it cures.",
                "ru": "Теория: разбери Strategy (инкапсуляция взаимозаменяемых алгоритмов), Observer (издатель/подписчик, push-уведомления) и Command (запрос как объект, undo/queue). Запиши намерение каждого одной фразой и его «запах», который он лечит."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Do it: implement Strategy in TS via a single-function interface — e.g. choosing a retry strategy (fixed/exponential backoff); show how DI swaps the strategy without if-chains.",
                "ru": "Сделай: реализуй Strategy на TS через интерфейс с одной функцией — например выбор стратегии ретраев (fixed/exponential backoff); покажи, как DI подменяет стратегию без if-цепочек."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how event-driven code (EventEmitter/broker) already implements Observer, and where the explicit pattern is redundant in JS (first-class functions replace Strategy and Command).",
                "ru": "Теория: как event-driven код (EventEmitter/брокер) уже реализует Observer и где явный паттерн избыточен в JS (функции первого класса заменяют Strategy и Command)."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: how an outbox implements Command — each record is a serialized command that can be re-executed; what \"a request as an object\" buys you for retry and audit.",
                "ru": "Теория: как outbox реализует Command — каждая запись это сериализованная команда с возможностью повторного выполнения; что «запрос как объект» даёт для retry и аудита."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Design Patterns (GoF) — Behavioral patterns: Strategy, Observer, Command",
                "ru": "Design Patterns (GoF) — Behavioral patterns: Strategy, Observer, Command"
              }
            },
            {
              "label": {
                "en": "Refactoring.Guru",
                "ru": "Refactoring.Guru"
              },
              "note": {
                "en": "Behavioral patterns with examples and comparisons",
                "ru": "Behavioral patterns с примерами и сравнением"
              }
            }
          ]
        },
        {
          "id": "w4d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What to lock in from the week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w5",
      "title": {
        "en": "Week 5",
        "ru": "Неделя 5"
      },
      "phase": "2",
      "theme": "Рекурсия и backtracking, TS conditional/infer, backpressure, основы распределённых систем",
      "items": [
        {
          "id": "w5d1",
          "track": "dsa",
          "title": {
            "en": "Recursion and backtracking: the decision tree and pruning",
            "ru": "Рекурсия и backtracking: дерево решений и отсечения"
          },
          "warmup": {
            "en": "Solve from memory in 10 min: sum the elements of an array two ways — iteratively and recursively. Name the stack depth and the base case.",
            "ru": "Реши по памяти за 10 мин: сумма элементов массива двумя способами — итеративно и рекурсивно. Назови глубину стека и базовый случай."
          },
          "reflectPrompt": {
            "en": "Where today did I confuse \"returning from recursion\" with \"undoing state\" (un-choose), and what bug would that lead to?",
            "ru": "Где сегодня я путал «вернуться из рекурсии» и «откатить состояние» (un-choose), и к какому багу это привело бы?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the anatomy of recursion (base case, step, invariant), recursion vs the stack, the risk of stack overflow. Write down the backtracking template: choose → explore → un-choose.",
                "ru": "Теория: анатомия рекурсии (базовый случай, шаг, инвариант), рекурсия vs стек, риск stack overflow. Записать шаблон backtracking: choose → explore → un-choose."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Solve 2 backtracking problems: Subsets and Permutations. Draw the decision tree for a small input, mark where pruning happens.",
                "ru": "Решить 2 задачи на backtracking: Subsets и Permutations. Нарисовать дерево решений для маленького входа, отметить где происходит отсечение (pruning)."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how to estimate backtracking complexity via the size of the search tree (branching^depth) and where implicit search / recursive traversal shows up (e.g. traversing a dependency tree).",
                "ru": "Теория: как оценить сложность backtracking через размер дерева перебора (ветвление^глубина) и где встречается неявный перебор/рекурсивный обход (например обход дерева зависимостей)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "LeetCode",
                "ru": "LeetCode"
              },
              "note": {
                "en": "Backtracking tag — Subsets, Permutations, Combination Sum",
                "ru": "тег Backtracking — Subsets, Permutations, Combination Sum"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Cracking the Coding Interview — the Recursion and Dynamic Programming chapter",
                "ru": "Cracking the Coding Interview — глава Recursion and Dynamic Programming"
              }
            }
          ]
        },
        {
          "id": "w5d2",
          "track": "ts",
          "title": {
            "en": "Conditional types and infer: inferring types from structure",
            "ru": "Conditional types и infer: вывод типов из структуры"
          },
          "warmup": {
            "en": "Algo warm-up: solve Combination Sum (backtracking, repeating yesterday's pattern) in 12 min, talk the pruning through out loud.",
            "ru": "Алго-разминка: реши Combination Sum (backtracking, повтор паттерна вчерашнего дня) за 12 мин, вслух проговори отсечение."
          },
          "reflectPrompt": {
            "en": "Where did my conditional type \"distribute\" over a union unexpectedly, and how does `[T]` fix it?",
            "ru": "В каком месте мой conditional type «распределился» по union неожиданно, и как `[T]` это чинит?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the `T extends U ? X : Y` syntax, distributive conditional types over a union, the `infer` keyword for capturing part of a type. Write down how distributive differs from the tuple-wrapped `[T] extends [U]`.",
                "ru": "Теория: синтаксис `T extends U ? X : Y`, distributive conditional types над union, ключевое слово `infer` для захвата части типа. Записать чем distributive отличается от обёрнутого в кортеж `[T] extends [U]`."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: implement from scratch `MyReturnType<T>`, `MyParameters<T>`, `Awaited<T>` via `infer`; then `UnwrapPromise` and `ElementType<T[]>`. Test them on your own types.",
                "ru": "Практика: реализовать с нуля `MyReturnType<T>`, `MyParameters<T>`, `Awaited<T>` через `infer`; затем `UnwrapPromise` и `ElementType<T[]>`. Проверить на своих типах."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how a conditional type extracts the payload from a union of events by the discriminating `type` field (discriminated union → mapped lookup) — when it simplifies an API and when it over-complicates it.",
                "ru": "Теория: как conditional-type извлекает payload из union событий по дискриминирующему полю `type` (discriminated union → mapped lookup) — когда это упрощает API, а когда переусложняет."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "TS Handbook",
                "ru": "TS Handbook"
              },
              "note": {
                "en": "Conditional Types; Inferring Within Conditional Types (infer)",
                "ru": "Conditional Types; Inferring Within Conditional Types (infer)"
              }
            },
            {
              "label": {
                "en": "Type Challenges",
                "ru": "Type Challenges"
              },
              "note": {
                "en": "github type-challenges — medium problems on infer",
                "ru": "github type-challenges — задачи medium на infer"
              }
            }
          ]
        },
        {
          "id": "w5d3",
          "track": "sysdesign",
          "title": {
            "en": "System Design fundamentals: load estimation and API design (REST/GraphQL/gRPC)",
            "ru": "Фундамент System Design: оценки нагрузки и дизайн API (REST/GraphQL/gRPC)"
          },
          "warmup": {
            "en": "Algo warm-up: estimate the O() for a recursive tree traversal and for backtracking enumeration of subsets (repeating the complexity intuition).",
            "ru": "Алго-разминка: оцени O() для рекурсивного обхода дерева и для backtracking-перебора подмножеств (повтор интуиции сложности)."
          },
          "reflectPrompt": {
            "en": "Which of my load estimates for the timeline could I not defend with numbers right now?",
            "ru": "Какую из своих оценок нагрузки для timeline я не смог бы защитить цифрами прямо сейчас?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the estimation ritual — DAU → QPS (average and peak ×N), record size → storage/year, bandwidth. Write down the \"intuition numbers\": latencies for RAM/SSD/network/datacenter RTT.",
                "ru": "Теория: ритуал оценок — DAU → QPS (средний и пиковый ×N), размер записи → объём хранилища/год, ширина канала. Записать «числа интуиции»: латентности RAM/SSD/сеть/RTT датацентра."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Compare REST vs GraphQL vs gRPC along these axes: contract, over/under-fetching, versioning, streaming, network load. Build a \"when to pick which\" table.",
                "ru": "Сравнить REST vs GraphQL vs gRPC по осям: контракт, over/under-fetching, версионирование, streaming, нагрузка на сеть. Составить таблицу «когда что выбирать»."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: design a public API for a feed service — pagination (cursor-based), write idempotency, contract versioning; how to estimate QPS and storage at 1M DAU and choose the protocol (REST/GraphQL/gRPC).",
                "ru": "Теория: дизайн публичного API для ленты-сервиса — пагинация (cursor-based), идемпотентность записи, версионирование контракта; как оценивать QPS и хранилище при 1M DAU и выбирать протокол (REST/GraphQL/gRPC)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Designing Data-Intensive Applications (Kleppmann) — ch. 1-2",
                "ru": "Designing Data-Intensive Applications (Kleppmann) — гл. 1-2"
              }
            },
            {
              "label": {
                "en": "gRPC docs",
                "ru": "gRPC docs"
              },
              "note": {
                "en": "Core concepts; when streaming is appropriate",
                "ru": "Core concepts; когда уместен streaming"
              }
            },
            {
              "label": {
                "en": "Numbers",
                "ru": "Numbers"
              },
              "note": {
                "en": "Latency numbers every programmer should know",
                "ru": "Latency numbers every programmer should know"
              }
            }
          ]
        },
        {
          "id": "w5d4",
          "track": "node",
          "title": {
            "en": "Streams and backpressure: pipeline, object mode, clean shutdown",
            "ru": "Streams и backpressure: pipeline, object mode, корректное завершение"
          },
          "warmup": {
            "en": "Algo warm-up: implement a recursive traversal of a nested object (flatten) in 12 min — repeating the week's recursion.",
            "ru": "Алго-разминка: реализуй рекурсивный обход вложенного объекта (flatten) за 12 мин — повтор рекурсии недели."
          },
          "reflectPrompt": {
            "en": "Where in my code could a stream overflow memory because the producer is faster than the consumer, and I'm not controlling it?",
            "ru": "Где в моём коде поток мог бы переполнить память, потому что producer быстрее consumer, и я это не контролирую?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the 4 stream types, highWaterMark, how `.write()` returns false and why `drain` is needed; what backpressure is and who throttles whom. Write down why `data` events without pausing break backpressure.",
                "ru": "Теория: 4 типа потоков, highWaterMark, как `.write()` возвращает false и зачем нужен `drain`; что такое backpressure и кто кого тормозит. Записать почему `data`-события без паузы ломают backpressure."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: write a `pipeline(readable, transform, writable)` in object mode that processes a stream of records; artificially slow the writable and confirm the readable backs off (log highWaterMark/buffer).",
                "ru": "Практика: написать конвейер `pipeline(readable, transform, writable)` в object mode, который обрабатывает поток записей; искусственно замедлить writable и убедиться, что readable притормаживает (логировать highWaterMark/буфер)."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how a queue consumer consumes events — where backpressure or an unbounded in-memory buffer arises with a slow consumer, and where `pipeline` replaces a manual subscription and removes the leak on error.",
                "ru": "Теория: как обработчик очереди потребляет события — где возникает backpressure или неограниченный буфер в памяти при медленном consumer, и где `pipeline` заменяет ручную подписку и убирает утечку при ошибке."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "Stream — Backpressuring in Streams; stream.pipeline()",
                "ru": "Stream — Backpressuring in Streams; stream.pipeline()"
              }
            },
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "Stream API — object mode, highWaterMark",
                "ru": "Stream API — object mode, highWaterMark"
              }
            }
          ]
        },
        {
          "id": "w5d5",
          "track": "distsys",
          "title": {
            "en": "Failure models, the 8 fallacies, and logical/vector clocks",
            "ru": "Модели отказов, 8 заблуждений и логические/векторные часы"
          },
          "warmup": {
            "en": "Algo warm-up: solve Generate Parentheses (backtracking) in 12 min — repeating the choose/un-choose pattern.",
            "ru": "Алго-разминка: реши Generate Parentheses (backtracking) за 12 мин — повтор паттерна choose/un-choose."
          },
          "reflectPrompt": {
            "en": "Which of the 8 fallacies is most deeply baked into an architecture you know as a silent assumption?",
            "ru": "Какое из 8 заблуждений сильнее всего зашито в знакомую тебе архитектуру как молчаливое допущение?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the 8 fallacies of distributed computing; failure models (crash-stop, crash-recovery, omission, Byzantine). Write down which fallacies (reliable network, zero latency, one administrator) are most often assumed in practice.",
                "ru": "Теория: 8 fallacies of distributed computing; модели отказов (crash-stop, crash-recovery, omission, Byzantine). Записать, какие из заблуждений (надёжная сеть, нулевая латентность, один администратор) чаще всего допускают на практике."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Theory: why physical clocks lie (clock skew), Lamport logical clocks (happened-before, →), and vector clocks (how they detect concurrency). Work through a 3-node message exchange on paper, assigning Lamport timestamps and vector timestamps.",
                "ru": "Теория: почему физические часы врут (clock skew), логические часы Лампорта (happened-before, →) и векторные часы (как детектируют конкурентность). Прорешать на бумаге обмен сообщениями из 3 узлов, проставить метки Лампорта и векторные метки."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how a network/clock illusion (desync, redelivery, a race between two updates) leads to bugs — which timestamps/ordering prevent them and why `updatedAt` by wall-clock is an unreliable arbiter.",
                "ru": "Теория: как сетевая/часовая иллюзия (рассинхрон, повторная доставка, гонка двух апдейтов) приводит к багам — какие метки/ordering их предотвращают и почему `updatedAt` по wall-clock ненадёжный арбитр."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Designing Data-Intensive Applications — ch. 8 (Trouble with Distributed Systems), ch. 9 (clocks, ordering)",
                "ru": "Designing Data-Intensive Applications — гл. 8 (Trouble with Distributed Systems), гл. 9 (часы, ordering)"
              }
            },
            {
              "label": {
                "en": "Article",
                "ru": "Статья"
              },
              "note": {
                "en": "Lamport — Time, Clocks, and the Ordering of Events in a Distributed System",
                "ru": "Lamport — Time, Clocks, and the Ordering of Events in a Distributed System"
              }
            }
          ]
        },
        {
          "id": "w5d6",
          "track": "patterns",
          "title": {
            "en": "DI/IoC and Repository + Unit of Work in TS",
            "ru": "DI/IoC и Repository + Unit of Work на TS"
          },
          "warmup": {
            "en": "Algo warm-up: redo from memory any of the week's backtracking problems (Subsets or Permutations) in 10 min.",
            "ru": "Алго-разминка: повтори по памяти любую backtracking-задачу недели (Subsets или Permutations) за 10 мин."
          },
          "reflectPrompt": {
            "en": "Where does Repository/UoW genuinely reduce complexity, and where is it an extra layer for the pattern's sake?",
            "ru": "Где Repository/UoW реально снижает сложность, а где это лишний слой ради паттерна?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: Dependency Inversion vs Dependency Injection vs IoC container; injection types (constructor/property), composition root. Write down how DI solves testability and coupling without container magic.",
                "ru": "Теория: Dependency Inversion vs Dependency Injection vs IoC-контейнер; виды внедрения (constructor/property), composition root. Записать, чем DI решает проблему тестируемости и связности без магии контейнера."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Theory + practice: the Repository (an abstraction over storage) and Unit of Work (one transaction = one business operation, change tracking) patterns. Sketch a `Repository<T>` interface and `UnitOfWork` in TS on top of a PostgreSQL transaction.",
                "ru": "Теория + практика: паттерны Repository (абстракция над хранилищем) и Unit of Work (одна транзакция = одна бизнес-операция, отслеживание изменений). Набросать на TS интерфейс `Repository<T>` и `UnitOfWork` поверх транзакции PostgreSQL."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how Repository + Unit of Work remove direct DB/ORM calls from domain logic, so the domain mutation and the outbox write commit in one transaction — and where the pattern is justified vs over-engineering.",
                "ru": "Теория: как Repository + Unit of Work убирают прямые вызовы БД/ORM из доменной логики, чтобы доменная мутация и outbox-запись коммитились в одной транзакции — и где паттерн оправдан, а где overengineering."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Patterns of Enterprise Application Architecture (Fowler) — Repository, Unit of Work",
                "ru": "Patterns of Enterprise Application Architecture (Fowler) — Repository, Unit of Work"
              }
            },
            {
              "label": {
                "en": "Refactoring",
                "ru": "Refactoring"
              },
              "note": {
                "en": "refactoring.guru — Dependency Injection / IoC",
                "ru": "refactoring.guru — Dependency Injection / IoC"
              }
            }
          ]
        },
        {
          "id": "w5d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What to lock in from the week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w6",
      "title": {
        "en": "Week 6",
        "ru": "Неделя 6"
      },
      "phase": "2",
      "theme": "Деревья, TS mapped-типы, worker_threads, согласованность и CAP",
      "items": [
        {
          "id": "w6d1",
          "track": "dsa",
          "title": {
            "en": "Trees and BSTs: traversals, validation, LCA",
            "ru": "Деревья и BST: обходы, валидация, LCA"
          },
          "warmup": {
            "en": "Draw a BST of 7 nodes and write out all 4 traversals by hand (pre/in/post/level). Check: does in-order produce a sorted sequence?",
            "ru": "Нарисуй BST из 7 узлов и вручную выпиши все 4 обхода (pre/in/post/level). Проверь: даёт ли in-order отсортированную последовательность?"
          },
          "reflectPrompt": {
            "en": "In which problems today were you tempted to compare a node only with its direct children instead of passing down range bounds, and how can you catch this in advance?",
            "ru": "В каких задачах сегодня тянуло сравнивать узел только с прямыми детьми вместо передачи границ диапазона, и как это ловить заранее?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: binary tree vs BST, the BST invariant, DFS traversals (pre/in/post) recursively and iteratively via a stack, BFS via a queue. Write down which traversal fits which problem (in-order — sorting, post-order — freeing/bottom-up aggregation, level-order — nearest levels).",
                "ru": "Теория: бинарное дерево vs BST, инвариант BST, обходы DFS (pre/in/post) рекурсивно и итеративно через стек, BFS через очередь. Записать, какой обход для какой задачи (in-order — сортировка, post-order — освобождение/агрегация снизу вверх, level-order — ближайшие уровни)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Solve: Validate BST (via min/max range, not comparison with children — write down why the naive check breaks), Maximum Depth, Same Tree.",
                "ru": "Решить: Validate BST (через диапазон min/max, а не сравнение с детьми — записать, почему наивная проверка ломается), Maximum Depth, Same Tree."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Solve LCA in a BST (descent by the BST property) and LCA in an arbitrary binary tree (bottom-up recursion); compare the complexities O(h) vs O(n).",
                "ru": "Решить LCA в BST (спуск по свойству) и LCA в произвольном бинарном дереве (рекурсия снизу); сравнить сложности O(h) vs O(n)."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: where hierarchical data (parent/child records) maps onto a tree and where post-order traversal helps aggregate statuses bottom-up.",
                "ru": "Теория: где иерархические данные (родительские/дочерние записи) ложатся в дерево и где обход post-order помогает агрегировать статусы снизу вверх."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Cracking the Coding Interview",
                "ru": "Cracking the Coding Interview"
              },
              "note": {
                "en": "Trees and Graphs chapter: traversals and BST invariants",
                "ru": "Глава Trees and Graphs: обходы и BST-инварианты"
              }
            },
            {
              "label": {
                "en": "CLRS",
                "ru": "CLRS"
              },
              "note": {
                "en": "Binary Search Trees: operations and in-order properties",
                "ru": "Binary Search Trees: операции и свойства in-order"
              }
            }
          ]
        },
        {
          "id": "w6d2",
          "track": "ts",
          "title": {
            "en": "Mapped types, key remapping, and template literal types",
            "ru": "Mapped types, key remapping и template literal types"
          },
          "warmup": {
            "en": "Algo warmup: solve Invert Binary Tree (recursion), say the complexity O(n) and stack depth O(h) out loud.",
            "ru": "Алго-разминка: реши Invert Binary Tree (рекурсия), вслух проговори сложность O(n) и глубину стека O(h)."
          },
          "reflectPrompt": {
            "en": "Where today did a type turn out smarter than it needed to be — and which simpler variant would read better for the next developer?",
            "ru": "Где сегодня тип получился умнее, чем нужно — и какой более простой вариант читался бы лучше для следующего разработчика?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: mapped types ([K in keyof T]), the +/-readonly and +/-? modifiers, breaking down how Partial/Required/Readonly/Pick/Record from lib.es5 are built. Write down how the modifiers remove/add readonly and optional.",
                "ru": "Теория: mapped types ([K in keyof T]), модификаторы +/-readonly и +/-?, разбор устройства Partial/Required/Readonly/Pick/Record из lib.es5. Записать, как модификаторы снимают/добавляют readonly и optional."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice key remapping: write a type that turns an object of methods into events on${Capitalize<K>} (template literal + as in a mapped type). Make the inverse — strip the get prefix from the keys.",
                "ru": "Практика key remapping: написать тип, который из объекта методов делает события on${Capitalize<K>} (template literal + as в mapped type). Сделать обратный — снять префикс get из ключей."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Write DeepReadonly<T> and DeepPartial<T> recursively. Test on a nested type (arrays, functions) — where do they give an unexpected result.",
                "ru": "Написать DeepReadonly<T> и DeepPartial<T> рекурсивно. Проверить на вложенном типе (массивы, функции) — где они дают неожиданный результат."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: a type-safe event registry via Record<EventName, Payload> + inferring the union of event names via a template literal — what this gives you at review time (eliminating drift between an event name and its payload).",
                "ru": "Теория: типобезопасный реестр событий через Record<EventName, Payload> + вывод union имён событий через template literal — что это даёт на ревью (исключаем рассинхрон имени события и payload)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "TypeScript Handbook",
                "ru": "TypeScript Handbook"
              },
              "note": {
                "en": "Mapped Types, Key Remapping via as, Template Literal Types",
                "ru": "Mapped Types, Key Remapping via as, Template Literal Types"
              }
            },
            {
              "label": {
                "en": "TypeScript lib",
                "ru": "TypeScript lib"
              },
              "note": {
                "en": "lib.es5.d.ts: implementations of Partial/Pick/Record",
                "ru": "lib.es5.d.ts: реализации Partial/Pick/Record"
              }
            }
          ]
        },
        {
          "id": "w6d3",
          "track": "sysdesign",
          "title": {
            "en": "CDN and edge caching: TTL, invalidation, cache hierarchy",
            "ru": "CDN и edge-кэширование: TTL, инвалидация, иерархия кэшей"
          },
          "warmup": {
            "en": "Algo warmup: solve Two Sum via a hashmap in one pass, say out loud why a hashmap rather than sorting with two pointers.",
            "ru": "Алго-разминка: реши Two Sum через hashmap за один проход, проговори, почему именно hashmap, а не сортировка с двумя указателями."
          },
          "reflectPrompt": {
            "en": "Which response in the system you own is mistakenly served as cacheable (or vice versa), and what does that risk?",
            "ru": "Какой ответ в системе, которую ты ведёшь, ошибочно отдаётся как кэшируемый (или наоборот) и чем это грозит?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: how a CDN works (PoP, anycast, origin shielding), pull vs push CDN, the cache hierarchy edge -> mid-tier -> origin. Write down what exactly it reduces: latency, origin load, egress.",
                "ru": "Теория: как работает CDN (PoP, anycast, origin shielding), pull vs push CDN, иерархия кэшей edge -> mid-tier -> origin. Записать, что именно снижает: latency, нагрузку на origin, egress."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Study HTTP caching: Cache-Control (max-age, s-maxage, stale-while-revalidate, private/public), ETag/If-None-Match, Vary. On paper, compose the headers for three cases: static assets with a hash in the name, an API response for a specific user, a public rarely-changing resource.",
                "ru": "Изучить HTTP-кэширование: Cache-Control (max-age, s-maxage, stale-while-revalidate, private/public), ETag/If-None-Match, Vary. На листочке составить заголовки для трёх случаев: статика с хэшем в имени, API-ответ для конкретного юзера, публичный редко меняющийся ресурс."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Break down invalidation: TTL-based vs purge vs versioned URL (cache busting). Write down why a versioned URL is almost always better than an explicit purge and where purge is still unavoidable.",
                "ru": "Разобрать инвалидацию: TTL-based vs purge vs versioned URL (cache busting). Записать, почему versioned URL почти всегда лучше явного purge и где purge всё же неизбежен."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: an edge strategy for an endpoint with public data — which s-maxage to choose, whether stale-while-revalidate is needed, and how to protect against a cache stampede on the origin.",
                "ru": "Теория: edge-стратегия для эндпоинта с публичными данными — какой s-maxage выбрать, нужен ли stale-while-revalidate и как защититься от cache stampede на origin."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "HTTP caching: Cache-Control, ETag, Vary",
                "ru": "HTTP caching: Cache-Control, ETag, Vary"
              }
            },
            {
              "label": {
                "en": "RFC 9111",
                "ru": "RFC 9111"
              },
              "note": {
                "en": "HTTP Caching: freshness and validation semantics",
                "ru": "HTTP Caching: семантика freshness и validation"
              }
            },
            {
              "label": {
                "en": "Fastly / Cloudflare docs",
                "ru": "Fastly / Cloudflare docs"
              },
              "note": {
                "en": "The section on cache hierarchy and stale-while-revalidate",
                "ru": "Раздел про cache hierarchy и stale-while-revalidate"
              }
            }
          ]
        },
        {
          "id": "w6d4",
          "track": "node",
          "title": {
            "en": "Concurrency in Node: worker_threads vs cluster vs child_process",
            "ru": "Параллелизм в Node: worker_threads vs cluster vs child_process"
          },
          "warmup": {
            "en": "Algo warmup: implement breadth-first traversal of a tree (BFS) via a queue — it doubles as a model of how workers pull tasks from a queue.",
            "ru": "Алго-разминка: реализуй обход дерева в ширину (BFS) через очередь — пригодится как модель того, как воркеры разбирают задачи из очереди."
          },
          "reflectPrompt": {
            "en": "Where in the current code would you reflexively \"add workers\" even though the problem is actually I/O-bound and concurrency won't help?",
            "ru": "Где в текущем коде ты по привычке решил бы 'добавить воркеров', хотя проблема на самом деле I/O-bound и параллелизм не поможет?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the difference between the three models. worker_threads (shared memory via SharedArrayBuffer, one process, cheap) vs cluster (forking processes, sharing a port, for scaling HTTP) vs child_process (a separate process/binary, isolation). Write down a table: when to use what and why.",
                "ru": "Теория: разница трёх моделей. worker_threads (общая память через SharedArrayBuffer, один процесс, дёшево) vs cluster (форк процессов, шарит порт, для масштабирования HTTP) vs child_process (отдельный процесс/бинарь, изоляция). Записать таблицу: когда что и почему."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: move a CPU-bound task (e.g., heavy parsing/hashing) into a worker_thread, pass data via postMessage and via SharedArrayBuffer. Measure how the main thread's event loop gets unblocked.",
                "ru": "Практика: вынести CPU-bound задачу (например, тяжёлый парсинг/хеширование) в worker_thread, передать данные через postMessage и через SharedArrayBuffer. Замерить, как разгружается event loop основного потока."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Study the pitfalls: the cost of serialization when passing messages, structuredClone vs transferable objects, what is NOT shared between threads, graceful shutdown of workers.",
                "ru": "Изучить подводные камни: стоимость сериализации при передаче сообщений, structuredClone vs transferable objects, что НЕ шарится между потоками, graceful shutdown воркеров."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: how to determine which part of the processing is truly CPU-bound (rather than I/O-bound) and a candidate for worker_threads — the criterion: event loop blocking > N ms per the profile means \"move it out\".",
                "ru": "Теория: как определить, какой участок обработки реально CPU-bound (а не I/O-bound) и кандидат на worker_threads — критерий: блокировка event loop > N мс по профилю значит «выносим»."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node.js docs",
                "ru": "Node.js docs"
              },
              "note": {
                "en": "worker_threads, cluster, child_process",
                "ru": "worker_threads, cluster, child_process"
              }
            },
            {
              "label": {
                "en": "Node.js docs",
                "ru": "Node.js docs"
              },
              "note": {
                "en": "Don't Block the Event Loop (guide)",
                "ru": "Don't Block the Event Loop (руководство)"
              }
            }
          ]
        },
        {
          "id": "w6d5",
          "track": "distsys",
          "title": {
            "en": "Consistency models and CAP/PACELC",
            "ru": "Модели согласованности и CAP/PACELC"
          },
          "warmup": {
            "en": "Algo warmup: check whether a binary tree is a valid BST (passing down bounds) — it refreshes the rigor of reasoning about invariants before talking about consistency invariants.",
            "ru": "Алго-разминка: проверь, является ли бинарное дерево валидным BST (передача границ) — освежает аккуратность рассуждения об инвариантах перед разговором об инвариантах согласованности."
          },
          "reflectPrompt": {
            "en": "Where in your system does a user silently expect linearizability while the architecture provides only eventual — and how has this already bitten you in incidents?",
            "ru": "Где в твоей системе пользователь молча ожидает линеаризуемость, а архитектура даёт лишь eventual — и чем это уже било по инцидентам?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the consistency spectrum — linearizability (strict, like a single register in real time), sequential, causal (preserves happens-before), eventual. Write down what each model guarantees and what it does NOT guarantee, using the read-after-write example.",
                "ru": "Теория: спектр согласованности — linearizability (строгая, как один регистр в реальном времени), sequential, causal (сохраняет happens-before), eventual. Записать, что именно гарантирует и что НЕ гарантирует каждая модель на примере чтения после записи."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Break down CAP honestly: under a network partition you choose C or A; 'P' is not optional in a real network. Then PACELC: if Partition -> A/C, ELSE -> Latency/Consistency. Write down which quadrant well-known systems fall into (e.g., the classic Dynamo-style tradeoff vs a strongly consistent DBMS).",
                "ru": "Разобрать CAP честно: при сетевом разделе выбираешь C или A; 'P' не опциональна в реальной сети. Затем PACELC: если Partition -> A/C, ELSE -> Latency/Consistency. Записать, в какой квадрант попадают известные системы (например, классический трейдофф Dynamo-стиля vs строго согласованной СУБД)."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Practice/analysis: take PostgreSQL replication (sync vs async) and articulate which consistency model a reader sees from a replica and which PACELC choice this is. Write down how read-your-writes breaks on an async replica.",
                "ru": "Практика-разбор: взять PostgreSQL-репликацию (sync vs async) и сформулировать, какую модель согласованности видит читатель с реплики и какой это PACELC-выбор. Записать, как read-your-writes ломается на async-реплике."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: the outbox gives eventual consistency between the DB and the broker — which guarantees this gives the consumer (at-least-once, possible duplicates, no global ordering) and where idempotency is needed.",
                "ru": "Теория: outbox даёт eventual consistency между БД и брокером — какие гарантии это даёт потребителю (at-least-once, возможные дубликаты, отсутствие глобального порядка) и где нужна идемпотентность."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Designing Data-Intensive Applications",
                "ru": "Designing Data-Intensive Applications"
              },
              "note": {
                "en": "The Consistency and Consensus, Replication chapters",
                "ru": "Главы Consistency and Consensus, Replication"
              }
            },
            {
              "label": {
                "en": "Jepsen / Kleppmann",
                "ru": "Jepsen / Kleppmann"
              },
              "note": {
                "en": "Notes on PACELC and definitions of consistency levels",
                "ru": "Заметки про PACELC и определения уровней согласованности"
              }
            }
          ]
        },
        {
          "id": "w6d6",
          "track": "patterns",
          "title": {
            "en": "Hexagonal architecture (ports/adapters) and Clean Architecture",
            "ru": "Гексагональная архитектура (ports/adapters) и Clean Architecture"
          },
          "warmup": {
            "en": "Algo warmup: solve Lowest Common Ancestor in a binary tree (bottom-up recursion) — also a metaphor for 'core at the bottom, adapters on top'.",
            "ru": "Алго-разминка: реши Lowest Common Ancestor в бинарном дереве (рекурсия снизу) — заодно метафора 'ядро внизу, адаптеры наверху'."
          },
          "reflectPrompt": {
            "en": "Which layer/port would you introduce today 'for cleanliness' even though it removes no real pain and only adds files?",
            "ru": "Какой слой/порт ты сегодня ввёл бы 'для чистоты', хотя он не убирает реальной боли, а лишь добавляет файлов?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the dependency rule (dependencies point inward, toward the domain), ports (domain interfaces) vs adapters (implementations for the DB/broker/HTTP), driving vs driven ports. Write down how the hexagon and Clean are similar and where they diverge in terminology.",
                "ru": "Теория: правило зависимостей (зависимости направлены внутрь, к домену), порты (интерфейсы домена) vs адаптеры (реализации для БД/брокера/HTTP), driving vs driven ports. Записать, чем гексагон и Clean похожи и где расходятся в терминологии."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice in TS: for one use case (e.g., publishing an event to a timeline) define a repository/publisher port interface in the domain and two adapters — a real one (PostgreSQL/broker) and an in-memory one for tests. Show that the domain does not import infrastructure.",
                "ru": "Практика на TS: для одного use-case (например, публикация события в timeline) определить порт-интерфейс репозитория/паблишера в домене и два адаптера — реальный (PostgreSQL/брокер) и in-memory для тестов. Показать, что домен не импортирует инфраструктуру."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Write a use-case test through the in-memory adapter without spinning up a DB; note what became easier to test and at what cost (more interfaces/mapping).",
                "ru": "Написать тест use-case через in-memory адаптер без поднятия БД; отметить, что стало проще тестировать и какой ценой (больше интерфейсов/маппинга)."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: where hexagonal architecture is justified and where it's over-engineering for a CRUD module — an honest applicability criterion: simplicity matters more than symmetry of layers.",
                "ru": "Теория: где гексагональная архитектура оправдана, а где это оверинжиниринг для CRUD-модуля — честный критерий применимости: простота важнее симметрии слоёв."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Alistair Cockburn",
                "ru": "Alistair Cockburn"
              },
              "note": {
                "en": "Hexagonal Architecture (Ports and Adapters), the original article",
                "ru": "Hexagonal Architecture (Ports and Adapters), оригинальная статья"
              }
            },
            {
              "label": {
                "en": "Clean Architecture (Robert C. Martin)",
                "ru": "Clean Architecture (Robert C. Martin)"
              },
              "note": {
                "en": "The chapter on the Dependency Rule and boundaries",
                "ru": "Глава про Dependency Rule и границы"
              }
            }
          ]
        },
        {
          "id": "w6d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What to consolidate from the week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w7",
      "title": {
        "en": "Week 7",
        "ru": "Неделя 7"
      },
      "phase": "2",
      "theme": "Графы, генераторы, профилирование Node, репликация",
      "items": [
        {
          "id": "w7d1",
          "track": "dsa",
          "title": {
            "en": "Graphs: representation, BFS/DFS, topological sort",
            "ru": "Графы: представление, BFS/DFS, топологическая сортировка"
          },
          "warmup": {
            "en": "Draw one graph of 6 vertices two ways: adjacency matrix and adjacency list. Estimate the memory and the cost of \"is there an edge u→v\" for each.",
            "ru": "Нарисуй один граф из 6 вершин двумя способами: матрица смежности и список смежности. Прикинь память и стоимость «есть ли ребро u→v» для каждого."
          },
          "reflectPrompt": {
            "en": "Where do you encounter an implicit dependency graph (workflow step order, task dependencies) and would a topological sort or cycle detection help there?",
            "ru": "Где встречается неявный граф зависимостей (порядок шагов воркфлоу, зависимости задач) и помог бы там топосорт или детект цикла?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: ways to store a graph (adjacency list vs matrix), directed/undirected, weighted. Write down when to choose what and the memory estimate O(V+E) vs O(V^2).",
                "ru": "Теория: способы хранения графа (adjacency list vs matrix), направленный/ненаправленный, взвешенный. Записать, когда что выбирать и оценку памяти O(V+E) vs O(V^2)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Implement BFS and DFS (iterative via a stack + recursive) on an adjacency list.",
                "ru": "Реализовать BFS и DFS (итеративный через стек + рекурсивный) на adjacency list."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Solve topological sort two ways: Kahn's algorithm (by in-degree) and DFS with post-order. Using a task-dependency example, detect a cycle and write down exactly how the cycle manifests in each method.",
                "ru": "Решить топологическую сортировку двумя путями: алгоритм Кана (по in-degree) и DFS с пост-порядком. На примере зависимостей задач задетектить цикл и записать, как именно цикл проявляется в каждом методе."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "CLRS",
                "ru": "CLRS"
              },
              "note": {
                "en": "Elementary Graph Algorithms: BFS, DFS, Topological Sort",
                "ru": "Elementary Graph Algorithms: BFS, DFS, Topological Sort"
              }
            },
            {
              "label": {
                "en": "Sedgewick, Algorithms",
                "ru": "Sedgewick, Algorithms"
              },
              "note": {
                "en": "Graphs chapter: representation and traversal",
                "ru": "Глава Graphs: представление и обход"
              }
            }
          ]
        },
        {
          "id": "w7d2",
          "track": "js",
          "title": {
            "en": "Generators and iterators: the iteration protocol and lazy streams",
            "ru": "Генераторы и итераторы: протокол итерации и ленивые потоки"
          },
          "warmup": {
            "en": "Algo warmup: traverse the tree/graph from yesterday's DFS, but write the traversal as a generator function that yields vertices. Compare with recursion that accumulates an array.",
            "ru": "Алго-разминка: обойди дерево/граф из вчерашнего DFS, но оформи обход как функцию-генератор, yield-ящую вершины. Сравни с рекурсией, накапливающей массив."
          },
          "reflectPrompt": {
            "en": "Which existing piece of code that loads everything into an array would benefit from a lazy generator, and which specific resource would it save?",
            "ru": "Какой существующий кусок кода, грузящий всё в массив, выиграл бы от ленивого генератора, и какой именно ресурс он бы сэкономил?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the iterable and iterator protocols (Symbol.iterator, next()/{value,done}), what's under the hood of for...of and spread. Write down the difference between iterable and iterator with a concrete example.",
                "ru": "Теория: протоколы iterable и iterator (Symbol.iterator, next()/{value,done}), что под капотом у for...of и spread. Записать различие iterable vs iterator на конкретном примере."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Write your own generators: a lazy range, an infinite sequence with take(n), and a generator pipeline map/filter without materializing arrays. Measure why this saves memory on large data.",
                "ru": "Написать свой генератор: ленивый range, бесконечная последовательность с take(n), и генератор-пайплайн map/filter без материализации массивов. Замерить, почему это экономит память на больших данных."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Break down two-way exchange in generators: a value in gen.next(value), gen.return() and gen.throw(); where async generators (for await...of) are appropriate for paginated fetching from a DB/queue.",
                "ru": "Разобрать двусторонний обмен в генераторах: значение в gen.next(value), gen.return() и gen.throw(); где async-генераторы (for await...of) уместны для постраничной выгрузки из БД/очереди."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Iteration protocols; function*; for await...of",
                "ru": "Iteration protocols; function*; for await...of"
              }
            },
            {
              "label": {
                "en": "ECMAScript spec / You Don't Know JS",
                "ru": "ECMAScript spec / You Don't Know JS"
              },
              "note": {
                "en": "Generators & Iterators",
                "ru": "Generators & Iterators"
              }
            }
          ]
        },
        {
          "id": "w7d3",
          "track": "sysdesign",
          "title": {
            "en": "Queues and asynchronous processing: transactional outbox",
            "ru": "Очереди и асинхронная обработка: transactional outbox"
          },
          "warmup": {
            "en": "Algo warmup: on paper, model queue processing as level-order BFS — jobs as vertices, retries as re-enqueuing into the queue. Where does this run into ordering and where into duplicates?",
            "ru": "Алго-разминка: на бумаге смоделируй обработку очереди как BFS по уровням — джобы как вершины, ретраи как повторное добавление в очередь. Где это упирается в порядок и где в дубликаты?"
          },
          "reflectPrompt": {
            "en": "Which real queue/outbox incident would have been prevented had the consumer been strictly idempotent?",
            "ru": "Какой реальный инцидент с очередью/outbox был бы предотвращён, будь консьюмер строго идемпотентным?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: why a queue (load smoothing, decoupling, retries), at-least-once vs at-most-once vs the exactly-once illusion. Write down why a dual-write to DB+broker is unreliable and how the outbox fixes it.",
                "ru": "Теория: зачем очередь (сглаживание нагрузки, развязка, ретраи), at-least-once vs at-most-once vs exactly-once-иллюзия. Записать, почему dual-write в БД+брокер ненадёжен и как outbox это чинит."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Theory: how the transactional outbox works — the event is written in the same transaction as the domain data, a relay/poller reads it out and publishes it, marks it as sent; where the loss/duplication points are.",
                "ru": "Теория: как устроен transactional outbox — событие пишется в одной транзакции с доменными данными, relay/poller вычитывает и публикует, помечает отправленным; где точки потери/дублирования."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Design the safeguards: consumer idempotency (a dedup key), backoff and a DLQ, ordering guarantees (partitioning by aggregate key). Write down 3 invariants that must hold if the relay fails at any moment.",
                "ru": "Спроектировать защиту: идемпотентность консьюмера (dedup-ключ), backoff и DLQ, гарантии порядка (партиционирование по ключу агрегата). Записать 3 инварианта, которые должны держаться при сбое relay в любой момент."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Microservices.io",
                "ru": "Microservices.io"
              },
              "note": {
                "en": "Pattern: Transactional Outbox; Idempotent Consumer",
                "ru": "Pattern: Transactional Outbox; Idempotent Consumer"
              }
            },
            {
              "label": {
                "en": "Kleppmann, DDIA",
                "ru": "Kleppmann, DDIA"
              },
              "note": {
                "en": "Chapter 11: Stream Processing, message delivery",
                "ru": "Глава 11: Stream Processing, доставка сообщений"
              }
            }
          ]
        },
        {
          "id": "w7d4",
          "track": "node",
          "title": {
            "en": "Memory and GC in Node: heap snapshots, flame graphs, leak hunting",
            "ru": "Память и GC в Node: heap snapshots, flame graphs, поиск утечек"
          },
          "warmup": {
            "en": "Algo warmup: recall why an unclosed closing context or a growing Map used as a cache with no eviction give O(n) memory growth. Estimate on a snippet what exactly holds the reference.",
            "ru": "Алго-разминка: вспомни, почему незакрытый замыкающий контекст или растущий Map как кэш без вытеснения дают O(n) роста памяти. Прикинь на сниппете, что именно удерживает ссылку."
          },
          "reflectPrompt": {
            "en": "Which cache or subscription currently has no bound/cleanup and could leak under load — and how would you prove it with a snapshot rather than a guess?",
            "ru": "Какой кэш или подписка сейчас не имеет границы/очистки и может утечь под нагрузкой — и как ты это докажешь снимком, а не догадкой?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the V8 heap (new/old space), generational GC (scavenge vs mark-sweep-compact), what retained size and dominators are. Write down the signs of a leak in the heap-used graph: a sawtooth vs monotonic growth.",
                "ru": "Теория: V8 heap (new/old space), generational GC (scavenge vs mark-sweep-compact), что такое retained size и dominators. Записать признаки утечки в графике heap used: пила vs монотонный рост."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Take a heap snapshot of a running service (--inspect / Chrome DevTools), take two snapshots and compare them via the Comparison view. Find a growing class of objects and trace the retainers back to the root.",
                "ru": "Снять heap snapshot работающего сервиса (--inspect / Chrome DevTools), сделать два снимка и сравнить через Comparison view. Найти растущий класс объектов и проследить retainers до корня."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Collect a CPU flame graph (--prof or clinic/0x) on a hot endpoint and find the widest frame.",
                "ru": "Собрать CPU flame graph (--prof или clinic/0x) на горячем эндпоинте и найти самый широкий фрейм."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node.js docs",
                "ru": "Node.js docs"
              },
              "note": {
                "en": "Diagnostics: heap snapshot, --prof, --inspect",
                "ru": "Diagnostics: heap snapshot, --prof, --inspect"
              }
            },
            {
              "label": {
                "en": "V8 dev blog",
                "ru": "V8 dev blog"
              },
              "note": {
                "en": "Orinoco / Generational Garbage Collection",
                "ru": "Orinoco / Generational Garbage Collection"
              }
            },
            {
              "label": {
                "en": "Clinic.js docs",
                "ru": "Clinic.js docs"
              },
              "note": {
                "en": "Doctor & Flame",
                "ru": "Doctor & Flame"
              }
            }
          ]
        },
        {
          "id": "w7d5",
          "track": "distsys",
          "title": {
            "en": "Replication: leader/follower, multi-leader, leaderless, quorums",
            "ru": "Репликация: leader/follower, multi-leader, leaderless, кворумы"
          },
          "warmup": {
            "en": "Algo warmup: model a quorum as a set-intersection condition — work out on paper for which w + r > n reads are guaranteed to see the latest write, for n=3,5.",
            "ru": "Алго-разминка: смоделируй кворум как условие пересечения множеств — реши на бумаге, при каких w + r > n чтения гарантированно видят последнюю запись для n=3,5."
          },
          "reflectPrompt": {
            "en": "Where do you currently read silently from an async replica, and what user-facing bug does this produce under replication lag?",
            "ru": "Где сейчас молча читается с асинхронной реплики, и какой пользовательский баг это даёт под лагом репликации?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: single-leader (sync vs async replication, replication lag, lagging replicas), multi-leader (write conflicts) and leaderless (Dynamo-style). Write down which read anomalies (read-your-writes, monotonic reads) break with an async replica.",
                "ru": "Теория: single-leader (sync vs async репликация, replication lag, отставшие реплики), multi-leader (конфликты записи) и leaderless (Dynamo-стиль). Записать, какие аномалии чтения (read-your-writes, monotonic reads) ломаются при async-реплике."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Break down PostgreSQL: streaming replication, sync vs async standby, reading from a replica and the risk of stale data. Write down what happens if you read from a follower immediately after writing to the leader.",
                "ru": "Разобрать PostgreSQL: streaming replication, sync vs async standby, чтение с реплики и риск устаревших данных. Записать, что происходит, если читать с follower сразу после записи на leader."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Quorums: w + r > n, read repair and anti-entropy, conflict resolution (LWW, versions/vector clocks). Design a quorum scheme on paper for one hypothetical counter and write down where LWW loses a write.",
                "ru": "Кворумы: w + r > n, read repair и anti-entropy, конфликт-резолюция (LWW, версии/векторные часы). Спроектировать на бумаге кворумную схему для одного гипотетического счётчика и записать, где LWW теряет запись."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Kleppmann, DDIA",
                "ru": "Kleppmann, DDIA"
              },
              "note": {
                "en": "Chapter 5: Replication (leader/multi-leader/leaderless, quorums)",
                "ru": "Глава 5: Replication (leader/multi-leader/leaderless, кворумы)"
              }
            },
            {
              "label": {
                "en": "PostgreSQL docs",
                "ru": "PostgreSQL docs"
              },
              "note": {
                "en": "High Availability, Streaming Replication, synchronous_commit",
                "ru": "High Availability, Streaming Replication, synchronous_commit"
              }
            }
          ]
        },
        {
          "id": "w7d6",
          "track": "patterns",
          "title": {
            "en": "Tactical DDD: entity, value object, aggregate, repository",
            "ru": "DDD тактический: entity, value object, aggregate, repository"
          },
          "warmup": {
            "en": "Algo warm-up: take valueOf/equality — decide on what basis two objects are «equal». Write down the difference between comparing by identity (reference/id) and by value (fields); this is the basis for entity vs value object.",
            "ru": "Алго-разминка: возьми valueOf/equality — реши, по какому признаку два объекта «равны». Запиши разницу сравнения по идентичности (ссылка/id) и по значению (поля), это база для entity vs value object."
          },
          "reflectPrompt": {
            "en": "Which business invariant is currently held by scattered checks across services instead of an aggregate boundary — and where could it be violated because of that?",
            "ru": "Какая бизнес-инварианта сейчас держится разрозненными проверками в сервисах вместо границы агрегата — и где из-за этого она может нарушиться?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: entity (identity over time) vs value object (immutable, equality by value) vs aggregate (consistency boundary and invariants) vs repository (access to an aggregate as a collection). Write down the definitions with an example.",
                "ru": "Теория: entity (идентичность во времени) vs value object (иммутабелен, равенство по значению) vs aggregate (граница консистентности и инварианты) vs repository (доступ к агрегату как к коллекции). Записать определения с примером."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Theory: how to model a slice of the domain as an aggregate — identify the root, the invariants, what's inside the boundary and what's only a reference by id; the rule «one transaction = one aggregate».",
                "ru": "Теория: как смоделировать кусок предметной области как aggregate — выделить корень, инварианты, что внутри границы, а что только ссылка по id; правило «одна транзакция = один агрегат»."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how to describe a repository interface for an aggregate (without ORM leaks into the domain) and a couple of value objects (for example status/period) — and which anemic structures are worth turning into value objects.",
                "ru": "Теория: как описать repository-интерфейс для агрегата (без ORM-протечек в домен) и пару value object (например статус/период) — и какие анемичные структуры стоит превратить в value object."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Eric Evans, Domain-Driven Design",
                "ru": "Eric Evans, Domain-Driven Design"
              },
              "note": {
                "en": "Part II: Building Blocks (Entities, Value Objects, Aggregates, Repositories)",
                "ru": "Часть II: Building Blocks (Entities, Value Objects, Aggregates, Repositories)"
              }
            },
            {
              "label": {
                "en": "Vaughn Vernon, Implementing DDD",
                "ru": "Vaughn Vernon, Implementing DDD"
              },
              "note": {
                "en": "Chapters on Aggregates and boundary design",
                "ru": "Главы про Aggregates и проектирование границ"
              }
            }
          ]
        },
        {
          "id": "w7d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What should you consolidate from this week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w8",
      "title": {
        "en": "Week 8",
        "ru": "Неделя 8"
      },
      "phase": "2",
      "theme": "Кучи/union-find/trie, вариантность TS, шардирование, MVCC и индексы",
      "items": [
        {
          "id": "w8d1",
          "track": "dsa",
          "title": {
            "en": "Heaps / priority queue + union-find + trie",
            "ru": "Кучи / priority queue + union-find + trie"
          },
          "warmup": {
            "en": "Week recap: in 10 min, list the binary heap invariants from memory (sift-up/sift-down) and draw the array representation of the heap for [5,3,8,1].",
            "ru": "Рекап недели: за 10 мин по памяти перечисли инварианты бинарной кучи (sift-up/sift-down) и нарисуй массивное представление heap для [5,3,8,1]."
          },
          "reflectPrompt": {
            "en": "Why is build-heap O(n) and not O(n log n) — was I able to justify the amortization across levels?",
            "ru": "Почему build-heap за O(n), а не O(n log n) — смог ли я обосновать амортизацию по уровням?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: binary min/max-heap (array, indices 2i+1/2i+2), push/pop complexity O(log n), build-heap O(n). Write down when you need a priority queue and when a sorted array is enough.",
                "ru": "Теория: бинарная min/max-heap (массив, индексы 2i+1/2i+2), сложности push/pop O(log n), build-heap O(n). Записать, когда нужна priority queue, а когда хватит отсортированного массива."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: implement a MinHeap in TS (push/pop/peek) and solve «Kth Largest Element» and «Merge K Sorted Lists» via a PQ.",
                "ru": "Практика: реализовать MinHeap на TS (push/pop/peek) и решить «Kth Largest Element» и «Merge K Sorted Lists» через PQ."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Study union-find (DSU) with path compression + union by rank, and trie (insert/search/prefix). Implement DSU, solve «Number of Connected Components»; sketch a trie for autocomplete.",
                "ru": "Изучить union-find (DSU) с path compression + union by rank и trie (вставка/поиск/префикс). Реализовать DSU, решить «Number of Connected Components»; набросать trie для автодополнения."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: a «structure → problem» table — heap (top-K, k-way merge, Dijkstra), DSU (components, cycles, Kruskal), trie (prefixes, dictionaries); where a PQ would be useful (for example, retry priority in a queue).",
                "ru": "Теория: таблица «структура → задача» — heap (top-K, k-way merge, Dijkstra), DSU (компоненты, циклы, Kruskal), trie (префиксы, словари); где пригодилась бы PQ (например, приоритет ретраев в очереди)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Big-O",
                "ru": "Big-O"
              },
              "note": {
                "en": "bigocheatsheet.com — heap/DSU/trie operations",
                "ru": "bigocheatsheet.com — heap/DSU/trie операции"
              }
            },
            {
              "label": {
                "en": "CLRS",
                "ru": "CLRS"
              },
              "note": {
                "en": "ch. Heapsort and Priority Queues; Disjoint Sets",
                "ru": "гл. Heapsort и Priority Queues; Disjoint Sets"
              }
            }
          ]
        },
        {
          "id": "w8d2",
          "track": "ts",
          "title": {
            "en": "Variance (co/contra/bi) + advanced utility types",
            "ru": "Вариантность (co/contra/bi) + продвинутые utility-типы"
          },
          "warmup": {
            "en": "Algo warm-up: in 8 min, implement trie insertion from memory (from yesterday) or MinHeap.push.",
            "ru": "Алго-разминка: за 8 мин по памяти реализовать вставку в trie (из вчерашнего) или MinHeap.push."
          },
          "reflectPrompt": {
            "en": "Where in my real code does method bivariance hide a potential typing bug?",
            "ru": "В каком месте моего реального кода бивариантность методов скрывает потенциальный баг типизации?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: covariance/contravariance/bivariance in TS. Break down why function parameters are contravariant (strictFunctionTypes) and return values covariant; why methods are bivariant. Write down 3 examples where this breaks safety.",
                "ru": "Теория: ковариантность/контравариантность/бивариантность в TS. Разобрать, почему параметры функций контравариантны (strictFunctionTypes), а возвращаемые значения ковариантны; почему методы бивариантны. Записать 3 примера, где это ломает безопасность."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: write examples where a `Dog[]` array can't be substituted as `Animal[]` for writing; demonstrate contravariance on event-handler callbacks; break down the `in`/`out` variance modifiers in generics.",
                "ru": "Практика: написать примеры, где массив `Dog[]` нельзя подставлять как `Animal[]` для записи; продемонстрировать contravariance на колбэках обработчиков событий; разобрать `in`/`out` модификаторы вариантности в дженериках."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Study and implement your own utility types: `DeepPartial<T>`, `DeepReadonly<T>`, `RequireAtLeastOne<T>`, and break down the built-in `Awaited`/`Parameters`/`ReturnType` via conditional + infer.",
                "ru": "Изучить и реализовать свои utility-типы: `DeepPartial<T>`, `DeepReadonly<T>`, `RequireAtLeastOne<T>`, разбор встроенных `Awaited`/`Parameters`/`ReturnType` через conditional + infer."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: where variance matters in event types (payloads) — for example, why a handler for a more general event safely accepts a more specific payload, but not the other way around.",
                "ru": "Теория: где в типах событий (payload-ах) вариантность важна — например, почему обработчик более общего события безопасно принимает более конкретный payload, а наоборот нет."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "TS Handbook",
                "ru": "TS Handbook"
              },
              "note": {
                "en": "Type Compatibility; Variance; strictFunctionTypes",
                "ru": "Type Compatibility; Variance; strictFunctionTypes"
              }
            },
            {
              "label": {
                "en": "TS docs",
                "ru": "TS docs"
              },
              "note": {
                "en": "Utility Types; Conditional Types (infer)",
                "ru": "Utility Types; Conditional Types (infer)"
              }
            }
          ]
        },
        {
          "id": "w8d3",
          "track": "sysdesign",
          "title": {
            "en": "Sharding/partitioning + consistent hashing",
            "ru": "Шардирование/партиционирование + consistent hashing"
          },
          "warmup": {
            "en": "Algo warm-up: review DSU (union/find with path compression) from memory in 8 min — useful for building intuition about «buckets».",
            "ru": "Алго-разминка: повторить DSU (union/find с path compression) по памяти за 8 мин — пригодится для интуиции про «бакеты»."
          },
          "reflectPrompt": {
            "en": "Which shard key would I choose for my system, and which class of queries would it make expensive?",
            "ru": "Какой ключ шарда я выбрал бы для своей системы и какой класс запросов он сделает дорогим?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: horizontal sharding vs partitioning a single DB. Shard key strategies: hash, range, directory/lookup. Write down the pros/cons of each and the hotspot/unbalanced-shard problem.",
                "ru": "Теория: горизонтальное шардирование vs партиционирование одной БД. Стратегии ключа шарда: hash, range, directory/lookup. Записать плюсы/минусы каждой и проблему hotspot/несбалансированных шардов."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Study consistent hashing: the ring, virtual nodes, why adding/removing a node moves ~1/N of the keys rather than all of them. Draw the ring and trace the rebalancing when a node is added.",
                "ru": "Изучить consistent hashing: кольцо, виртуальные ноды, почему добавление/удаление ноды перемещает ~1/N ключей, а не все. Нарисовать кольцо и проследить ребалансировку при добавлении узла."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: how to design sharding for an events table — choosing the shard key (tenant_id vs event_id), estimating cross-shard queries and rebalancing; what breaks with range queries over time.",
                "ru": "Теория: как спроектировать шардирование для таблицы событий — выбор ключа шарда (tenant_id vs event_id), оценка cross-shard запросов и rebalancing; что ломается при range-запросах по времени."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: a checklist for choosing a sharding strategy (access pattern → key → rebalance → distributed transactions/joins); where cross-shard aggregation becomes the bottleneck.",
                "ru": "Теория: чек-лист выбора стратегии шардирования (паттерн доступа → ключ → ребаланс → распределённые транзакции/джойны); где cross-shard агрегация становится узким местом."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "DDIA",
                "ru": "DDIA"
              },
              "note": {
                "en": "ch. 6 Partitioning (Kleppmann)",
                "ru": "гл. 6 Partitioning (Kleppmann)"
              }
            },
            {
              "label": {
                "en": "Dynamo",
                "ru": "Dynamo"
              },
              "note": {
                "en": "Amazon Dynamo paper — consistent hashing, virtual nodes",
                "ru": "Amazon Dynamo paper — consistent hashing, virtual nodes"
              }
            }
          ]
        },
        {
          "id": "w8d4",
          "track": "js",
          "title": {
            "en": "Proxy / Reflect / WeakMap / WeakRef / Symbol",
            "ru": "Proxy / Reflect / WeakMap / WeakRef / Symbol"
          },
          "warmup": {
            "en": "Algo warm-up: review «Kth Largest» via heap in 8 min.",
            "ru": "Алго-разминка: повторить «Kth Largest» через heap за 8 мин."
          },
          "reflectPrompt": {
            "en": "In which cache or registry would WeakMap/WeakRef remove a hidden memory leak?",
            "ru": "В каком кэше или реестре WeakMap/WeakRef убрал бы скрытую утечку памяти?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: meta-programming via Proxy (traps: get/set/has/apply) and the paired Reflect API. Write down why you use Reflect inside a trap (correct `receiver`, default behavior).",
                "ru": "Теория: meta-программирование через Proxy (traps: get/set/has/apply) и парный API Reflect. Записать, зачем Reflect внутри trap (корректный `receiver`, дефолтное поведение)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: implement a logging wrapper and write validation on an object via Proxy; build a reactive object (a minimal observable) on Proxy+Reflect. Measure the overhead vs direct access.",
                "ru": "Практика: реализовать через Proxy логирующую обёртку и валидацию записи в объект; сделать reactive-объект (минимальный observable) на Proxy+Reflect. Замерить накладные расходы vs прямой доступ."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Study WeakMap/WeakSet/WeakRef/FinalizationRegistry: why the keys don't hold off GC, typical leaks and use cases (private data, cache keyed by an object). Symbol and well-known symbols (Symbol.iterator, Symbol.asyncIterator).",
                "ru": "Изучить WeakMap/WeakSet/WeakRef/FinalizationRegistry: почему ключи не держат GC, типичные утечки и кейсы (приватные данные, кэш по объекту-ключу). Symbol и well-known символы (Symbol.iterator, Symbol.asyncIterator)."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: where in a Node service to be careful with Proxy (hot path — overhead) and where WeakMap solves a memory leak (for example, metadata keyed by request/session objects without manual cleanup).",
                "ru": "Теория: где в Node-сервисе осторожно с Proxy (горячий путь — overhead) и где WeakMap решает утечку памяти (например, метаданные по объектам запроса/сессии без ручной очистки)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Proxy; Reflect; WeakMap; WeakRef; Symbol",
                "ru": "Proxy; Reflect; WeakMap; WeakRef; Symbol"
              }
            },
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "FinalizationRegistry; --expose-gc for experiments",
                "ru": "FinalizationRegistry; --expose-gc для экспериментов"
              }
            }
          ]
        },
        {
          "id": "w8d5",
          "track": "db",
          "title": {
            "en": "MVCC + index types (B-tree/GIN/GiST/BRIN/partial/covering)",
            "ru": "MVCC + типы индексов (B-tree/GIN/GiST/BRIN/частичные/покрывающие)"
          },
          "warmup": {
            "en": "Algo warm-up: review binary search from memory in 8 min — a bridge to building intuition about B-tree traversal.",
            "ru": "Алго-разминка: повторить бинпоиск по памяти за 8 мин — мостик к интуиции про B-tree обход."
          },
          "reflectPrompt": {
            "en": "Where would you place a partial or covering index instead of a plain B-tree, and why is it more advantageous?",
            "ru": "Где бы ты поставил частичный или покрывающий индекс вместо обычного B-tree и почему это выгоднее?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: MVCC in PostgreSQL — row versions (xmin/xmax), snapshot isolation, why VACUUM is needed and what bloat/dead tuples are. Write down how MVCC differs from read locks.",
                "ru": "Теория: MVCC в PostgreSQL — версии строк (xmin/xmax), snapshot isolation, зачем VACUUM и что такое bloat/dead tuples. Записать, чем MVCC отличается от блокировок на чтение."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: run two concurrent transactions in psql, observe row visibility; turn on `EXPLAIN (ANALYZE, BUFFERS)` on a query and read the plan (Index Scan vs Seq Scan vs Bitmap).",
                "ru": "Практика: выполнить два конкурентных транзакции в psql, посмотреть видимость строк; включить `EXPLAIN (ANALYZE, BUFFERS)` на запросе и прочитать план (Index Scan vs Seq Scan vs Bitmap)."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Study index types: B-tree (ranges/sorting), GIN (jsonb/full-text/arrays), GiST (geometry/range), BRIN (large tables sorted by time), partial and covering (INCLUDE). Pick an index for 3 different queries.",
                "ru": "Изучить типы индексов: B-tree (диапазоны/сортировка), GIN (jsonb/полнотекст/массивы), GiST (геометрия/range), BRIN (большие отсортированные по времени таблицы), частичные и покрывающие (INCLUDE). Подобрать индекс под 3 разных запроса."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: for an outbox table — which index for «unprocessed events» (partial WHERE processed=false), which for searching by jsonb payload (GIN), which for selecting by time (BRIN).",
                "ru": "Теория: для таблицы outbox — какой индекс под «не обработанные события» (частичный WHERE processed=false), какой под поиск по jsonb-payload (GIN), какой под выборку по времени (BRIN)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "PostgreSQL docs",
                "ru": "PostgreSQL docs"
              },
              "note": {
                "en": "MVCC; Index Types; Index-Only Scans",
                "ru": "MVCC; Index Types; Index-Only Scans"
              }
            },
            {
              "label": {
                "en": "PostgreSQL docs",
                "ru": "PostgreSQL docs"
              },
              "note": {
                "en": "EXPLAIN; Routine Vacuuming",
                "ru": "EXPLAIN; Routine Vacuuming"
              }
            }
          ]
        },
        {
          "id": "w8d6",
          "track": "patterns",
          "title": {
            "en": "Strategic DDD + CQRS",
            "ru": "DDD стратегический + CQRS"
          },
          "warmup": {
            "en": "Algo warm-up: review any problem from this week from memory (heap/DSU/trie) in 10 min.",
            "ru": "Алго-разминка: повторить любую задачу недели по памяти (heap/DSU/trie) за 10 мин."
          },
          "reflectPrompt": {
            "en": "Where do the bounded context boundaries currently leak, and which integration pattern would fix it?",
            "ru": "Где границы bounded context сейчас протекают и какой паттерн интеграции это бы починил?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: strategic DDD — bounded context, ubiquitous language, context map (integration patterns: ACL, conformist, customer/supplier, shared kernel). Write down how a bounded context differs from a microservice.",
                "ru": "Теория: стратегический DDD — bounded context, ubiquitous language, context map (паттерны интеграции: ACL, conformist, customer/supplier, shared kernel). Записать, чем bounded context отличается от микросервиса."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Theory: how to build a context map — identify 2-3 contexts, mark the relationships and where an Anti-Corruption Layer is needed at the boundary with external systems.",
                "ru": "Теория: как строить context map — выделить 2-3 контекста, обозначить отношения и где нужен Anti-Corruption Layer на границе с внешними системами."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Study CQRS: separating commands and queries, separate read models, the connection to event-driven and outbox (how timeline events build read projections). Write down when CQRS is justified and when it's over-engineering.",
                "ru": "Изучить CQRS: разделение команд и запросов, отдельные read-модели, связь с event-driven и outbox (как timeline-события строят проекции для чтения). Записать, когда CQRS оправдан, а когда это оверинжиниринг."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Behavioral reflection: recall a case where blurry context boundaries (or a shared DB between teams) led to a conflict/incident. Write down Situation→Action→Result and how a staff engineer would draw the boundary.",
                "ru": "Behavioral-рефлексия: вспомнить случай, где размытые границы контекста (или общая БД между командами) привели к конфликту/инциденту. Записать Ситуация→Действие→Результат и как staff-инженер провёл бы границу."
              },
              "guidance": {
                "en": "A strong answer: you frame the problem as a data-ownership boundary, not as someone's fault. You propose an explicit contract between teams (API/events instead of a shared table), an Anti-Corruption Layer at the seam, and a single owner for each context. Staff markers: the migration is incremental and reversible, there's a metric for boundary «leaks», and the agreement is committed to writing.",
                "ru": "Сильный ответ: проблему называешь как границу владения данными, а не как чью-то вину. Предлагаешь явный контракт между командами (API/события вместо общей таблицы), Anti-Corruption Layer на стыке и одного владельца у каждого контекста. Staff-маркеры: миграция поэтапная и обратимая, есть метрика «протечек» границы, договорённость закреплена письменно."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Eric Evans — Domain-Driven Design (Strategic Design)",
                "ru": "Eric Evans — Domain-Driven Design (Strategic Design)"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Vaughn Vernon — Implementing DDD; martinfowler.com — CQRS",
                "ru": "Vaughn Vernon — Implementing DDD; martinfowler.com — CQRS"
              }
            }
          ]
        },
        {
          "id": "w8d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What should you consolidate from this week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w9",
      "title": {
        "en": "Week 9",
        "ru": "Неделя 9"
      },
      "phase": "2",
      "theme": "Динамика, declaration-файлы TS, async_hooks, планировщик Postgres, Event Sourcing",
      "items": [
        {
          "id": "w9d1",
          "track": "dsa",
          "title": {
            "en": "1D/2D dynamic programming: climbing stairs, house robber, LCS",
            "ru": "Динамика 1D/2D: climbing stairs, house robber, LCS"
          },
          "warmup": {
            "en": "Solve Fibonacci two ways: naive recursion and bottom-up with two variables. Compare the number of calls and the O().",
            "ru": "Реши Fibonacci двумя способами: наивная рекурсия и снизу-вверх с двумя переменными. Сравни число вызовов и O()."
          },
          "reflectPrompt": {
            "en": "Was I able to state the transition in words before I started writing code, or did I fit the formula to the examples?",
            "ru": "Смог ли я сформулировать переход словами до того, как начал писать код, или подгонял формулу под примеры?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: what a subproblem and a transition (recurrence) are. Write down the recipe: state → transition → base case → evaluation order. Break down when O(1) memory is enough (rolling variables) and when you need a full array/table.",
                "ru": "Теория: что такое подзадача и переход (recurrence). Записать рецепт: состояние → переход → база → порядок вычисления. Разобрать, когда хватает O(1) памяти (rolling variables), а когда нужен полный массив/таблица."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Solve 1D: Climbing Stairs and House Robber. For each, write out the state and transition in words BEFORE the code, then reduce the memory to O(1).",
                "ru": "Решить 1D: Climbing Stairs и House Robber. Для каждой выписать состояние и переход словами ДО кода, затем свести память к O(1)."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Solve 2D: Longest Common Subsequence via a dp[i][j] table. Fill in the table by hand on a small example.",
                "ru": "Решить 2D: Longest Common Subsequence через таблицу dp[i][j]. Заполнить таблицу на маленьком примере руками."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: how top-down (memoization) differs from bottom-up in terms of memory and call stack; when to choose which.",
                "ru": "Теория: чем top-down (мемоизация) отличается от bottom-up по памяти и стеку вызовов; когда какой выбирать."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "CLRS — Dynamic Programming chapter (LCS, rod cutting)",
                "ru": "CLRS — глава Dynamic Programming (LCS, rod cutting)"
              }
            },
            {
              "label": {
                "en": "NeetCode",
                "ru": "NeetCode"
              },
              "note": {
                "en": "1-D and 2-D Dynamic Programming — list of patterns",
                "ru": "1-D и 2-D Dynamic Programming — список паттернов"
              }
            }
          ]
        },
        {
          "id": "w9d2",
          "track": "ts",
          "title": {
            "en": "Declaration files, module augmentation and compiler strictness",
            "ru": "Declaration-файлы, module augmentation и строгость компилятора"
          },
          "warmup": {
            "en": "Algo warm-up: review House Robber from memory in 10 min, state the transition out loud.",
            "ru": "Алго-разминка: повтори House Robber по памяти за 10 мин, проговори переход вслух."
          },
          "reflectPrompt": {
            "en": "Which strictness flag exposed a hidden assumption in my code that I wasn't aware of?",
            "ru": "Какой флаг строгости вскрыл скрытое предположение в моём коде, о котором я не подозревал?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: what .d.ts, declare module/global, and ambient declarations are; why @types exists and how TS resolves types for a JS package without types. Write down the difference between typing code and describing an external module.",
                "ru": "Теория: что такое .d.ts, declare module/global, ambient-декларации; зачем @types и как TS резолвит типы для JS-пакета без типов. Записать разницу между типизацией кода и описанием внешнего модуля."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: write a .d.ts for a small untyped JS module; wire it up via typeRoots/paths and verify the types are visible.",
                "ru": "Практика: написать .d.ts для маленького нетипизированного JS-модуля; подключить через typeRoots/paths и проверить, что типы видны."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Module augmentation practice: extend an existing interface — for example, add a field to the Express Request — via declare module; understand why augmentation specifically, not a redefinition.",
                "ru": "Практика module augmentation: расширить существующий интерфейс — например, добавить поле в Express Request — через declare module; понять, почему именно augmentation, а не переопределение."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Study strictness flags: strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride. Enable one new flag on a piece of code and write down which real bugs/assumptions it exposed.",
                "ru": "Изучить флаги строгости: strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride. Включить один новый флаг на куске кода и записать, какие реальные баги/допущения он вскрыл."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "TS Handbook",
                "ru": "TS Handbook"
              },
              "note": {
                "en": "Declaration Files (.d.ts), Declaration Merging",
                "ru": "Declaration Files (.d.ts), Declaration Merging"
              }
            },
            {
              "label": {
                "en": "TS docs",
                "ru": "TS docs"
              },
              "note": {
                "en": "tsconfig — Strict checks (Type Checking section)",
                "ru": "tsconfig — Strict checks (раздел Type Checking)"
              }
            }
          ]
        },
        {
          "id": "w9d3",
          "track": "sysdesign",
          "title": {
            "en": "Full case study: activity feed / timeline",
            "ru": "Разбор кейса целиком: лента активности / timeline"
          },
          "warmup": {
            "en": "Algo warm-up: review LCS — on paper, fill in the table for two short strings in 10 min.",
            "ru": "Алго-разминка: повтори LCS — на бумаге заполни таблицу для двух коротких строк за 10 мин."
          },
          "reflectPrompt": {
            "en": "Which architectural choice for the timeline did I make out of habit rather than because it's optimal for the load profile?",
            "ru": "Какой архитектурный выбор для timeline я сделал по инерции, а не потому что он оптимален для профиля нагрузки?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Go through the 4 analysis steps for an activity timeline: requirements (who writes/reads, volumes, what counts as «activity»), estimates of read/write QPS and storage, high-level schema, bottlenecks. Write it up as a mini design doc.",
                "ru": "Пройти 4 шага разбора для activity-timeline: требования (кто пишет/читает, объёмы, что считается «активностью»), оценки QPS чтения/записи и хранилища, high-level схема, узкие места. Записать как мини design doc."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Compare fan-out on write (push into followers' feeds) and fan-out on read (assemble at query time): which is more advantageous on which load profiles, the «celebrity» problem with millions of followers, the hybrid. Record the choice and the rationale.",
                "ru": "Сравнить fan-out on write (push в ленты подписчиков) и fan-out on read (сборка при запросе): на каких профилях нагрузки что выгоднее, проблема «звёзд» с миллионами подписчиков, гибрид. Зафиксировать выбор и обоснование."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Design the storage model and pagination: cursor-based on (created_at, id), a hot feed cache, deduplication and event idempotency.",
                "ru": "Спроектировать модель хранения и пагинацию: cursor-based по (created_at, id), горячий кеш ленты, дедупликация и идемпотентность событий."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Write down 3 open questions/trade-offs I would raise in an RFC for this case (feed consistency, deleting/editing events, ranking vs chronology).",
                "ru": "Записать 3 открытых вопроса/трейдоффа, которые я бы вынес в RFC по этому кейсу (консистентность ленты, удаление/редактирование событий, ранжирование vs хронология)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "System Design",
                "ru": "System Design"
              },
              "note": {
                "en": "Design a News Feed / Timeline — the standard case (fan-out trade-offs)",
                "ru": "Design a News Feed / Timeline — стандартный кейс (fan-out trade-offs)"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Designing Data-Intensive Applications, ch. 1 (Twitter timeline example)",
                "ru": "Designing Data-Intensive Applications, гл. 1 (Twitter timeline пример)"
              }
            }
          ]
        },
        {
          "id": "w9d4",
          "track": "node",
          "title": {
            "en": "AsyncLocalStorage, async_hooks, and context propagation across errors",
            "ru": "AsyncLocalStorage, async_hooks и распространение контекста при ошибках"
          },
          "warmup": {
            "en": "Algo warm-up: solve Min Cost Climbing Stairs (a DP variation) in 12 min, reduce memory to O(1).",
            "ru": "Алго-разминка: реши Min Cost Climbing Stairs (вариация DP) за 12 мин, сведи память к O(1)."
          },
          "reflectPrompt": {
            "en": "Where am I currently passing requestId by hand through layers, and where would ALS remove that noise?",
            "ru": "В каком месте я сейчас вручную таскаю requestId через слои, и где ALS убрал бы этот шум?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: why async_hooks and AsyncLocalStorage exist, how context is preserved across await/callbacks/Promise chains, why this is better than passing requestId as a parameter through the whole stack. Write down the cost and performance caveats.",
                "ru": "Теория: зачем async_hooks и AsyncLocalStorage, как сохраняется контекст через await/callbacks/Promise-цепочки, чем это лучше передачи requestId параметром по всему стеку. Записать стоимость и оговорки по производительности."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: build a middleware that puts correlationId/traceId into AsyncLocalStorage, and a logger that automatically mixes it into every entry. Verify the id survives several awaits.",
                "ru": "Практика: сделать middleware, кладущий correlationId/traceId в AsyncLocalStorage, и логгер, который автоматически подмешивает его во все записи. Проверить, что id переживает несколько await."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Error practice: model where context is lost (event emitters, setInterval, pools), and where unhandledRejection/uncaughtException break propagation. Write down the pattern for correctly wrapping errors without losing context.",
                "ru": "Практика на ошибках: смоделировать, где контекст теряется (event emitters, setInterval, пулы), и где unhandledRejection/uncaughtException ломают propagation. Записать паттерн корректного оборачивания ошибок без потери контекста."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: how AsyncLocalStorage simplifies incident tracing — an end-to-end id across queues/workers; which boundaries (process boundary) it does not cross.",
                "ru": "Теория: как AsyncLocalStorage упрощает трассировку инцидента — сквозной id через очереди/воркеры; какие границы (process boundary) он не пересекает."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "AsyncLocalStorage; async_hooks",
                "ru": "AsyncLocalStorage; async_hooks"
              }
            },
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "process — events 'uncaughtException', 'unhandledRejection'",
                "ru": "process — events 'uncaughtException', 'unhandledRejection'"
              }
            }
          ]
        },
        {
          "id": "w9d5",
          "track": "db",
          "title": {
            "en": "The Postgres planner, EXPLAIN (ANALYZE, BUFFERS), and queue locking (FOR UPDATE SKIP LOCKED)",
            "ru": "Планировщик Postgres, EXPLAIN (ANALYZE, BUFFERS) и блокировки очереди (FOR UPDATE SKIP LOCKED)"
          },
          "warmup": {
            "en": "Algo warm-up: review the House Robber transition and estimate how it maps onto \"state = table row\". 10 min.",
            "ru": "Алго-разминка: повтори переход House Robber и оцени, как он отображается на «состояние = строка таблицы». 10 мин."
          },
          "reflectPrompt": {
            "en": "What discrepancy between the plan and reality did I see in EXPLAIN ANALYZE, and what does it tell me about my indexes or statistics?",
            "ru": "Какое расхождение между планом и реальностью я увидел в EXPLAIN ANALYZE, и что оно говорит о моих индексах или статистике?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: how the planner chooses a plan (cost model, statistics, Seq Scan vs Index Scan vs Bitmap), what ANALYZE and random_page_cost change. Write down how to read the plan tree top-down.",
                "ru": "Теория: как планировщик выбирает план (cost model, статистика, Seq Scan vs Index Scan vs Bitmap), что меняет ANALYZE и random_page_cost. Записать, как читать дерево плана сверху вниз."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: on any non-trivial query run EXPLAIN (ANALYZE, BUFFERS); compare estimated vs actual rows, find statistics discrepancies, look at shared hit/read (buffers). Note where the plan falls back to a Seq Scan and why.",
                "ru": "Практика: на любом нетривиальном запросе запустить EXPLAIN (ANALYZE, BUFFERS); сопоставить estimated vs actual rows, найти расхождение статистики, посмотреть shared hit/read (буферы). Зафиксировать, где план уходит в Seq Scan и почему."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Isolation theory + practice: levels (Read Committed, Repeatable Read, Serializable), what row locks are, deadlock. Reproduce two concurrent UPDATEs and observe the wait/deadlock.",
                "ru": "Теория+практика изоляции: уровни (Read Committed, Repeatable Read, Serializable), что такое блокировки строк, deadlock. Воспроизвести два конкурентных UPDATE и посмотреть ожидание/дедлок."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Queue pattern: implement task selection via SELECT ... FOR UPDATE SKIP LOCKED — the correct way to hand work out to queue workers without double-processing; compare with advisory locks.",
                "ru": "Паттерн очереди: реализовать выборку задач через SELECT ... FOR UPDATE SKIP LOCKED — правильный способ раздавать работу воркерам очереди без двойной обработки; сравнить с advisory locks."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "PostgreSQL docs",
                "ru": "PostgreSQL docs"
              },
              "note": {
                "en": "Using EXPLAIN; Transaction Isolation; Explicit Locking (FOR UPDATE / SKIP LOCKED)",
                "ru": "Using EXPLAIN; Transaction Isolation; Explicit Locking (FOR UPDATE / SKIP LOCKED)"
              }
            },
            {
              "label": {
                "en": "PostgreSQL docs",
                "ru": "PostgreSQL docs"
              },
              "note": {
                "en": "Planner Cost Constants; How the Planner Uses Statistics",
                "ru": "Planner Cost Constants; How the Planner Uses Statistics"
              }
            }
          ]
        },
        {
          "id": "w9d6",
          "track": "patterns",
          "title": {
            "en": "Event Sourcing + Saga + Outbox: theory and practice",
            "ru": "Event Sourcing + Saga + Outbox: теория и практика"
          },
          "warmup": {
            "en": "Algo warm-up: review LCS from memory, articulate why it's 2D DP and not greedy. 10 min.",
            "ru": "Алго-разминка: повтори LCS по памяти, проговори, почему это 2D-DP, а не жадность. 10 мин."
          },
          "reflectPrompt": {
            "en": "Where are we paying the price of eventual consistency without having made it a conscious architectural choice?",
            "ru": "Где мы платим цену eventual consistency, не сделав это осознанным архитектурным выбором?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Event Sourcing theory: state as an event log, projections/read-models, replay, event versioning, snapshots. Write down the honest downsides (event schema evolution, eventual consistency of projections) and when ES is not needed.",
                "ru": "Теория Event Sourcing: состояние как лог событий, проекции/read-models, replay, версионирование событий, snapshots. Записать честные минусы (эволюция схемы событий, eventual consistency проекций) и когда ES не нужен."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Saga theory: orchestration vs choreography, compensating transactions instead of distributed 2PC. Sketch a saga for a multi-step process and think through the compensations for a failure at step N.",
                "ru": "Теория Saga: оркестрация vs хореография, компенсирующие транзакции вместо распределённого 2PC. Набросать сагу для многошагового процесса и продумать компенсации при сбое на шаге N."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Outbox theory: why dual-write to the DB and broker is unsafe, how a transactional outbox + relay gives at-least-once, the role of idempotency on the consumer. Write down the weak spots of a typical implementation.",
                "ru": "Теория Outbox: почему dual-write в БД и брокер небезопасен, как transactional outbox + relay даёт at-least-once, роль идемпотентности на потребителе. Записать слабые места типичной реализации."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Weekly behavioral reflection: recall a case where I influenced an architectural decision (e.g., choosing outbox/event-driven) without formal authority. Write it down in Situation→Action→Result form for the staff narrative.",
                "ru": "Behavioral-рефлексия недели: вспомнить случай, где я повлиял на архитектурное решение (например, выбор outbox/event-driven) без формальной власти. Записать в формате Ситуация→Действие→Результат для staff-нарратива."
              },
              "guidance": {
                "en": "Strong answer: the decision is justified by trade-offs for the load profile, not by fashion. You compared alternatives (dual-write, CDC, outbox), showed the risks of each, and built consensus through a prototype and numbers. Staff markers: explicitly named the price of eventual consistency, planned for rollback, and wrote it up as an ADR with an Alternatives section.",
                "ru": "Сильный ответ: решение обосновано трейдоффами под профиль нагрузки, а не модой. Сравнил альтернативы (dual-write, CDC, outbox), показал риски каждой, собрал согласие через прототип и числа. Staff-маркеры: явно назвал цену eventual consistency, предусмотрел откат, оформил как ADR с разделом Alternatives."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "microservices.io",
                "ru": "microservices.io"
              },
              "note": {
                "en": "Patterns: Event Sourcing, Saga, Transactional Outbox",
                "ru": "Patterns: Event Sourcing, Saga, Transactional Outbox"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Vaughn Vernon — Implementing DDD (Event Sourcing, Sagas/Process Managers)",
                "ru": "Vaughn Vernon — Implementing DDD (Event Sourcing, Sagas/Process Managers)"
              }
            }
          ]
        },
        {
          "id": "w9d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What to consolidate from the week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w10",
      "title": {
        "en": "Week 10",
        "ru": "Неделя 10"
      },
      "phase": "3",
      "theme": "DP advanced, профилирование, репликация БД, капстоун (старт)",
      "items": [
        {
          "id": "w10d1",
          "track": "dsa",
          "title": {
            "en": "Advanced DP: intervals and subsequences",
            "ru": "Динамика advanced: интервалы и подпоследовательности"
          },
          "warmup": {
            "en": "Week recap: write down the transition formula for classic 1D DP (House Robber or LIS O(n^2)) from memory in 10 min — state, transition, base case.",
            "ru": "Рекап недели: запиши формулу перехода для классической 1D-динамики (House Robber или LIS O(n^2)) по памяти за 10 мин — состояние, переход, база."
          },
          "reflectPrompt": {
            "en": "What was harder to see: the DP state itself or the correct traversal order, and why?",
            "ru": "Что было труднее увидеть: само состояние DP или корректный порядок обхода, и почему?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the two families of advanced DP. Interval DP (dp[i][j] over a subsegment, traversal by segment length) and DP over subsequences (LIS/LCS). Write down the common template: what the state is, how it grows by length, where the base case is.",
                "ru": "Теория: два семейства advanced-DP. Интервальная (dp[i][j] по подотрезку, обход по длине отрезка) и DP на подпоследовательностях (LIS/LCS). Записать общий шаблон: что есть состояние, как растёт по длине, где база."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Solve LCS and LIS: LIS first in O(n^2), then in O(n log n) via binary search over tails.",
                "ru": "Решить LCS и LIS: LIS сначала O(n^2), потом O(n log n) через бинпоиск по хвостам."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Solve one interval problem: Matrix Chain Multiplication or Burst Balloons; break down why the traversal is by interval length rather than by indices left to right.",
                "ru": "Решить одну интервальную задачу: Matrix Chain Multiplication или Burst Balloons; разобрать, почему обход именно по длине интервала, а не по индексам слева направо."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "CLRS",
                "ru": "CLRS"
              },
              "note": {
                "en": "Dynamic Programming chapter: matrix-chain, LCS",
                "ru": "глава Dynamic Programming: matrix-chain, LCS"
              }
            },
            {
              "label": {
                "en": "cp-algorithms.com",
                "ru": "cp-algorithms.com"
              },
              "note": {
                "en": "LIS (including O(n log n)) and interval DP",
                "ru": "LIS (включая O(n log n)) и интервальная DP"
              }
            }
          ]
        },
        {
          "id": "w10d2",
          "track": "node",
          "title": {
            "en": "Node profiling: perf_hooks, --inspect, flame graphs",
            "ru": "Профилирование Node: perf_hooks, --inspect, flame graphs"
          },
          "warmup": {
            "en": "Algo warm-up: solve Kadane (Maximum Subarray) in 10 min — a repeat of yesterday's DP pattern, articulate O(n)/O(1).",
            "ru": "Алго-разминка: реши Kadane (Maximum Subarray) за 10 мин — повтор DP-паттерна из вчерашнего дня, проговори O(n)/O(1)."
          },
          "reflectPrompt": {
            "en": "Where did the measurement contradict my intuition about what the bottleneck was?",
            "ru": "Где замер противоречил моей интуиции о том, что было узким местом?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: CPU diagnostics tools in Node. perf_hooks (performance.now, PerformanceObserver, mark/measure), --inspect + Chrome DevTools CPU profile, --prof + tick-processor, generating a flame graph. Write down which tool answers which question (function latency vs hot stack vs allocations).",
                "ru": "Теория: инструменты диагностики CPU в Node. perf_hooks (performance.now, PerformanceObserver, mark/measure), --inspect + Chrome DevTools CPU-профиль, --prof + tick-processor, генерация flame graph. Записать, какой инструмент для какого вопроса (latency функции vs горячий стек vs аллокации)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: take a real or synthetic hot path (e.g., serializing a large payload or a CPU-bound transformation), measure it with perf_hooks, then capture a CPU profile via --inspect and find the top 3 self-functions by self-time.",
                "ru": "Практика: взять реальный или синтетический горячий путь (например сериализация большого payload или CPU-bound трансформация), обмерить через perf_hooks, затем снять CPU-профиль через --inspect и найти top-3 самофункции по self-time."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Do: build a flame graph for this path, mark the widest frame. Write down the conclusion — where time is actually spent versus where you thought it was before measuring.",
                "ru": "Сделать: построить flame graph по этому пути, отметить самый широкий фрейм. Записать вывод — где время реально тратится против того, где ты думал до замера."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: a checklist for \"how to approach a perf incident in prod\" — the order of steps from the p99 metric to the flame graph, so you don't optimize blindly.",
                "ru": "Теория: чек-лист «как подходить к перф-инциденту в проде» — порядок шагов от метрики p99 до flame graph, чтобы не оптимизировать вслепую."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "perf_hooks (Performance measurement APIs)",
                "ru": "perf_hooks (Performance measurement APIs)"
              }
            },
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "Diagnostics — Profiling and Flame Graphs (guide)",
                "ru": "Diagnostics — Profiling и Flame Graphs (guide)"
              }
            }
          ]
        },
        {
          "id": "w10d3",
          "track": "sysdesign",
          "title": {
            "en": "Full design: a notifications system + a real design doc",
            "ru": "Полный дизайн: система нотификаций + настоящий design doc"
          },
          "warmup": {
            "en": "Algo warm-up: solve Merge Intervals in 10 min — a repeat of the segment pattern, echoing interval DP.",
            "ru": "Алго-разминка: реши Merge Intervals за 10 мин — повтор паттерна на отрезках, перекликается с интервальной DP."
          },
          "reflectPrompt": {
            "en": "Which of the decisions I made will I be least able to defend under pressure, and what fact am I missing for that?",
            "ru": "Какое из принятых решений я хуже всего смогу защитить под напором, и какого факта мне для этого не хватает?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Requirements and estimates: pin down the functional ones (push/email/SMS/in-app, templates, user preferences, deduplication) and the non-functional ones (delivery, latency, spikes). Estimate QPS and storage on a napkin for the target DAU.",
                "ru": "Требования и оценки: фиксировать функциональные (push/email/SMS/in-app, шаблоны, предпочтения пользователя, дедупликация) и нефункциональные (доставка, latency, всплески). Оценить QPS и хранилище на салфетке для целевого DAU."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "High-level design: ingestion API → queue → per-channel workers → providers. Work through idempotency and dedup (event key), retries with backoff, per-provider rate limiting, fan-out to per-user preferences. Draw the diagram.",
                "ru": "High-level дизайн: ingestion API → очередь → воркеры по каналам → провайдеры. Проработать идемпотентность и дедуп (ключ события), ретраи с backoff, rate limiting на провайдера, fan-out на per-user предпочтения. Нарисовать схему."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Write a real design doc (1.5–2 pages) with the structure: context and goals, requirements, estimates, design with a diagram, key decisions and trade-offs, failure modes, open questions. This is an artifact, not a draft in your head.",
                "ru": "Написать настоящий design doc (1.5–2 стр.) по структуре: контекст и цели, требования, оценки, дизайн с диаграммой, ключевые решения и trade-offs, режимы отказа, открытые вопросы. Это артефакт, а не черновик в голове."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Write down the 3 most contentious trade-offs (at-least-once vs at-most-once per channel, synchronous vs batch fan-out, a single queue vs a per-channel queue) and the arguments for the chosen option.",
                "ru": "Записать 3 самых спорных trade-off (at-least-once vs at-most-once на канал, синхронный vs батч fan-out, единая очередь vs очередь на канал) и аргументы за выбранный вариант."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Designing Data-Intensive Applications — messaging, message delivery",
                "ru": "Designing Data-Intensive Applications — messaging, доставка сообщений"
              }
            },
            {
              "label": {
                "en": "Google",
                "ru": "Google"
              },
              "note": {
                "en": "Design Docs at Google (the structure of a technical design document)",
                "ru": "Design Docs at Google (структура технического дизайн-документа)"
              }
            }
          ]
        },
        {
          "id": "w10d4",
          "track": "js",
          "title": {
            "en": "Deep edge cases: coercion, equality, numbers, and precision",
            "ru": "Глубокие edge-cases: coercion, equality, числа и точность"
          },
          "warmup": {
            "en": "Algo warm-up: solve Two Sum from memory in 8 min — reinforcing the hash pattern.",
            "ru": "Алго-разминка: реши Two Sum по памяти за 8 мин — поддержка хеш-паттерна."
          },
          "reflectPrompt": {
            "en": "Which coercion edge case could actually bite in the code, and where might it be hiding?",
            "ru": "Какой edge-case приведения реально может укусить в коде, и где он мог бы спрятаться?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: the abstract coercion algorithms (ToPrimitive, ToNumber, ToString), == vs === and SameValueZero (as in Set/Map/includes) vs Object.is. Write down a table of traps: NaN, +0/-0, null vs undefined in ==, [] == ![].",
                "ru": "Теория: абстрактные алгоритмы приведения (ToPrimitive, ToNumber, ToString), == против === и SameValueZero (как в Set/Map/includes) против Object.is. Записать таблицу ловушек: NaN, +0/-0, null vs undefined в ==, [] == ![]."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Practice: predict the result of 12–15 tricky expressions (coercion, comparisons, +/* with mixed types) on paper, then check in a REPL. For each error, write down which exact step of the algorithm you skipped.",
                "ru": "Практика: предсказать результат 12–15 коварных выражений (coercion, сравнения, +/* со смешанными типами) на бумаге, затем проверить в REPL. Для каждой ошибки записать, какой именно шаг алгоритма ты пропустил."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Numbers and precision: why 0.1 + 0.2 !== 0.3 (IEEE 754 double), what Number.EPSILON, Number.MAX_SAFE_INTEGER are and when you need BigInt. Write down a rule for money/ID values — where float is unacceptable.",
                "ru": "Числа и точность: почему 0.1 + 0.2 !== 0.3 (IEEE 754 double), что такое Number.EPSILON, Number.MAX_SAFE_INTEGER и когда нужен BigInt. Записать правило для денежных/ID-значений — где float недопустим."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Equality comparisons and sameness; Type coercion",
                "ru": "Equality comparisons and sameness; Type coercion"
              }
            },
            {
              "label": {
                "en": "ECMAScript spec",
                "ru": "ECMAScript spec"
              },
              "note": {
                "en": "Abstract Operations — ToPrimitive, ToNumber",
                "ru": "Abstract Operations — ToPrimitive, ToNumber"
              }
            }
          ]
        },
        {
          "id": "w10d5",
          "track": "db",
          "title": {
            "en": "PostgreSQL: replication, partitioning, sharding, pooling",
            "ru": "PostgreSQL: репликация, партиционирование, шардинг, пулинг"
          },
          "warmup": {
            "en": "Algo warm-up: solve Binary Search (or binary search on the answer) in 10 min — a repeat of the binary search pattern.",
            "ru": "Алго-разминка: реши Binary Search (или поиск по ответу) за 10 мин — повтор паттерна бинпоиска."
          },
          "reflectPrompt": {
            "en": "What did I used to confuse — partitioning and sharding — and where exactly does the line between them run?",
            "ru": "Что я раньше путал — партиционирование и шардинг — и где именно проходит граница между ними?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Replication theory: streaming (physical, WAL-based) vs logical (decoding WAL into rows). Synchronous vs asynchronous, replication lag, read replicas and where they break read consistency. Write down when logical is needed (selective replication, major upgrade, CDC).",
                "ru": "Теория репликации: streaming (физическая, по WAL) против logical (по декодированию WAL в строки). Синхронная vs асинхронная, replication lag, read replicas и где они ломают консистентность чтения. Записать, когда нужна logical (селективная репликация, мажорный апгрейд, CDC)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Partitioning vs sharding: Postgres declarative partitioning (range/list/hash) within a single instance vs sharding across multiple nodes. Write down which problem each solves (table size/vacuum/pruning vs horizontal write scaling) and the price of sharding (cross-shard joins, distributed transactions).",
                "ru": "Партиционирование vs шардинг: декларативное партиционирование Postgres (range/list/hash) внутри одного инстанса против шардинга по нескольким нодам. Записать, какую проблему решает каждое (размер таблицы/вакуум/прунинг против горизонтального масштаба записи) и цену шардинга (кросс-шард join, распределённые транзакции)."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Pooling: why pgbouncer, the session/transaction/statement modes, how transaction-pooling breaks prepared statements and session features. Estimate which mode would suit a typical service's connection pool and why.",
                "ru": "Пулинг: зачем pgbouncer, режимы session/transaction/statement, как transaction-pooling ломает prepared statements и сессионные фичи. Прикинуть, какой режим подошёл бы пулу соединений типичного сервиса и почему."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Do: on a local table (e.g., an events table like the timeline's) write a partition by range on date, insert data into 2 partitions, use EXPLAIN to confirm partition pruning. Write down the observation.",
                "ru": "Сделать: на локальной таблице (например events-таблица как у timeline) написать partition by range по дате, вставить данные в 2 партиции, через EXPLAIN убедиться в partition pruning. Записать наблюдение."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "PostgreSQL docs",
                "ru": "PostgreSQL docs"
              },
              "note": {
                "en": "Streaming Replication; Logical Replication; Table Partitioning",
                "ru": "Streaming Replication; Logical Replication; Table Partitioning"
              }
            },
            {
              "label": {
                "en": "pgbouncer docs",
                "ru": "pgbouncer docs"
              },
              "note": {
                "en": "pooling modes (session/transaction/statement)",
                "ru": "pooling modes (session/transaction/statement)"
              }
            }
          ]
        },
        {
          "id": "w10d6",
          "track": "patterns",
          "title": {
            "en": "Capstone #1: an event-driven service with outbox — start the design doc",
            "ru": "Капстоун #1: event-driven сервис с outbox — старт design doc"
          },
          "warmup": {
            "en": "Algo warm-up: solve Valid Parentheses (stack) in 8 min — a repeat of the stack pattern; behavioral reflection separately below.",
            "ru": "Алго-разминка: реши Valid Parentheses (стек) за 8 мин — повтор стекового паттерна; behavioral-рефлексия отдельно ниже."
          },
          "reflectPrompt": {
            "en": "Where does my outbox design silently assume an ordering or exactly-once that isn't actually there?",
            "ru": "Где мой дизайн outbox молча предполагает порядок или exactly-once, которых на самом деле нет?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Choose the capstone domain (e.g., a notifications service or a timeline event processing pipeline) and pin down the boundaries. Describe the domain in DDD terms: aggregates, domain events, invariants. Write down what gets published outward as an event.",
                "ru": "Выбрать домен капстоуна (например сервис нотификаций или processing-пайплайн событий timeline) и зафиксировать границы. Описать домен по DDD: агрегаты, доменные события, инварианты. Записать, что публикуется наружу как событие."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Design a transactional outbox: write the business change and the outbox row in a single transaction, a relay process/CDC reads the outbox and publishes to the broker. Work through at-least-once + consumer idempotency (dedup key), ordering, outbox cleanup. Draw the flow diagram.",
                "ru": "Спроектировать transactional outbox: запись бизнес-изменения и outbox-строки в одной транзакции, relay-процесс/CDC читает outbox и публикует в брокер. Проработать at-least-once + идемпотентность потребителя (dedup-ключ), упорядочивание, очистку outbox. Нарисовать схему потока."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Start the capstone design doc: context and goal, domain model, event flows, outbox schema, delivery guarantees and their justification, failure modes (relay crash, duplicates, gaps in ordering), open questions. Today — the skeleton and the first two sections.",
                "ru": "Начать design doc капстоуна: контекст и цель, доменная модель, потоки событий, схема outbox, гарантии доставки и их обоснование, режимы отказа (падение relay, дубли, дыры в порядке), открытые вопросы. Сегодня — каркас и первые два раздела."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Behavioral reflection (staff): recall a case where a delivery incident (e.g., duplicates or lost events in a queue) required your technical decision. Write down Situation→Action→Result as a staff narrative of impact.",
                "ru": "Behavioral-рефлексия (staff): вспомни случай, где инцидент с доставкой (например, дубли или потеря событий в очереди) потребовал твоего технического решения. Записать Ситуация→Действие→Результат как staff-нарратив влияния."
              },
              "guidance": {
                "en": "Strong answer: you go from the symptom (duplicates/lost delivery) to the root cause through data, not guesses. You separate a temporary mitigation from the systemic fix (idempotent consumer, processed key). Staff markers: added observability/an alert so the incident doesn't silently recur, and wrote a blameless postmortem.",
                "ru": "Сильный ответ: ведёшь от симптома (дубли/потеря доставки) к корневой причине через данные, а не догадки. Разделяешь временное митигирование и системный фикс (идемпотентный консьюмер, processed-ключ). Staff-маркеры: добавил наблюдаемость/алерт, чтобы инцидент не повторился молча, и оформил постмортем без обвинений."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "microservices.io",
                "ru": "microservices.io"
              },
              "note": {
                "en": "Transactional Outbox; Polling Publisher; CDC",
                "ru": "Transactional Outbox; Polling Publisher; CDC"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Implementing Domain-Driven Design (Vaughn Vernon) — domain events",
                "ru": "Implementing Domain-Driven Design (Vaughn Vernon) — domain events"
              }
            }
          ]
        },
        {
          "id": "w10d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What to consolidate from the week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w11",
      "title": {
        "en": "Week 11",
        "ru": "Неделя 11"
      },
      "phase": "3",
      "theme": "Графы advanced, type-level TS, Raft, капстоун (ядро)",
      "items": [
        {
          "id": "w11d1",
          "track": "dsa",
          "title": {
            "en": "Advanced graphs: Dijkstra + union-find (DSU)",
            "ru": "Графы advanced: Dijkstra + union-find (DSU)"
          },
          "warmup": {
            "en": "BFS/DFS recap: in 10 min reconstruct graph traversal on an adjacency list from memory and estimate O(V+E). Draw a mini-graph of 5 nodes.",
            "ru": "Рекап BFS/DFS: за 10 мин восстанови по памяти обход графа на adjacency list и оцени O(V+E). Нарисуй мини-граф из 5 узлов."
          },
          "reflectPrompt": {
            "en": "In which problem would you confuse Dijkstra and BFS, and what graph property immediately hints at the right choice?",
            "ru": "В какой задаче ты бы перепутал Dijkstra и BFS и какой признак графа сразу подсказывает правильный выбор?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Theory: Dijkstra on a binary heap (priority queue), why it doesn't work with negative edges, complexity O((V+E) log V). Write down the invariant \"an extracted node is finalized\".",
                "ru": "Теория: Dijkstra на бинарной куче (priority queue), почему не работает с отрицательными рёбрами, сложность O((V+E) log V). Записать инвариант «извлечённый узел финализирован»."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Implement Dijkstra in TS on top of a min-heap (or an array with extract-min) for a weighted graph; run it on 1 problem like Network Delay Time.",
                "ru": "Реализовать Dijkstra на TS поверх min-heap (или массива с extract-min) для взвешенного графа; прогнать на 1 задаче типа Network Delay Time."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Study and code Union-Find with path compression and union by rank; solve a connected-components problem (Number of Provinces / Redundant Connection).",
                "ru": "Изучить и закодить Union-Find с path compression и union by rank; решить задачу на компоненты связности (Number of Provinces / Redundant Connection)."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: when Dijkstra, when BFS (unweighted), when DSU (dynamic connectivity, cycles, Kruskal); where a real dependency graph shows up (e.g. the ordering of workflow steps).",
                "ru": "Теория: когда Dijkstra, когда BFS (невзвешенный), когда DSU (динамическая связность, циклы, Kruskal); где встречается реальный граф зависимостей (например порядок шагов воркфлоу)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "CLRS",
                "ru": "CLRS"
              },
              "note": {
                "en": "Chapters Single-Source Shortest Paths (Dijkstra) and Data Structures for Disjoint Sets",
                "ru": "Глава Single-Source Shortest Paths (Dijkstra) и Data Structures for Disjoint Sets"
              }
            },
            {
              "label": {
                "en": "Competitive Programmer's Handbook (Laaksonen)",
                "ru": "Competitive Programmer's Handbook (Laaksonen)"
              },
              "note": {
                "en": "Sections Shortest paths and Union-Find",
                "ru": "Разделы Shortest paths и Union-Find"
              }
            }
          ]
        },
        {
          "id": "w11d2",
          "track": "ts",
          "title": {
            "en": "Type-level mini-project: a type-safe query builder built on types",
            "ru": "Type-level мини-проект: типобезопасный query-билдер на типах"
          },
          "warmup": {
            "en": "Algo warm-up: in 15 min review the two pointers pattern on 1 easy problem (Valid Palindrome or Merge Sorted Array), state the pointer invariant out loud.",
            "ru": "Алго-разминка: за 15 мин повтори паттерн two pointers на 1 лёгкой задаче (Valid Palindrome или Merge Sorted Array), проговори инвариант указателей."
          },
          "reflectPrompt": {
            "en": "Which piece of your builder produced the most baffling compiler error, and how would you simplify the types to make the message readable?",
            "ru": "Какой кусок твоего билдера дал самую непонятную ошибку компилятора и как бы ты упростил типы, чтобы сообщение стало читаемым?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Review the type-level toolkit: generics with constraints, conditional types, infer, mapped types, template literal types. Write down a mini cheat sheet of \"what's for what\".",
                "ru": "Повторить инструменты type-level: generics с constraints, conditional types, infer, mapped types, template literal types. Записать мини-шпаргалку «что для чего»."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Design and implement a type-safe builder: a .select().where().build() chain where each step narrows the result type (accumulating selected fields via a generic accumulator). Make an invalid field a compile error.",
                "ru": "Спроектировать и реализовать типобезопасный билдер: цепочка .select().where().build(), где каждый шаг сужает тип результата (накопление выбранных полей через дженерик-аккумулятор). Добиться, чтобы невалидное поле было ошибкой компиляции."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Write a set of type-tests (using expected errors // @ts-expect-error and Equal<A,B> checks) covering the happy path and 2 invalid cases.",
                "ru": "Написать набор type-tests (через ожидаемые ошибки // @ts-expect-error и проверки Equal<A,B>), покрывающих happy path и 2 невалидных случая."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: where type-level magic is justified, and where it's accidental complexity and runtime validation (zod) is better — whether the outbox event schema is worth typing at the type level.",
                "ru": "Теория: где type-level магия оправдана, а где это accidental complexity и лучше runtime-валидация (zod) — стоит ли типизировать схему событий outbox на уровне типов."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "TypeScript Handbook",
                "ru": "TypeScript Handbook"
              },
              "note": {
                "en": "Sections Conditional Types, Mapped Types, Template Literal Types",
                "ru": "Разделы Conditional Types, Mapped Types, Template Literal Types"
              }
            },
            {
              "label": {
                "en": "type-challenges (repository)",
                "ru": "type-challenges (репозиторий)"
              },
              "note": {
                "en": "Medium/Hard problems on conditional and template literal types",
                "ru": "Medium/Hard задачи на conditional и template literal types"
              }
            }
          ]
        },
        {
          "id": "w11d3",
          "track": "sysdesign",
          "title": {
            "en": "Full design: distributed rate limiter",
            "ru": "Полный дизайн: distributed rate limiter"
          },
          "warmup": {
            "en": "Algo warm-up: in 15 min review sliding window on 1 problem (Longest Substring Without Repeating Characters) — the same window pattern as in rate limiting.",
            "ru": "Алго-разминка: за 15 мин повтори sliding window на 1 задаче (Longest Substring Without Repeating Characters) — тот же паттерн окна, что в rate limiting."
          },
          "reflectPrompt": {
            "en": "Which Redis failure mode (fail-open or fail-closed) did you choose for your design, and what kind of incident could that choice cause?",
            "ru": "Какой из режимов отказа Redis (fail-open или fail-closed) ты выбрал для своего дизайна и какой инцидент этот выбор может породить?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Break down the algorithms: token bucket, leaky bucket, fixed window, sliding window log, sliding window counter. Write down the trade-offs in accuracy, memory, and burst handling.",
                "ru": "Разобрать алгоритмы: token bucket, leaky bucket, fixed window, sliding window log, sliding window counter. Записать trade-off по точности, памяти и всплескам (burst)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Design a distributed rate limiter on Redis: where to store counters, atomicity via a Lua script, what to do when Redis is unavailable (fail-open vs fail-closed), consistency across instances.",
                "ru": "Спроектировать распределённый rate limiter на Redis: где хранить счётчики, атомарность через Lua-скрипт, что делать при недоступности Redis (fail-open vs fail-closed), консистентность между инстансами."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Draw the end-to-end design: layers (edge/gateway/per-service), limit keys (user/IP/API-key/tenant), 429 response + Retry-After/X-RateLimit-* headers, observability.",
                "ru": "Нарисовать end-to-end дизайн: уровни (edge/gateway/per-service), ключи лимитов (user/IP/API-key/tenant), ответ 429 + заголовки Retry-After/X-RateLimit-*, наблюдаемость."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: how to add per-tenant rate limiting in front of queues so one tenant can't swamp the workers; which algorithm to choose and why.",
                "ru": "Теория: как добавить per-tenant rate limiting перед очередями, чтобы один арендатор не засыпал воркеры; какой алгоритм выбрать и почему."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "System Design Interview (Alex Xu), vol. 1",
                "ru": "System Design Interview (Alex Xu), том 1"
              },
              "note": {
                "en": "Chapter Design a Rate Limiter",
                "ru": "Глава Design a Rate Limiter"
              }
            },
            {
              "label": {
                "en": "Redis docs",
                "ru": "Redis docs"
              },
              "note": {
                "en": "Atomic scripting with EVAL/Lua, INCR with EXPIRE",
                "ru": "Atomic scripting с EVAL/Lua, INCR с EXPIRE"
              }
            }
          ]
        },
        {
          "id": "w11d4",
          "track": "node",
          "title": {
            "en": "Graceful shutdown: signals and worker reliability",
            "ru": "Graceful shutdown: сигналы и надёжность воркеров"
          },
          "warmup": {
            "en": "Algo warm-up: in 15 min review queue/stack on 1 problem (Implement Queue using Stacks or parenthesis validation), state the amortized cost of the operations out loud.",
            "ru": "Алго-разминка: за 15 мин повтори очередь/стек на 1 задаче (Implement Queue using Stacks или валидация скобок), проговори амортизацию операций."
          },
          "reflectPrompt": {
            "en": "Where in your drain worker would a lost signal or too short a grace period lead to a lost or duplicated message?",
            "ru": "В каком месте твоего drain-воркера потеря сигнала или слишком короткий grace period приведёт к потере или дублю сообщения?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Study the process lifecycle: SIGTERM vs SIGINT vs SIGKILL, the order during docker stop / k8s (preStop hook + terminationGracePeriodSeconds), why KILL can't be caught. Write down the sequence of steps for a correct shutdown.",
                "ru": "Изучить жизненный цикл процесса: SIGTERM vs SIGINT vs SIGKILL, порядок при docker stop / k8s (preStop hook + terminationGracePeriodSeconds), почему KILL нельзя перехватить. Записать последовательность шагов корректного завершения."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Implement graceful shutdown for a worker in TS: stop pulling new tasks from the queue, wait for in-flight work with a timeout, close pools (PG, Redis), unsubscribe, then exit. Add a hard timeout with a forced exit.",
                "ru": "Реализовать graceful shutdown для воркера на TS: перестать брать новые задачи из очереди, дождаться in-flight с таймаутом, закрыть пулы (PG, Redis), снять подписки, затем exit. Добавить hard-timeout с принудительным выходом."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Break down reliability: what happens to a task the worker didn't finish (visibility timeout / redelivery), idempotency of retries, protection against double processing. Tie it to at-least-once semantics.",
                "ru": "Разобрать надёжность: что с задачей, которую воркер не успел доделать (visibility timeout / повторная доставка), идемпотентность повторов, защита от двойной обработки. Связать с at-least-once семантикой."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: a graceful-shutdown checklist for the drain worker (outbox) — what to close and in what order, and which incident happens without draining (a lost/duplicated message during a deploy).",
                "ru": "Теория: чек-лист graceful shutdown для drain-воркера (outbox) — что закрывать и в каком порядке, какой инцидент случается без дренажа (потеря/дубликат сообщения при деплое)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node.js docs",
                "ru": "Node.js docs"
              },
              "note": {
                "en": "Process: signal events (SIGTERM/SIGINT), process.exit, beforeExit",
                "ru": "Process: signal events (SIGTERM/SIGINT), process.exit, beforeExit"
              }
            },
            {
              "label": {
                "en": "Kubernetes docs",
                "ru": "Kubernetes docs"
              },
              "note": {
                "en": "Pod lifecycle: termination, preStop hook, terminationGracePeriodSeconds",
                "ru": "Pod lifecycle: termination, preStop hook, terminationGracePeriodSeconds"
              }
            }
          ]
        },
        {
          "id": "w11d5",
          "track": "distsys",
          "title": {
            "en": "Consensus: Raft in depth (+ Paxos intuition)",
            "ru": "Консенсус: Raft вглубь (+ интуиция Paxos)"
          },
          "warmup": {
            "en": "Algo warm-up: in 15 min review binary search on the answer on 1 problem (e.g. search in a rotated array) — the intuition about invariants and bounds carries over to the Raft log.",
            "ru": "Алго-разминка: за 15 мин повтори бинарный поиск по ответу на 1 задаче (например поиск в повёрнутом массиве) — пригодится интуиция про инварианты и границы, как в логе Raft."
          },
          "reflectPrompt": {
            "en": "Why doesn't Raft let you commit an entry from a previous term directly by replica count, and which bug does that prevent?",
            "ru": "Почему Raft не позволяет коммитить запись предыдущего терма напрямую по числу реплик, и какой баг это предотвращает?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Break Raft down by subsystem: leader election (terms, randomized timeouts, split vote), log replication (AppendEntries, matchIndex/nextIndex), safety (commit only entries from the current term). Write down the key invariants.",
                "ru": "Разобрать Raft по подсистемам: leader election (terms, randomized timeouts, split vote), log replication (AppendEntries, matchIndex/nextIndex), safety (commit только записей текущего терма). Записать ключевые инварианты."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Play out a scenario on paper: the leader fails with uncommitted entries, a new leader with a more complete log overwrites the follower's tail. Sketch the log state before/after.",
                "ru": "Проиграть на бумаге сценарий: лидер падает с незакоммиченными записями, новый лидер с более полным логом перезатирает хвост фолловера. Зарисовать состояние логов до/после."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Condensed Paxos vs Raft intuition: why Raft is easier to understand (understandability as a design goal), the role of majority quorum, why persistent state is needed before responding. Write down the differences in 5 points.",
                "ru": "Сжатая интуиция Paxos vs Raft: почему Raft проще для понимания (understandability как цель дизайна), роль кворума большинства, зачем нужен persistent state перед ответом. Записать различия в 5 пунктах."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Theory: where a service implicitly relies on consensus/quorum (leader selection in Postgres replication, leader election in Redis Sentinel/etcd) and what guarantees that gives the outbox during failover.",
                "ru": "Теория: где сервис неявно полагается на консенсус/кворум (выбор лидера в Postgres-репликации, leader election в Redis Sentinel/etcd) и какие гарантии это даёт outbox при failover."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "In Search of an Understandable Consensus Algorithm (Raft paper, Ongaro & Ousterhout)",
                "ru": "In Search of an Understandable Consensus Algorithm (Raft paper, Ongaro & Ousterhout)"
              },
              "note": {
                "en": "Sections leader election, log replication, safety",
                "ru": "Разделы leader election, log replication, safety"
              }
            },
            {
              "label": {
                "en": "raft.github.io",
                "ru": "raft.github.io"
              },
              "note": {
                "en": "Raft visualization and a list of implementations",
                "ru": "Визуализация Raft и список реализаций"
              }
            }
          ]
        },
        {
          "id": "w11d6",
          "track": "patterns",
          "title": {
            "en": "Capstone #2: outbox core + drain worker + idempotency",
            "ru": "Капстоун #2: ядро outbox + drain worker + идемпотентность"
          },
          "warmup": {
            "en": "Algo warm-up: in 15 min review hash set on 1 problem (Contains Duplicate / First Unique Character) — direct intuition for deduplication by idempotency key.",
            "ru": "Алго-разминка: за 15 мин повтори хеш-множество на 1 задаче (Contains Duplicate / First Unique Character) — прямая интуиция для дедупликации по идемпотентному ключу."
          },
          "reflectPrompt": {
            "en": "What in your core breaks with two drain workers running at once, and does SKIP LOCKED alone save you or do you also need idempotency on the consumer?",
            "ru": "Что в твоём ядре ломается при двух drain-воркерах одновременно, и спасает ли только SKIP LOCKED или нужна ещё идемпотентность у потребителя?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Design the schema: an outbox table (id, aggregate_id, type, payload, status, created_at, attempts, available_at) and a processed_messages table (idempotency_key, processed) for consumer deduplication. Write down the indexes for the pending selection.",
                "ru": "Спроектировать схему: таблица outbox (id, aggregate_id, type, payload, status, created_at, attempts, available_at) и таблица processed_messages (idempotency_key, обработано) для дедупликации потребителя. Записать индексы под выборку pending."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Implement writing to the outbox in the same transaction as the domain change (transactional outbox) so there's no dual-write. Cover the \"all-or-nothing\" invariant with a test.",
                "ru": "Реализовать запись в outbox в той же транзакции, что и доменное изменение (transactional outbox), чтобы не было dual-write. Покрыть тестом инвариант «или оба, или ничего»."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Implement the drain worker: SELECT ... FOR UPDATE SKIP LOCKED in batches, publish, mark done, backoff on errors via available_at; ensure at-least-once and idempotency on the consumer side by key.",
                "ru": "Реализовать drain worker: SELECT ... FOR UPDATE SKIP LOCKED батчами, публикация, отметка done, backoff на ошибках через available_at; обеспечить at-least-once и идемпотентность на стороне потребителя по ключу."
              }
            },
            {
              "id": "t4",
              "text": {
                "en": "Run a failure: crash after publishing but before marking done — confirm the retry doesn't create a duplicate effect (thanks to processed_messages).",
                "ru": "Прогнать сбой: упасть после публикации, но до отметки done — убедиться, что повтор не создаёт дубль эффекта (благодаря processed_messages)."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "microservices.io (Chris Richardson)",
                "ru": "microservices.io (Chris Richardson)"
              },
              "note": {
                "en": "Patterns Transactional Outbox and Polling Publisher",
                "ru": "Паттерны Transactional Outbox и Polling Publisher"
              }
            },
            {
              "label": {
                "en": "PostgreSQL docs",
                "ru": "PostgreSQL docs"
              },
              "note": {
                "en": "SELECT FOR UPDATE SKIP LOCKED, locking behavior",
                "ru": "SELECT FOR UPDATE SKIP LOCKED, поведение блокировок"
              }
            }
          ]
        },
        {
          "id": "w11d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What to lock in from the week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w12",
      "title": {
        "en": "Week 12",
        "ru": "Неделя 12"
      },
      "phase": "3",
      "theme": "Hard-задачи, распределённые транзакции, наблюдаемость, капстоун (тесты)",
      "items": [
        {
          "id": "w12d1",
          "track": "dsa",
          "title": {
            "en": "Mixed hard problems: break them down for depth, not speed",
            "ru": "Смешанные hard-задачи: разбор ради глубины, не скорость"
          },
          "warmup": {
            "en": "Recall from memory the idea behind any two patterns (e.g. monotonic stack and binary search on the answer) and where they apply.",
            "ru": "Восстанови по памяти идею двух любых паттернов (например, монотонный стек и бинпоиск по ответу) и где они применимы."
          },
          "reflectPrompt": {
            "en": "Which exact signal in a hard problem's statement did I learn today to recognize as \"this is where you need that pattern\"?",
            "ru": "Какой именно сигнал в условии hard-задачи я научился сегодня распознавать как «здесь нужен этот паттерн»?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Study: take 1 hard problem on DP/intervals (e.g. Burst Balloons or Maximum Profit in Job Scheduling) and break it down without a timer — first the naive solution, then the optimization, talking through the state transitions.",
                "ru": "Изучить: взять 1 hard-задачу на динамику/интервалы (например, Burst Balloons или Maximum Profit in Job Scheduling) и разобрать без таймера — сначала наивное решение, потом оптимизация, проговаривая переход состояний."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Do: take 1 hard graph problem (e.g. Word Ladder II or Alien Dictionary) and get it to working code, explicitly writing out the invariant and traversal order.",
                "ru": "Сделать: взять 1 hard-задачу на графы (например, Word Ladder II или Alien Dictionary) и довести до рабочего кода, явно выписав инвариант и порядок обхода."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Do: take 1 hard problem from another family (greedy, binary search on the answer, or strings) and get it to working code, explicitly writing out the invariant and traversal order.",
                "ru": "Сделать: взять 1 hard-задачу из другого семейства (жадность, бинпоиск по ответу или строки) и довести до рабочего кода, явно выписав инвариант и порядок обхода."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Cracking the Coding Interview — chapters on DP and graphs (as a pattern reference, not for rote memorization)",
                "ru": "Cracking the Coding Interview — главы про DP и графы (как справочник по паттернам, не для зубрёжки)"
              }
            },
            {
              "label": {
                "en": "CP-Algorithms",
                "ru": "CP-Algorithms"
              },
              "note": {
                "en": "cp-algorithms.com — sections Dynamic Programming, Graph",
                "ru": "cp-algorithms.com — разделы Dynamic Programming, Graph"
              }
            }
          ]
        },
        {
          "id": "w12d2",
          "track": "js",
          "title": {
            "en": "JS consolidation: self-test on event loop, closures, prototypes",
            "ru": "Консолидация JS: самопроверка по event loop, замыканиям, прототипам"
          },
          "warmup": {
            "en": "Light algo warm-up: solve Valid Parentheses (stack) from memory, state the complexity out loud.",
            "ru": "Лёгкая алго-разминка: реши Valid Parentheses (стек) по памяти, проговори сложность."
          },
          "reflectPrompt": {
            "en": "Which JS topic showed the biggest gap between \"I thought I knew it\" and what I could actually explain from scratch?",
            "ru": "Какая тема JS дала наибольший разрыв между «думал, что знаю» и тем, что смог объяснить с листа?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Blind self-test: on a blank sheet, reconstruct the JS engine map from memory — call stack, microtask vs macrotask queues, the order when mixing Promise/setTimeout/queueMicrotask. Then check it against actually running a snippet in Node.",
                "ru": "Самопроверка вслепую: на чистом листе восстанови по памяти карту JS-движка — call stack, microtask vs macrotask очереди, порядок при смешении Promise/setTimeout/queueMicrotask. Затем сверь с реальным запуском сниппета в Node."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Study the gaps: where the self-test tripped you up (this/new, prototype chain, value vs reference, GC mark-and-sweep) — reread exactly those sections and close the gap with one mini-experiment in the REPL.",
                "ru": "Изучить пробелы: где при самопроверке сбился (this/new, prototype chain, value vs reference, GC mark-and-sweep) — перечитай именно эти разделы и закрой дыру одним мини-экспериментом в REPL."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Study: reread 2-3 JS topics that still feel shaky (based on the self-test) and close each with one mini-experiment in the REPL.",
                "ru": "Изучить: перечитать 2-3 темы JS, которые всё ещё «плывут» (по итогам самопроверки), и закрыть каждую одним мини-экспериментом в REPL."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "MDN",
                "ru": "MDN"
              },
              "note": {
                "en": "Event loop; Closures; Inheritance and the prototype chain",
                "ru": "Event loop; Closures; Inheritance and the prototype chain"
              }
            },
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "You Don't Know JS — Scope & Closures; Async & Performance",
                "ru": "You Don't Know JS — Scope & Closures; Async & Performance"
              }
            }
          ]
        },
        {
          "id": "w12d3",
          "track": "sysdesign",
          "title": {
            "en": "System design doc (activity-timeline): a full draft",
            "ru": "Design doc по системе (activity-timeline): полноценный черновик"
          },
          "warmup": {
            "en": "Light algo warm-up: solve Merge Intervals, explain why sorting is mandatory.",
            "ru": "Лёгкая алго-разминка: реши Merge Intervals, проговори, почему сортировка обязательна."
          },
          "reflectPrompt": {
            "en": "Which architectural decision did I used to make \"by default\" but now couldn't justify in a design doc without new arguments?",
            "ru": "Какое архитектурное решение я раньше принимал «по умолчанию», но теперь не смог бы обосновать в design doc без новых аргументов?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Study the structure: break down the canonical design doc template (Context/Goals, Non-goals, Proposed design, Alternatives considered, Trade-offs, Risks, Rollout). Write down what your past RFCs were missing.",
                "ru": "Изучить структуру: разбери канонический шаблон design doc (Context/Goals, Non-goals, Proposed design, Alternatives considered, Trade-offs, Risks, Rollout). Выпиши, чего не хватало в твоих прошлых RFC."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Do: write a real design doc draft for a system like activity-timeline with an outbox — requirements, load estimates, data schema, write and read paths, queue choice, failure handling. A full artifact, not a theoretical sketch.",
                "ru": "Сделать: напиши настоящий черновик design doc для системы вроде activity-timeline с outbox — требования, оценки нагрузки, схема данных, путь записи и чтения, выбор очереди, обработка отказов. Полноценный артефакт, а не теоретический набросок."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Write the \"Alternatives & Trade-offs\" section: at least 2 rejected options (e.g. synchronous writes without an outbox, or CDC instead of an outbox) with an explicit reason for rejection — this is a staff-level skill of defending a decision.",
                "ru": "Записать раздел «Alternatives & Trade-offs»: минимум 2 отвергнутых варианта (например, синхронная запись без outbox, или CDC вместо outbox) с явной причиной отказа — это staff-навык защиты решения."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Google",
                "ru": "Google"
              },
              "note": {
                "en": "Design Docs at Google (the chapter in Software Engineering at Google)",
                "ru": "Design Docs at Google (раздел в книге Software Engineering at Google)"
              }
            },
            {
              "label": {
                "en": "StaffEng",
                "ru": "StaffEng"
              },
              "note": {
                "en": "staffeng.com — on writing and defending RFCs/design docs",
                "ru": "staffeng.com — про написание и защиту RFC/design docs"
              }
            }
          ]
        },
        {
          "id": "w12d4",
          "track": "node",
          "title": {
            "en": "Node consolidation: self-test on event loop, streams, diagnostics",
            "ru": "Консолидация Node: самопроверка по event loop, стримам, диагностике"
          },
          "warmup": {
            "en": "Light algo warm-up: solve Top K Frequent Elements (hash + heap), explain the choice of data structure.",
            "ru": "Лёгкая алго-разминка: реши Top K Frequent Elements (хеш + куча), проговори выбор структуры."
          },
          "reflectPrompt": {
            "en": "What about Node's internals can I confidently explain to a colleague, and where do I still need to \"hope for the best\"?",
            "ru": "Что из внутренностей Node я уверенно объясню коллеге, а где всё ещё нужен «фокус на удачу»?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Blind self-test: reconstruct Node's event loop phases from memory (timers/pending/poll/check/close), where microtasks live, what the libuv thread pool does. Verify it by running a snippet with setImmediate vs setTimeout vs process.nextTick.",
                "ru": "Самопроверка вслепую: восстанови по памяти фазы event loop Node (timers/pending/poll/check/close), где живут microtasks, что делает thread pool libuv. Сверь, запустив сниппет с setImmediate vs setTimeout vs process.nextTick."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Study the gaps: run a mini-practice on your weak spot — backpressure in streams (pipeline + an object that writes slowly), or AsyncLocalStorage for request context; close exactly the topic that got shaky in the self-test.",
                "ru": "Изучить пробелы: прогони мини-практику по слабому месту — backpressure в стримах (pipeline + объект, который медленно пишет), либо AsyncLocalStorage для контекста запроса; закрой именно ту тему, что поплыла на самопроверке."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: a checklist for diagnosing a memory leak / stuck event loop in prod — perf_hooks, --inspect, heap snapshot, flame graph; in what order to apply them.",
                "ru": "Теория: чек-лист диагностики утечки памяти / залипшего event loop в проде — perf_hooks, --inspect, heap snapshot, флейм-граф; в каком порядке применять."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node docs",
                "ru": "Node docs"
              },
              "note": {
                "en": "The Node.js Event Loop; Stream (backpressure, pipeline); AsyncLocalStorage",
                "ru": "The Node.js Event Loop; Stream (backpressure, pipeline); AsyncLocalStorage"
              }
            },
            {
              "label": {
                "en": "libuv",
                "ru": "libuv"
              },
              "note": {
                "en": "docs.libuv.org — Thread pool work scheduling",
                "ru": "docs.libuv.org — Thread pool work scheduling"
              }
            }
          ]
        },
        {
          "id": "w12d5",
          "track": "distsys",
          "title": {
            "en": "Distributed transactions: 2PC, sagas, delivery semantics, and the exactly-once illusion",
            "ru": "Распределённые транзакции: 2PC, саги, семантики доставки и иллюзия exactly-once"
          },
          "warmup": {
            "en": "Light algo warm-up: solve Course Schedule (topological sort) — connects to the ordering of saga steps.",
            "ru": "Лёгкая алго-разминка: реши Course Schedule (топосортировка) — связь с порядком шагов саги."
          },
          "reflectPrompt": {
            "en": "Where do we in practice rely on \"exactly-once\" when it's really at-least-once + idempotency — and what breaks if you remove the idempotency?",
            "ru": "Где мы по факту полагаемся на «exactly-once», хотя реально это at-least-once + идемпотентность — и что сломается, если идемпотентность убрать?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Study: 2PC (prepare/commit phases, why it's bad — blocking when the coordinator fails) vs saga (orchestration vs choreography, compensating transactions). Write down when to use which approach and why a distributed ACID commit is usually avoided.",
                "ru": "Изучить: 2PC (фазы prepare/commit, чем плох — блокировка при отказе координатора) vs сага (оркестрация vs хореография, компенсирующие транзакции). Выпиши, когда какой подход и почему распределённый ACID-коммит обычно избегают."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Study: delivery semantics (at-most-once / at-least-once / \"exactly-once\") and why end-to-end exactly-once is an illusion; the real recipe = at-least-once delivery + an idempotent consumer + deduplication. What semantics the transactional outbox actually provides.",
                "ru": "Изучить: семантики доставки (at-most-once / at-least-once / «exactly-once») и почему end-to-end exactly-once — иллюзия; реальный рецепт = at-least-once доставка + идемпотентный консьюмер + дедупликация. Какую семантику даёт transactional outbox на самом деле."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Design a saga on paper for a multi-step business process (e.g. event → notification → external call) with steps, compensations, and the point where idempotency/dedup by key is needed.",
                "ru": "Спроектировать на бумаге сагу для многошагового бизнес-процесса (например, событие → нотификация → внешний вызов) с шагами, компенсациями и точкой, где нужна идемпотентность/дедуп по ключу."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Book",
                "ru": "Книга"
              },
              "note": {
                "en": "Designing Data-Intensive Applications (Kleppmann) — ch. 9, distributed transactions and consensus",
                "ru": "Designing Data-Intensive Applications (Kleppmann) — гл. 9, распределённые транзакции и консенсус"
              }
            },
            {
              "label": {
                "en": "Microservices",
                "ru": "Microservices"
              },
              "note": {
                "en": "microservices.io — Saga and Transactional Outbox patterns",
                "ru": "microservices.io — паттерны Saga и Transactional Outbox"
              }
            }
          ]
        },
        {
          "id": "w12d6",
          "track": "patterns",
          "title": {
            "en": "Capstone #3: tests + service observability (metrics, logs, traces)",
            "ru": "Капстоун #3: тесты + наблюдаемость сервиса (метрики, логи, трейсы)"
          },
          "warmup": {
            "en": "Light algo warm-up: solve LRU Cache (hashmap + doubly linked list) — while you're at it, recall how a cache affects observed latencies.",
            "ru": "Лёгкая алго-разминка: реши LRU Cache (hashmap + двусвязный список) — заодно вспомни, как кэш влияет на наблюдаемые латентности."
          },
          "reflectPrompt": {
            "en": "If this service went down at 3 a.m., would the current metrics/logs/traces be enough to find the cause without reading the code — and what exactly is missing?",
            "ru": "Если бы этот сервис упал в 3 ночи, хватило бы текущих метрик/логов/трейсов, чтобы понять причину без чтения кода — и чего именно не хватает?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Do (tests): cover the capstone service with tests on the critical paths — unit tests on the domain logic and an integration test on the outbox/event handling, including idempotency (redelivery does not duplicate the effect).",
                "ru": "Сделать (тесты): покрой капстоун-сервис тестами на критических путях — юнит на доменную логику и интеграционный тест на outbox/обработку события, включая идемпотентность (повторная доставка не дублирует эффект)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Do (observability): add the 3 pillars — structured logs with a correlation/trace id, RED-style metrics (rate/errors/duration) on a key endpoint, and a trace of at least one end-to-end request path. Formulate 1 SLI and a draft SLO.",
                "ru": "Сделать (наблюдаемость): добавь 3 столпа — структурные логи с correlation/trace id, метрики в стиле RED (rate/errors/duration) на ключевой эндпоинт и трейс хотя бы одного сквозного пути запроса. Сформулируй 1 SLI и черновой SLO."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Write down + leadership reflection: a short \"runbook\" — what to monitor, which alert fires on the error budget, how to read a trace during an incident. Behavioral: recall a case where observability (or its absence) decided the outcome of an incident — write it down as Situation→Action→Result.",
                "ru": "Записать + рефлексия лидерства: короткий «runbook» — что мониторить, какой алерт по error budget, как читать трейс при инциденте. Behavioral: вспомни случай, где наблюдаемость (или её отсутствие) решила исход инцидента — запиши Ситуация→Действие→Результат."
              },
              "guidance": {
                "en": "A strong answer: you tie the incident outcome to concrete signals (a trace, a p99 metric, the error budget) rather than to \"luck.\" You show which signal was missing and which alert/dashboard you added afterward. Staff markers: you distinguish symptom from cause via telemetry and decide \"what to monitor\" before an incident, not after.",
                "ru": "Сильный ответ: связываешь исход инцидента с конкретными сигналами (трейс, метрика p99, error budget), а не с «повезло». Показываешь, какого сигнала не хватило и какой алерт/дашборд добавил после. Staff-маркеры: отличаешь симптом от причины по телеметрии и решаешь «что мониторить» до инцидента, а не после."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Google SRE",
                "ru": "Google SRE"
              },
              "note": {
                "en": "Site Reliability Engineering — the Monitoring, SLO, and error budgets chapters",
                "ru": "Site Reliability Engineering — главы Monitoring, SLO, error budgets"
              }
            },
            {
              "label": {
                "en": "OpenTelemetry",
                "ru": "OpenTelemetry"
              },
              "note": {
                "en": "opentelemetry.io — the concepts of traces, metrics, logs",
                "ru": "opentelemetry.io — концепции traces, metrics, logs"
              }
            }
          ]
        },
        {
          "id": "w12d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What to lock in from the week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    },
    {
      "id": "w13",
      "title": {
        "en": "Week 13",
        "ru": "Неделя 13"
      },
      "phase": "3",
      "theme": "Консолидация, ретроспектива, завершение капстоуна",
      "items": [
        {
          "id": "w13d1",
          "track": "dsa",
          "title": {
            "en": "Pattern review + shoring up weak spots",
            "ru": "Повторение паттернов + добивка слабых мест"
          },
          "warmup": {
            "en": "Write out 3 previously solved problems that you found hard; for each, spend 60 sec saying the pattern and complexity out loud from memory, without opening the solution.",
            "ru": "Выпиши 3 решённые ранее задачи, которые давались тяжело; для каждой за 60 сек проговори вслух паттерн и сложность по памяти, не открывая решение."
          },
          "reflectPrompt": {
            "en": "Which pattern still doesn't \"click\" at first glance, and what exactly stops you from recognizing it in the problem statement?",
            "ru": "Какой паттерн всё ещё не «щёлкает» с первого взгляда и что конкретно мешает его опознать в условии?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Re-solve 3-4 completed problems you remember as \"forgot it/got stuck.\" The goal is recognizing the pattern within 30-60 sec, not memorizing the code.",
                "ru": "Пере-решить 3-4 пройденные задачи, которые помнишь как «забыл/тормозил». Цель — узнавание паттерна за 30-60 сек, а не код наизусть."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Pick 1 systematically weak pattern for the phase (based on your error stats — e.g. two pointers, monotonic stack, or binary search on the answer) and solve 2 fresh problems on exactly that.",
                "ru": "Выбрать 1 системно слабый паттерн за фазу (по статистике ошибок — например two pointers, monotonic stack или binary search по ответу) и решить 2 свежие задачи именно на него."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Update your \"pattern triggers\" cheat sheet: for each pattern you shored up, write 1 line — \"when I see X in the statement, I reach for Y.\"",
                "ru": "Обновить шпаргалку «триггеры паттернов»: для каждого добитого паттерна записать 1 строку «когда вижу X в условии — беру Y»."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "NeetCode",
                "ru": "NeetCode"
              },
              "note": {
                "en": "Roadmap — a map of patterns for reviewing weak spots",
                "ru": "Roadmap — карта паттернов для ревизии слабых мест"
              }
            },
            {
              "label": {
                "en": "Grokking the Coding Interview",
                "ru": "Grokking the Coding Interview"
              },
              "note": {
                "en": "A catalog of patterns and their triggers in the problem statement",
                "ru": "Каталог паттернов и их триггеров в условии"
              }
            }
          ]
        },
        {
          "id": "w13d2",
          "track": "ts",
          "title": {
            "en": "Organizing the phase's TypeScript notes",
            "ru": "Систематизация заметок по TypeScript за фазу"
          },
          "warmup": {
            "en": "Algo warm-up: in 10-15 min, re-solve 1 easy hash table or two pointers problem from memory to keep the daily rhythm.",
            "ru": "Алго-разминка: за 10-15 мин пере-реши 1 лёгкую задачу на хеш-таблицу или two pointers по памяти, чтобы поддержать ежедневный ритм."
          },
          "reflectPrompt": {
            "en": "Which TS concept from your notes still rests only on \"magic\" rather than on understanding what the compiler does?",
            "ru": "Какая TS-концепция из заметок до сих пор держится только на «магии», а не на понимании того, что делает компилятор?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Gather all the scattered TS notes for the phase into one structured document by section: the type system, generics/constraints, conditional + mapped types, narrowing, utility types. Drop duplicates and anything outdated.",
                "ru": "Собрать все разрозненные TS-заметки фазы в один структурированный документ по разделам: система типов, generics/constraints, conditional + mapped types, narrowing, утилитные типы. Выкинуть дубли и устаревшее."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "For the 3 least obvious topics (e.g. variance, infer, discriminated unions), write your own minimal 5-10 line example that proves you understood the mechanics rather than memorized the wording.",
                "ru": "Для 3 самых неочевидных тем (например variance, infer, discriminated unions) написать собственный минимальный пример на 5-10 строк, который доказывает, что понял механику, а не запомнил формулировку."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: which typical spots in the code (e.g. typing events and outbox payloads) do strict types protect from bugs — write it up as a concluding takeaway on TS for the phase.",
                "ru": "Теория: какие типичные места в коде (например типизация событий и payload-ов outbox) строгие типы защищают от багов — оформить как итоговый вывод по TS за фазу."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "TypeScript Handbook",
                "ru": "TypeScript Handbook"
              },
              "note": {
                "en": "The Generics, Conditional Types, and Narrowing sections",
                "ru": "Разделы Generics, Conditional Types, Narrowing"
              }
            },
            {
              "label": {
                "en": "Type Challenges",
                "ru": "Type Challenges"
              },
              "note": {
                "en": "A repo for self-checking your understanding of types",
                "ru": "Репозиторий для самопроверки понимания типов"
              }
            }
          ]
        },
        {
          "id": "w13d3",
          "track": "sysdesign",
          "title": {
            "en": "Consolidating the phase's design analyses",
            "ru": "Консолидация дизайн-разборов фазы"
          },
          "warmup": {
            "en": "Algo warm-up: in 10-15 min, review the sliding window pattern on 1 short problem so you don't lose the daily skill.",
            "ru": "Алго-разминка: за 10-15 мин повтори паттерн скользящего окна на 1 короткой задаче, чтобы не терять ежедневный навык."
          },
          "reflectPrompt": {
            "en": "In which of your design analyses were the trade-offs named but not backed up with numbers or a load scenario?",
            "ru": "В каком из своих дизайн-разборов трейдоффы были названы, но не обоснованы цифрами или сценарием нагрузки?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Reread all the phase's system design analyses and pull them into a single table: problem → key constraints → trade-offs made → what I'd change now. Find recurring themes (partitioning, idempotency, backpressure).",
                "ru": "Перечитать все разборы системного дизайна за фазу и свести их в одну таблицу: задача → ключевые ограничения → принятые трейдоффы → что бы изменил сейчас. Найти повторяющиеся темы (партиционирование, идемпотентность, backpressure)."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Pick 1 analysis with weak reasoning and rewrite the trade-offs section from scratch: explicitly state which non-functional attribute (latency, consistency, cost) is sacrificed for which.",
                "ru": "Выбрать 1 разбор со слабой аргументацией и переписать секцию трейдоффов заново: явно сформулировать, какой нефункциональный атрибут (latency, consistency, cost) приносится в жертву ради какого."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Based on the consolidation, write a short sketch of \"how I'd design timeline + outbox from scratch today\": the key decisions, trade-offs, and failure modes.",
                "ru": "На основе консолидации написать короткий набросок «как бы я спроектировал timeline + outbox с нуля сегодня»: ключевые решения, трейдоффы и режимы отказа."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Designing Data-Intensive Applications",
                "ru": "Designing Data-Intensive Applications"
              },
              "note": {
                "en": "The chapters on replication, partitioning, and consistency to cross-check your conclusions",
                "ru": "Главы про репликацию, партиционирование, consistency для сверки выводов"
              }
            },
            {
              "label": {
                "en": "System Design Primer",
                "ru": "System Design Primer"
              },
              "note": {
                "en": "A checklist of non-functional requirements and trade-offs",
                "ru": "Чек-лист нефункциональных требований и трейдоффов"
              }
            }
          ]
        },
        {
          "id": "w13d4",
          "track": "node",
          "title": {
            "en": "Organizing the phase's Node.js notes",
            "ru": "Систематизация заметок по Node.js за фазу"
          },
          "warmup": {
            "en": "Algo warm-up: in 10-15 min, re-solve 1 easy stack or queue problem from memory — keep the daily rhythm before the main block.",
            "ru": "Алго-разминка: за 10-15 мин пере-реши 1 лёгкую задачу на стек или очередь по памяти — поддержать ежедневный ритм перед основным блоком."
          },
          "reflectPrompt": {
            "en": "Which Node runtime behavior did you used to take on faith, but today managed to verify with an experiment — and the result surprised you?",
            "ru": "Какое поведение рантайма Node ты раньше принимал на веру, а сегодня смог проверить экспериментом и удивился результату?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Pull all the phase's Node notes into a single document by section: the event loop and its phases, streams/backpressure, worker threads, memory management and GC, error handling and graceful shutdown. Remove duplicates.",
                "ru": "Свести все Node-заметки фазы в единый документ по разделам: event loop и фазы, потоки/backpressure, worker threads, управление памятью и GC, обработка ошибок и graceful shutdown. Убрать дубликаты."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "For the 2-3 subtlest topics (microtask vs macrotask order, backpressure in pipe, leaks from unclosed resources), write a minimal reproducible snippet and verify the behavior by running it, not from memory.",
                "ru": "Для 2-3 самых тонких тем (порядок microtasks vs macrotasks, backpressure в pipe, утечки через незакрытые ресурсы) написать минимальный воспроизводимый сниппет и проверить поведение запуском, а не по памяти."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: where does knowing the event loop or backpressure explain real incidents or latency spikes (e.g. in queue processing) — write it up as a takeaway on Node for the phase.",
                "ru": "Теория: где знание event loop или backpressure объясняет реальные инциденты или latency-спайки (например в обработке очередей) — оформить как вывод по Node за фазу."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Node.js docs",
                "ru": "Node.js docs"
              },
              "note": {
                "en": "Guides — The event loop, Backpressuring in Streams",
                "ru": "Guides — The event loop, Backpressuring in Streams"
              }
            },
            {
              "label": {
                "en": "Node.js docs",
                "ru": "Node.js docs"
              },
              "note": {
                "en": "Diagnostics — memory, worker_threads",
                "ru": "Diagnostics — memory, worker_threads"
              }
            }
          ]
        },
        {
          "id": "w13d5",
          "track": "distsys",
          "title": {
            "en": "Consolidating the fundamentals: distributed systems and databases",
            "ru": "Консолидация фундамента: распределённые системы и БД"
          },
          "warmup": {
            "en": "Algo warm-up: in 10-15 min, review binary search (including boundary search) on 1 problem — keep the daily algo rhythm going.",
            "ru": "Алго-разминка: за 10-15 мин повтори бинарный поиск (включая поиск границы) на 1 задаче — держим ежедневный алго-ритм."
          },
          "reflectPrompt": {
            "en": "Which distributed trade-off (consistency vs availability, latency vs durability) did you used to state as slogans, but can now explain through a concrete mechanism?",
            "ru": "Какой распределённый трейдофф (consistency vs availability, latency vs durability) ты раньше формулировал лозунгами, а теперь можешь объяснить через конкретный механизм?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Gather the phase's distributed-systems and database notes into one concept map: message delivery (at-least/exactly-once), idempotency, outbox/CDC, transaction isolation and MVCC in PostgreSQL, indexes and locks. Mark the connections between topics.",
                "ru": "Собрать заметки фазы по распределёнке и БД в одну карту понятий: доставка сообщений (at-least/exactly-once), идемпотентность, outbox/CDC, изоляция транзакций и MVCC в PostgreSQL, индексы и блокировки. Отметить связи между темами."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Reread and break down 2 key concepts (e.g. isolation levels and anomalies; exactly-once as an illusion on top of at-least-once + deduplication) against a concrete failure scenario.",
                "ru": "Перечитать и разобрать 2 ключевых понятия (например уровни изоляции и аномалии; exactly-once как иллюзия поверх at-least-once + дедупликация) на конкретном сценарии отказа."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Theory: break down a typical incident through the lens of the fundamentals — e.g. duplicates from outbox retries, or a race at READ COMMITTED — which theoretical concept explains the root cause.",
                "ru": "Теория: разобрать типичный инцидент через призму фундамента — например дубли из-за ретраев outbox или гонка на уровне READ COMMITTED — какое теоретическое понятие объясняет корневую причину."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Designing Data-Intensive Applications",
                "ru": "Designing Data-Intensive Applications"
              },
              "note": {
                "en": "The Transactions, Consistency and Consensus chapters",
                "ru": "Главы Transactions, Consistency and Consensus"
              }
            },
            {
              "label": {
                "en": "PostgreSQL docs",
                "ru": "PostgreSQL docs"
              },
              "note": {
                "en": "Concurrency Control — Transaction Isolation, MVCC",
                "ru": "Concurrency Control — Transaction Isolation, MVCC"
              }
            }
          ]
        },
        {
          "id": "w13d6",
          "track": "patterns",
          "title": {
            "en": "Capstone wrap-up and a \"what grew, where next\" retro",
            "ru": "Капстоун wrap-up и ретро «что вырос, куда дальше»"
          },
          "warmup": {
            "en": "Algo warm-up: in 10-15 min, re-solve 1 previously hard problem you closed during the phase and note how much faster it goes now — that's your progress measurement.",
            "ru": "Алго-разминка: за 10-15 мин пере-реши 1 ранее сложную задачу, которую закрыл в фазе, и отметь, насколько быстрее идёт сейчас — это и есть замер прогресса."
          },
          "reflectPrompt": {
            "en": "Which pattern in the capstone did you add out of engineering fear rather than real need, and would now remove in the name of simplicity?",
            "ru": "Какой паттерн в капстоуне ты добавил из инженерного страха, а не из реальной потребности, и убрал бы его теперь во имя простоты?"
          },
          "tasks": [
            {
              "id": "t1",
              "text": {
                "en": "Get the capstone to a \"ready to show\" state: update the README with a description of the architecture and the patterns adopted (e.g. outbox, event-driven processing, DDD layer separation), and record the remaining TODOs as deliberate limitations, not unfinished work.",
                "ru": "Довести капстоун до состояния «можно показать»: обновить README с описанием архитектуры и принятых паттернов (например outbox, event-driven обработка, разделение слоёв DDD), зафиксировать оставшиеся TODO как осознанные ограничения, а не недоделки."
              }
            },
            {
              "id": "t2",
              "text": {
                "en": "Do a self-review of the capstone against a staff-level checklist: where a pattern is applied for a reason, and where it's needless complexity (tying back to simplicity-first); write out 2-3 spots you'd simplify or design differently.",
                "ru": "Провести само-ревью капстоуна по чек-листу staff-уровня: где паттерн применён по делу, а где это лишняя сложность (привязка к simplicity-first); выписать 2-3 места, которые упростил бы или спроектировал иначе."
              }
            },
            {
              "id": "t3",
              "text": {
                "en": "Write a phase retro by structure: what grew (concrete skills with evidence), where gaps remain, and 3 directions for the next phase with a \"how I'll know I've grown\" criterion. Save it as an anchor point for growth toward staff/principal.",
                "ru": "Написать ретро фазы по структуре: что вырос (конкретные навыки с доказательством), где остались пробелы, и 3 направления на следующую фазу с критерием «как пойму, что вырос». Сохранить как опорную точку роста к staff/principal."
              }
            }
          ],
          "resources": [
            {
              "label": {
                "en": "Refactoring (Fowler)",
                "ru": "Refactoring (Fowler)"
              },
              "note": {
                "en": "A catalog of code smells for the capstone self-review",
                "ru": "Каталог запахов кода для само-ревью капстоуна"
              }
            },
            {
              "label": {
                "en": "Staff Engineer (Will Larson)",
                "ru": "Staff Engineer (Will Larson)"
              },
              "note": {
                "en": "Growth reference points for the \"where next\" section",
                "ru": "Ориентиры роста для секции «куда дальше»"
              }
            }
          ]
        },
        {
          "id": "w13d7",
          "track": "rest",
          "rest": true,
          "reflectPrompt": {
            "en": "What to lock in from the week?",
            "ru": "Что закрепить из недели?"
          }
        }
      ]
    }
  ],
  "badges": [
    {
      "id": "phase-1",
      "type": "phase-complete",
      "phase": "1",
      "title": {
        "en": "Phase I",
        "ru": "Фаза I"
      },
      "desc": {
        "en": "Phase 1 complete",
        "ru": "Фаза 1 пройдена"
      },
      "icon": "①"
    },
    {
      "id": "phase-2",
      "type": "phase-complete",
      "phase": "2",
      "title": {
        "en": "Phase II",
        "ru": "Фаза II"
      },
      "desc": {
        "en": "Phase 2 complete",
        "ru": "Фаза 2 пройдена"
      },
      "icon": "②"
    },
    {
      "id": "phase-3",
      "type": "phase-complete",
      "phase": "3",
      "title": {
        "en": "Phase III",
        "ru": "Фаза III"
      },
      "desc": {
        "en": "Phase 3 complete",
        "ru": "Фаза 3 пройдена"
      },
      "icon": "③"
    },
    {
      "id": "algorithmist",
      "type": "tasks-done",
      "track": "dsa",
      "gte": 50,
      "title": {
        "en": "Algorithmist",
        "ru": "Algorithmist"
      },
      "desc": {
        "en": "50 algorithm problems",
        "ru": "50 задач по алгоритмам"
      },
      "icon": "🧮"
    },
    {
      "id": "capstone",
      "type": "item-complete",
      "item": "w13d6",
      "title": {
        "en": "Capstone",
        "ru": "Capstone"
      },
      "desc": {
        "en": "Capstone finished",
        "ru": "Капстоун завершён"
      },
      "icon": "🏛️"
    },
    {
      "id": "dsa-master",
      "type": "track-complete",
      "track": "dsa",
      "title": {
        "en": "Algorithms Master",
        "ru": "Магистр алгоритмов"
      },
      "desc": {
        "en": "All algorithm days complete",
        "ru": "Все дни алгоритмов пройдены"
      },
      "icon": "🧠"
    },
    {
      "id": "node-master",
      "type": "track-complete",
      "track": "node",
      "title": {
        "en": "Node Master",
        "ru": "Магистр Node"
      },
      "desc": {
        "en": "All Node.js days complete",
        "ru": "Все дни Node.js пройдены"
      },
      "icon": "🟢"
    },
    {
      "id": "ts-master",
      "type": "track-complete",
      "track": "ts",
      "title": {
        "en": "TS Master",
        "ru": "Магистр TS"
      },
      "desc": {
        "en": "All TypeScript days complete",
        "ru": "Все дни TypeScript пройдены"
      },
      "icon": "🔷"
    },
    {
      "id": "sysdesign-master",
      "type": "track-complete",
      "track": "sysdesign",
      "title": {
        "en": "System Design Master",
        "ru": "Магистр System Design"
      },
      "desc": {
        "en": "All System Design days complete",
        "ru": "Все дни System Design пройдены"
      },
      "icon": "🏗️"
    },
    {
      "id": "polyglot",
      "type": "all-tracks",
      "eachGte": 1,
      "title": {
        "en": "Polyglot",
        "ru": "Полиглот"
      },
      "desc": {
        "en": "At least one day in every track",
        "ru": "Хотя бы один день в каждом треке"
      },
      "icon": "🌐"
    }
  ],
  "mottos": [
    {
      "en": "継続は力なり · perseverance is strength",
      "ru": "継続は力なり · постоянство — это сила"
    },
    {
      "en": "七転び八起き · fall down seven times, stand up eight",
      "ru": "七転び八起き · упал семь раз — встань восемь"
    },
    {
      "en": "千里の道も一歩から · a journey of a thousand li begins with a single step",
      "ru": "千里の道も一歩から · путь в тысячу ли начинается с одного шага"
    },
    {
      "en": "塵も積もれば山となる · even specks of dust, piling up, become a mountain",
      "ru": "塵も積もれば山となる · и пылинки, накапливаясь, становятся горой"
    },
    {
      "en": "石の上にも三年 · sit on a rock for three years and even the rock grows warm",
      "ru": "石の上にも三年 · посиди на камне три года — и камень нагреется"
    },
    {
      "en": "為せば成る · if you set out to do it, it gets done",
      "ru": "為せば成る · возьмёшься — выйдет"
    },
    {
      "en": "初心忘るべからず · never forget the beginner's spirit",
      "ru": "初心忘るべからず · не забывай дух начинающего"
    },
    {
      "en": "雨垂れ石を穿つ · dripping water wears through stone",
      "ru": "雨垂れ石を穿つ · капля камень точит"
    },
    {
      "en": "急がば回れ · when in a hurry, take the long way around",
      "ru": "急がば回れ · спешишь — иди в обход"
    },
    {
      "en": "一歩一歩 · step by step",
      "ru": "一歩一歩 · шаг за шагом"
    }
  ],
  "surprises": [
    {
      "en": "Small steps every day beat once-a-month sprints.",
      "ru": "Маленькие шаги каждый день обгоняют рывки раз в месяц."
    },
    {
      "en": "You just became a slightly better engineer than you were yesterday.",
      "ru": "Ты только что стал чуть лучшим инженером, чем вчера."
    },
    {
      "en": "Compound interest works for skills too — keep going.",
      "ru": "Сложный процент работает и для навыков — продолжай."
    },
    {
      "en": "Day closed. Future you thanks present you.",
      "ru": "День закрыт. Будущий ты благодарит настоящего тебя."
    },
    {
      "en": "Depth comes to those who show up every day.",
      "ru": "Глубина приходит к тем, кто приходит каждый день."
    },
    {
      "en": "It's not a deadline — it's a journey. And you're on it.",
      "ru": "Это не дедлайн — это путь. И ты на нём."
    },
    {
      "en": "1% a day is roughly 37× over a year.",
      "ru": "1% в день — это примерно 37× за год."
    },
    {
      "en": "Discipline is future you's freedom.",
      "ru": "Дисциплина — это свобода будущего тебя."
    }
  ]
};
  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);
  if (typeof module !== 'undefined' && module.exports) module.exports = pack;
})(typeof window !== 'undefined' ? window : globalThis);
