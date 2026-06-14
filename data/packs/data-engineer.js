'use strict';
(function (root) {
  var pack = {
    "schema": "sunrise.pack/v1",
    "id": "data-engineer",
    "name": {
      "en": "Data Engineer",
      "ru": "Дата-инженер"
    },
    "version": "1.0.0",
    "locale": "ru",
    "settings": {
      "labels": {
        "phase": {
          "en": "Phase",
          "ru": "Фаза"
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
      "phaseLabel": {
        "en": "Phase {p} · Week {w}",
        "ru": "Фаза {p} · Неделя {w}"
      },
      "todayVert": {
        "en": "TODAY",
        "ru": "СЕГОДНЯ"
      },
      "restVert": {
        "en": "REST",
        "ru": "ОТДЫХ"
      },
      "aiPrompt": {
        "en": "You are my data-engineering mentor. Topic: \"{title}\" — track: {track}. Today's task:\n\n{text}\n{guidance}\nExplain what I need to know to do this well, walk through one concrete worked example, then ask me one question to check my understanding.",
        "ru": "Ты мой ментор по дата-инженерии. Тема: «{title}» — трек: {track}. Задача на сегодня:\n\n{text}\n{guidance}\nОбъясни, что нужно знать, чтобы сделать это хорошо, разбери один конкретный пример, затем задай мне один вопрос для проверки понимания."
      },
      "aiPromptGuidance": {
        "en": "A strong result looks like: {guidance}\n",
        "ru": "Сильный результат выглядит так: {guidance}\n"
      }
    },
    "tracks": [
      {
        "id": "python",
        "label": {
          "en": "Python Engineering",
          "ru": "Python-инженерия"
        },
        "icon": "🐍",
        "color": "#4B8BBE"
      },
      {
        "id": "modeling",
        "label": {
          "en": "Data Modeling",
          "ru": "Моделирование данных"
        },
        "icon": "🧱",
        "color": "#C0654E"
      },
      {
        "id": "warehouse",
        "label": {
          "en": "Warehouse & dbt",
          "ru": "Хранилище и dbt"
        },
        "icon": "🏬",
        "color": "#8E44AD"
      },
      {
        "id": "pipelines",
        "label": {
          "en": "Pipelines & Orchestration",
          "ru": "Пайплайны и оркестрация"
        },
        "icon": "🔧",
        "color": "#16A085"
      },
      {
        "id": "quality",
        "label": {
          "en": "Quality & Scale",
          "ru": "Качество и масштаб"
        },
        "icon": "🛡️",
        "color": "#E67E22"
      }
    ],
    "phases": [
      {
        "id": "1",
        "title": {
          "en": "Foundations",
          "ru": "Фундамент"
        }
      },
      {
        "id": "2",
        "title": {
          "en": "Pipelines & Production",
          "ru": "Пайплайны и продакшн"
        }
      }
    ],
    "badges": [
      {
        "id": "de-pythonista",
        "type": "track-complete",
        "track": "python",
        "title": {
          "en": "Pythonista",
          "ru": "Питонист"
        },
        "desc": {
          "en": "Finished the Python Engineering track",
          "ru": "Трек Python-инженерии пройден"
        },
        "icon": "🐍"
      },
      {
        "id": "de-warehouse",
        "type": "track-complete",
        "track": "warehouse",
        "title": {
          "en": "Warehouse Wrangler",
          "ru": "Хозяин хранилища"
        },
        "desc": {
          "en": "Finished the Warehouse & dbt track",
          "ru": "Трек «Хранилище и dbt» пройден"
        },
        "icon": "🏬"
      },
      {
        "id": "de-plumber",
        "type": "track-complete",
        "track": "pipelines",
        "title": {
          "en": "Pipeline Plumber",
          "ru": "Сантехник пайплайнов"
        },
        "desc": {
          "en": "Finished the Pipelines & Orchestration track",
          "ru": "Трек «Пайплайны» пройден"
        },
        "icon": "🔧"
      },
      {
        "id": "de-foundations",
        "type": "phase-complete",
        "phase": "1",
        "title": {
          "en": "Foundations Laid",
          "ru": "Фундамент заложен"
        },
        "desc": {
          "en": "Completed the Foundations phase",
          "ru": "Фаза «Фундамент» завершена"
        },
        "icon": "🧱"
      },
      {
        "id": "de-shipped",
        "type": "item-complete",
        "item": "w5d6",
        "title": {
          "en": "Shipped It",
          "ru": "Зарелижено"
        },
        "desc": {
          "en": "Shipped the capstone pipeline",
          "ru": "Финальный пайплайн зарелижен"
        },
        "icon": "🚢"
      }
    ],
    "mottos": [
      {
        "en": "Idempotent by default — run it twice, get the same truth.",
        "ru": "Идемпотентность по умолчанию — запусти дважды, получи ту же истину."
      },
      {
        "en": "The data is never as clean as the ticket says.",
        "ru": "Данные никогда не так чисты, как написано в задаче."
      },
      {
        "en": "A pipeline you can't re-run is a pipeline you can't trust.",
        "ru": "Пайплайн, который нельзя перезапустить, — это пайплайн, которому нельзя доверять."
      },
      {
        "en": "Model first, query later.",
        "ru": "Сначала модель, потом запрос."
      },
      {
        "en": "Tests are the contract; green means you can sleep.",
        "ru": "Тесты — это контракт; зелёное значит можно спать спокойно."
      },
      {
        "en": "Small batches, loud failures, calm on-call.",
        "ru": "Маленькие батчи, громкие падения, спокойное дежурство."
      }
    ],
    "surprises": [
      {
        "en": "Another day closer to pipelines that just work.",
        "ru": "Ещё на день ближе к пайплайнам, которые просто работают."
      },
      {
        "en": "Future on-call you just got a little luckier.",
        "ru": "Будущему дежурному только что стало чуть легче."
      },
      {
        "en": "You turned a notebook habit into an engineering one.",
        "ru": "Вы превратили привычку из ноутбука в инженерную."
      },
      {
        "en": "One more brick in the warehouse.",
        "ru": "Ещё один кирпич в хранилище."
      },
      {
        "en": "Clean data doesn't happen by accident — nice work.",
        "ru": "Чистые данные не случаются сами — отличная работа."
      }
    ],
    "groups": [
      {
        "id": "g1",
        "title": {
          "en": "Toolkit & thinking in models",
          "ru": "Инструментарий и мышление моделями"
        },
        "phase": "1",
        "items": [
          {
            "id": "w1d1",
            "track": "python",
            "title": {
              "en": "From notebook to script",
              "ru": "От ноутбука к скрипту"
            },
            "warmup": {
              "en": "When does a notebook stop being enough — and what breaks first when someone else has to run it?",
              "ru": "Когда ноутбука перестаёт хватать — и что ломается первым, когда его должен запустить кто-то другой?"
            },
            "reflectPrompt": {
              "en": "What did the notebook hide that running from the terminal forced you to make explicit?",
              "ru": "Что ноутбук скрывал, а запуск из терминала заставил сделать явным?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: why notebooks do not scale — hidden state, out-of-order execution, no reuse/tests/version control.",
                  "ru": "Теория: почему ноутбуки не масштабируются — скрытое состояние, выполнение не по порядку, отсутствие переиспользования/тестов/контроля версий."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: anatomy of a Python project — modules vs scripts, the import system, __name__/__main__, entry points; what a virtual environment isolates.",
                  "ru": "Теория: устройство Python-проекта — модули против скриптов, система импорта, __name__/__main__, точки входа; что изолирует виртуальное окружение."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: turn one notebook cell into a runnable script with a CLI flag.",
                  "ru": "Практика: превратите одну ячейку ноутбука в запускаемый скрипт с флагом командной строки."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "Python docs",
                  "ru": "Python docs"
                },
                "note": {
                  "en": "Read the Modules tutorial — the import system and the __name__ == '__main__' idiom.",
                  "ru": "Прочитайте раздел Modules в учебнике — систему импорта и идиому __name__ == '__main__'."
                }
              }
            ]
          },
          {
            "id": "w1d2",
            "track": "modeling",
            "title": {
              "en": "OLTP vs OLAP",
              "ru": "OLTP против OLAP"
            },
            "warmup": {
              "en": "Your reporting query scans millions of rows — why would the database your app writes to hate that workload?",
              "ru": "Ваш отчётный запрос сканирует миллионы строк — почему база, в которую пишет приложение, ненавидит такую нагрузку?"
            },
            "reflectPrompt": {
              "en": "Which normalization rule that helps an OLTP system actively hurts an analytical one, and why?",
              "ru": "Какое правило нормализации, полезное для OLTP, активно вредит аналитической системе, и почему?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: transactional vs analytical workloads, row vs columnar storage — why each fits its access pattern.",
                  "ru": "Теория: транзакционные и аналитические нагрузки, строковое против колоночного хранения — почему каждое подходит своему паттерну доступа."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: normalized vs dimensional schemas; normalization 1NF->3NF and the anomaly each form removes.",
                  "ru": "Теория: нормализованные против размерных схем; нормализация 1NF->3NF и аномалия, устраняемая каждой формой."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: classify a few sample schemas as OLTP or OLAP and name the deciding signal for each.",
                  "ru": "Практика: классифицируйте несколько примерных схем как OLTP или OLAP и назовите решающий признак для каждой."
                }
              }
            ]
          },
          {
            "id": "w1d3",
            "track": "python",
            "title": {
              "en": "Git for engineers",
              "ru": "Git для инженеров"
            },
            "warmup": {
              "en": "What does a teammate learn from your commit history that they can't learn from the final code alone?",
              "ru": "Что коллега узнаёт из истории Ваших коммитов, чего не узнать из одного лишь финального кода?"
            },
            "reflectPrompt": {
              "en": "Reading your own diff before pushing — what would a reviewer have flagged that you almost shipped?",
              "ru": "Читая собственный diff перед отправкой — что отметил бы ревьюер из того, что Вы чуть не отправили?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: what version control models — snapshots, the commit graph, branches and merges.",
                  "ru": "Теория: что моделирует контроль версий — снимки, граф коммитов, ветки и слияния."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: working tree vs staging vs commit; what makes an atomic commit and why history is communication.",
                  "ru": "Теория: рабочее дерево против индекса против коммита; что делает коммит атомарным и почему история — это коммуникация."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: make 2 atomic commits and review your own diff before pushing.",
                  "ru": "Практика: сделайте 2 атомарных коммита и просмотрите собственный diff перед отправкой."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "Pro Git",
                  "ru": "Pro Git"
                },
                "note": {
                  "en": "Read \"Git Basics\" and \"Branching in a Nutshell\" — the staging area and the commit graph.",
                  "ru": "Прочитайте «Git Basics» и «Branching in a Nutshell» — область индексации и граф коммитов."
                }
              }
            ]
          },
          {
            "id": "w1d4",
            "track": "modeling",
            "title": {
              "en": "Dimensional modeling intro",
              "ru": "Введение в размерное моделирование"
            },
            "warmup": {
              "en": "In a sales report, which numbers do you sum and which ones do you slice by? That split is facts vs dimensions.",
              "ru": "В отчёте по продажам какие числа Вы суммируете, а по каким режете? Это и есть деление на факты и измерения."
            },
            "reflectPrompt": {
              "en": "How would the grain you chose change which questions the fact table can and cannot answer?",
              "ru": "Как выбранное Вами зерно (grain) меняет то, на какие вопросы таблица фактов может и не может ответить?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: facts vs dimensions, measures vs attributes — what each role carries in a model.",
                  "ru": "Теория: факты против измерений, меры против атрибутов — что несёт каждая роль в модели."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: the grain of a fact table and why grain is decided first; the star schema and why it beats normalized models for analytics.",
                  "ru": "Теория: зерно (grain) таблицы фактов и почему его определяют первым; схема-звезда и почему она лучше нормализованных моделей для аналитики."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: state the grain and list the dimensions of an orders fact.",
                  "ru": "Практика: сформулируйте зерно (grain) и перечислите измерения для таблицы фактов заказов."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "Kimball, \"The Data Warehouse Toolkit\"",
                  "ru": "Kimball, «The Data Warehouse Toolkit»"
                },
                "note": {
                  "en": "Read Chapter 1 — facts, dimensions, grain, and the four-step dimensional design process.",
                  "ru": "Прочитайте главу 1 — факты, измерения, зерно (grain) и четырёхшаговый процесс размерного проектирования."
                }
              }
            ]
          },
          {
            "id": "w1d5",
            "track": "python",
            "title": {
              "en": "Unit testing & pure functions",
              "ru": "Юнит-тесты и чистые функции"
            },
            "warmup": {
              "en": "Which part of a pipeline can you test without a database, a clock, or the network — and why is that the part worth testing first?",
              "ru": "Какую часть пайплайна можно протестировать без базы, часов и сети — и почему именно её стоит тестировать первой?"
            },
            "reflectPrompt": {
              "en": "Where did writing a test force you to pull I/O out of a function so it became testable?",
              "ru": "Где написание теста заставило Вас вынести ввод-вывод из функции, чтобы её стало можно тестировать?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: why pure functions — deterministic, no I/O — are the testable core of a pipeline.",
                  "ru": "Теория: почему чистые функции — детерминированные, без ввода-вывода — это тестируемое ядро пайплайна."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: anatomy of a unit test (arrange/act/assert), what to test (boundaries, edge cases) vs what not, the red->green loop — with pytest.",
                  "ru": "Теория: устройство юнит-теста (arrange/act/assert), что тестировать (границы, краевые случаи), а что нет, цикл red->green — на pytest."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: write 2-3 pytest cases for a small transform.",
                  "ru": "Практика: напишите 2-3 теста на pytest для небольшого преобразования."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "pytest docs",
                  "ru": "pytest docs"
                },
                "note": {
                  "en": "Read \"Get Started\" — how pytest discovers tests and how plain assert statements work.",
                  "ru": "Прочитайте «Get Started» — как pytest находит тесты и как работают обычные assert."
                }
              }
            ]
          },
          {
            "id": "w1d6",
            "track": "modeling",
            "title": {
              "en": "Star schema in depth",
              "ru": "Схема-звезда в глубину"
            },
            "warmup": {
              "en": "Two fact tables share a date and a customer — what has to be true about those dimensions for the numbers to line up across both?",
              "ru": "Две таблицы фактов делят дату и клиента — что должно быть верно об этих измерениях, чтобы числа сходились в обеих?"
            },
            "reflectPrompt": {
              "en": "Which measure in your star is non-additive, and what would break if someone summed it across the wrong dimension?",
              "ru": "Какая мера в Вашей звезде неаддитивна, и что сломается, если её просуммируют по неверному измерению?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: conformed dimensions, surrogate vs natural keys — why a warehouse owns its own keys.",
                  "ru": "Теория: согласованные измерения, суррогатные против натуральных ключей — почему хранилище владеет собственными ключами."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: additive / semi-additive / non-additive measures; fact table types — transaction, periodic snapshot, accumulating snapshot.",
                  "ru": "Теория: аддитивные / полуаддитивные / неаддитивные меры; типы таблиц фактов — транзакционная, периодический снимок, накопительный снимок."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: sketch a star and write DDL for the fact plus one dimension.",
                  "ru": "Практика: набросайте звезду и напишите DDL для таблицы фактов и одного измерения."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "Kimball, \"The Data Warehouse Toolkit\"",
                  "ru": "Kimball, «The Data Warehouse Toolkit»"
                },
                "note": {
                  "en": "Read the chapters on additivity and conformed dimensions, and the three fact table types.",
                  "ru": "Прочитайте главы об аддитивности и согласованных измерениях, а также о трёх типах таблиц фактов."
                }
              }
            ]
          },
          {
            "id": "w1rest",
            "track": "rest",
            "rest": true,
            "reflectPrompt": {
              "en": "This week split the world into code that runs and models that hold data — which idea reshaped how you'll structure your next pipeline most?",
              "ru": "Эта неделя разделила мир на код, который выполняется, и модели, которые хранят данные — какая идея сильнее всего изменит то, как Вы построите следующий пайплайн?"
            }
          }
        ]
      },
      {
        "id": "g2",
        "title": {
          "en": "Typed Python + the warehouse",
          "ru": "Типизированный Python и хранилище"
        },
        "phase": "1",
        "items": [
          {
            "id": "w2d1",
            "track": "python",
            "title": {
              "en": "Type hints & typed records",
              "ru": "Type hints и типизированные записи"
            },
            "warmup": {
              "en": "What does mypy know about your code that the Python interpreter never checks?",
              "ru": "Что mypy знает о вашем коде такого, что интерпретатор Python никогда не проверяет?"
            },
            "reflectPrompt": {
              "en": "Where would a typed record have caught a bug in your past analyst code that a raw dict silently let through?",
              "ru": "Где типизированная запись поймала бы ошибку в вашем прошлом аналитическом коде, которую голый dict молча пропустил?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: what static typing buys (errors before runtime, self-documenting interfaces), type hints vs runtime validation, dataclasses vs pydantic, modeling a row as a typed record — when each fits.",
                  "ru": "Теория: что даёт статическая типизация (ошибки до запуска, самодокументируемые интерфейсы), type hints против валидации в рантайме, dataclasses против pydantic, моделирование строки как типизированной записи — когда что подходит."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Practice: add type hints to one transform module, model a row as a dataclass or pydantic model, run mypy until clean.",
                  "ru": "Практика: добавьте type hints к одному модулю-преобразованию, опишите строку как dataclass или модель pydantic, прогоните mypy до чистого результата."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "Python docs",
                  "ru": "Python docs"
                },
                "note": {
                  "en": "typing module — read the intro and Optional/Union; skim the dataclasses page.",
                  "ru": "Модуль typing — прочитайте введение и Optional/Union; пробегите страницу dataclasses."
                }
              }
            ]
          },
          {
            "id": "w2d2",
            "track": "warehouse",
            "title": {
              "en": "Columnar & MPP",
              "ru": "Колоночные хранилища и MPP"
            },
            "warmup": {
              "en": "In an analytical scan, do you touch most columns or most rows — and which storage layout is built for that?",
              "ru": "В аналитическом скане вы трогаете большинство колонок или большинство строк — и какая раскладка хранения создана для этого?"
            },
            "reflectPrompt": {
              "en": "Which past report fought a row-store that a columnar MPP warehouse would have made trivial — and what was the mechanism?",
              "ru": "Какой прошлый отчёт боролся с row-store, который колоночное MPP-хранилище сделало бы тривиальным — и в чём был механизм?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: columnar storage internals (per-column compression, projection and predicate pushdown, vectorized scans) — why columnar wins for big aggregations.",
                  "ru": "Теория: внутреннее устройство колоночного хранения (сжатие по колонкам, projection и predicate pushdown, векторные сканы) — почему колоночность выигрывает на больших агрегациях."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: massively parallel processing (shared-nothing, data distribution, shuffles), partitioning vs clustering, how partition pruning works.",
                  "ru": "Теория: massively parallel processing (shared-nothing, распределение данных, shuffles), партиционирование против кластеризации, как работает partition pruning."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: given two queries over one table, predict which scans less data and which avoids a full scan — say why for each.",
                  "ru": "Практика: для двух запросов по одной таблице предскажите, какой просканирует меньше данных и какой избежит полного скана — обоснуйте каждый."
                }
              }
            ]
          },
          {
            "id": "w2d3",
            "track": "modeling",
            "title": {
              "en": "Slowly changing dimensions",
              "ru": "Медленно меняющиеся измерения"
            },
            "warmup": {
              "en": "When a customer moves city, should old fact rows keep the old city or the new one — and who decides?",
              "ru": "Когда клиент сменил город, старые строки фактов должны хранить старый город или новый — и кто это решает?"
            },
            "reflectPrompt": {
              "en": "Which of your real dimensions truly need history (SCD2) and which are fine to overwrite (SCD1) — what made the difference?",
              "ru": "Каким из ваших реальных измерений действительно нужна история (SCD2), а какие можно перезаписывать (SCD1) — что определило выбор?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: why dimensions change over time, SCD types 0/1/2/3 and what history each preserves, surrogate keys and effective-dating for SCD2 — the history-vs-complexity trade-off.",
                  "ru": "Теория: почему измерения меняются со временем, типы SCD 0/1/2/3 и какую историю хранит каждый, surrogate keys и effective-dating для SCD2 — компромисс между историей и сложностью."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Practice: design an SCD2 dimension table — columns including surrogate key, business key, effective-from/to, and a current-flag.",
                  "ru": "Практика: спроектируйте таблицу измерения SCD2 — колонки с surrogate key, бизнес-ключом, effective-from/to и флагом текущей версии."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "Kimball, \"The Data Warehouse Toolkit\"",
                  "ru": "Kimball, «The Data Warehouse Toolkit»"
                },
                "note": {
                  "en": "Read the slowly-changing-dimension techniques (types 1/2/3) section.",
                  "ru": "Прочитайте раздел о техниках медленно меняющихся измерений (типы 1/2/3)."
                }
              }
            ]
          },
          {
            "id": "w2d4",
            "track": "warehouse",
            "title": {
              "en": "How dbt models work",
              "ru": "Как устроены модели dbt"
            },
            "warmup": {
              "en": "If your transformations are just SELECTs, what builds the order they run in?",
              "ru": "Если ваши преобразования — это просто SELECT, что строит порядок их запуска?"
            },
            "reflectPrompt": {
              "en": "How does ref() change how you reason about dependencies compared to hand-written CREATE TABLE scripts?",
              "ru": "Как ref() меняет ваше рассуждение о зависимостях по сравнению с рукописными скриптами CREATE TABLE?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: what dbt is (ELT as templated SELECTs), sources and ref() and the DAG dbt builds, materializations (view / table / incremental / ephemeral) and their trade-offs — the analytics-engineering workflow.",
                  "ru": "Теория: что такое dbt (ELT как шаблонные SELECT), sources, ref() и DAG, который строит dbt, materializations (view / table / incremental / ephemeral) и их компромиссы — workflow аналитической инженерии."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Practice: build one staging model that reads a raw table via source() and a downstream model that reads it via ref().",
                  "ru": "Практика: постройте одну staging-модель, читающую сырую таблицу через source(), и нижестоящую модель, читающую её через ref()."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "dbt docs",
                  "ru": "dbt docs"
                },
                "note": {
                  "en": "\"Build your first models\" — sources, ref(), and materializations.",
                  "ru": "«Build your first models» — про sources, ref() и materializations."
                }
              }
            ]
          },
          {
            "id": "w2d5",
            "track": "python",
            "title": {
              "en": "Dependencies & reproducibility",
              "ru": "Зависимости и воспроизводимость"
            },
            "warmup": {
              "en": "\"Works on my machine\" — in dependency terms, what exactly differs between two machines?",
              "ru": "«У меня работает» — на языке зависимостей, что именно различается между двумя машинами?"
            },
            "reflectPrompt": {
              "en": "What is the precise gap between a declared dependency set and a reproducible one — and where does it bite?",
              "ru": "В чём точная разница между объявленным набором зависимостей и воспроизводимым — и где она бьёт?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: why \"works on my machine\" happens, abstract dependencies vs a pinned/locked set, semantic versioning, environments, pyproject and lockfiles — what makes a build reproducible.",
                  "ru": "Теория: почему случается «у меня работает», абстрактные зависимости против зафиксированного/залоченного набора, семантическое версионирование, окружения, pyproject и lockfiles — что делает сборку воспроизводимой."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Practice: pin your dependencies, reproduce the environment in a clean venv, and confirm the script still runs.",
                  "ru": "Практика: зафиксируйте зависимости, воспроизведите окружение в чистом venv и убедитесь, что скрипт всё ещё работает."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "Python docs",
                  "ru": "Python docs"
                },
                "note": {
                  "en": "\"Packaging Python Projects\" — the pyproject.toml tutorial.",
                  "ru": "«Packaging Python Projects» — туториал по pyproject.toml."
                }
              }
            ]
          },
          {
            "id": "w2d6",
            "track": "warehouse",
            "title": {
              "en": "Testing data in dbt",
              "ru": "Тестирование данных в dbt"
            },
            "warmup": {
              "en": "What is the cheapest data-quality bug to catch — at the model boundary or three dashboards downstream?",
              "ru": "Какой баг качества данных дешевле всего поймать — на границе модели или через три дашборда ниже по потоку?"
            },
            "reflectPrompt": {
              "en": "Which generic tests would have caught a real incident from your analyst days, and where do they fall short?",
              "ru": "Какие generic-тесты поймали бы реальный инцидент из вашей аналитической практики, и где их не хватает?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: declarative data tests (unique, not_null, relationships, accepted_values) vs singular tests, tests as executable assumptions and contracts, where tests sit in the DAG, docs as a model artifact.",
                  "ru": "Теория: декларативные тесты данных (unique, not_null, relationships, accepted_values) против singular-тестов, тесты как исполняемые допущения и контракты, место тестов в DAG, документация как артефакт модели."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Practice: add tests to one model (unique/not_null on its key plus a relationships test) and run dbt test.",
                  "ru": "Практика: добавьте тесты к одной модели (unique/not_null на ключ плюс relationships-тест) и запустите dbt test."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "dbt docs",
                  "ru": "dbt docs"
                },
                "note": {
                  "en": "\"Add data tests to your DAG\" — generic vs singular tests.",
                  "ru": "«Add data tests to your DAG» — generic против singular-тестов."
                }
              }
            ]
          },
          {
            "id": "w2rest",
            "track": "rest",
            "rest": true,
            "reflectPrompt": {
              "en": "This week moved you from notebooks to typed, reproducible code and from queries to a modeled, tested warehouse. Which single idea — static typing, columnar/MPP internals, SCD history, the dbt DAG, locked environments, or data tests — most changed how you will build, and why?",
              "ru": "Эта неделя перевела вас от ноутбуков к типизированному, воспроизводимому коду и от запросов к смоделированному, протестированному хранилищу. Какая одна идея — статическая типизация, внутреннее устройство колоночных/MPP-систем, история SCD, DAG в dbt, зафиксированные окружения или тесты данных — сильнее всего изменила то, как вы будете строить, и почему?"
            }
          }
        ]
      },
      {
        "id": "g3",
        "title": {
          "en": "ELT in practice",
          "ru": "ELT на практике"
        },
        "phase": "2",
        "items": [
          {
            "id": "w3d1",
            "track": "pipelines",
            "title": {
              "en": "ETL vs ELT & idempotency",
              "ru": "ETL против ELT и идемпотентность"
            },
            "warmup": {
              "en": "If a load job dies halfway and you simply re-run it, does the table end up the same — or doubled?",
              "ru": "Если задача загрузки умирает на полпути и Вы просто перезапускаете её — таблица станет такой же или удвоится?"
            },
            "reflectPrompt": {
              "en": "Which of your current jobs would corrupt its target on a blind re-run, and what is the smallest change that fixes it?",
              "ru": "Какая из Ваших текущих задач испортила бы целевую таблицу при слепом перезапуске, и какое минимальное изменение это чинит?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: ETL vs ELT, where transformation runs, why ELT won with cheap warehouse compute, full vs incremental loads — transform where the data already lives.",
                  "ru": "Теория: ETL против ELT, где выполняется трансформация, почему ELT победил при дешёвых вычислениях в хранилище, полная против инкрементальной загрузки — трансформируйте там, где данные уже лежат."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: idempotency, convergent re-runs, delivery semantics (at-least-once needs dedup/upsert), exactly-once as an illusion — design for replay.",
                  "ru": "Теория: идемпотентность, сходимость повторных запусков, семантика доставки (at-least-once требует dedup/upsert), exactly-once как иллюзия — проектируйте под повтор."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: take one non-idempotent load and make it idempotent via a merge/upsert keyed on a natural key.",
                  "ru": "Практика: возьмите одну неидемпотентную загрузку и сделайте её идемпотентной через merge/upsert по натуральному ключу."
                }
              }
            ]
          },
          {
            "id": "w3d2",
            "track": "warehouse",
            "title": {
              "en": "Incremental models & snapshots",
              "ru": "Инкрементальные модели и снимки"
            },
            "warmup": {
              "en": "Your table has 2 billion rows but yesterday only 10,000 changed — why is your job still reading all 2 billion?",
              "ru": "В Вашей таблице 2 миллиарда строк, но вчера изменились лишь 10 000 — почему задача всё ещё читает все 2 миллиарда?"
            },
            "reflectPrompt": {
              "en": "An incremental model trades correctness-on-rebuild for speed — where does that trade quietly bite you?",
              "ru": "Инкрементальная модель меняет корректность-при-пересборке на скорость — где этот компромисс тихо Вас укусит?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: why you do not rebuild the world each run, incremental models, the is_incremental pattern, late-arriving data, merge strategies.",
                  "ru": "Теория: почему не нужно пересобирать весь мир за каждый запуск, инкрементальные модели, паттерн is_incremental, поздно приходящие данные, стратегии merge."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: dbt snapshots as point-in-time history, SCD2 mechanics (valid_from/valid_to, current flag) — capturing how a row looked over time.",
                  "ru": "Теория: снимки dbt как история на момент времени, механика SCD2 (valid_from/valid_to, признак текущей записи) — фиксация того, как выглядела строка во времени."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: convert one model to incremental and add a dbt snapshot over a slowly-changing dimension.",
                  "ru": "Практика: переведите одну модель в инкрементальную и добавьте снимок dbt над медленно меняющимся измерением."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "dbt docs",
                  "ru": "dbt docs"
                },
                "note": {
                  "en": "Read the \"Incremental models\" and \"Snapshots\" pages — is_incremental(), unique_key, and SCD2 strategies.",
                  "ru": "Прочитайте страницы «Incremental models» и «Snapshots» — is_incremental(), unique_key и стратегии SCD2."
                }
              }
            ]
          },
          {
            "id": "w3d3",
            "track": "pipelines",
            "title": {
              "en": "Ingestion & the raw layer",
              "ru": "Приём данных и сырой слой"
            },
            "warmup": {
              "en": "A source API changes a field's type overnight — should that break your raw layer, or your staging layer?",
              "ru": "Источник-API за ночь меняет тип поля — что должно сломаться: Ваш сырой слой или слой staging?"
            },
            "reflectPrompt": {
              "en": "If you kept raw data byte-for-byte unchanged, what past incident could you now replay your way out of?",
              "ru": "Если бы Вы хранили сырые данные неизменными байт-в-байт, из какого прошлого инцидента Вы могли бы выйти повторной обработкой?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: extract patterns — full vs incremental, push vs pull, API pagination, rate limits — getting data out without missing or duplicating it.",
                  "ru": "Теория: паттерны извлечения — полное против инкрементального, push против pull, пагинация API, лимиты запросов — забрать данные, не потеряв и не задвоив их."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: the raw/landing layer kept unchanged (replayability, schema drift), staging as the first cleaning step — immutability buys a redo button.",
                  "ru": "Теория: сырой/landing-слой хранится неизменным (повторяемость, дрейф схемы), staging как первый шаг очистки — неизменяемость даёт кнопку «повторить»."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: land a batch of raw records untouched and build one staging model that types and renames over them.",
                  "ru": "Практика: посадите пачку сырых записей нетронутыми и постройте одну модель staging, которая типизирует и переименовывает поверх них."
                }
              }
            ]
          },
          {
            "id": "w3d4",
            "track": "modeling",
            "title": {
              "en": "Layering: staging to marts",
              "ru": "Слои: от staging к витринам"
            },
            "warmup": {
              "en": "Why should the table an analyst queries never be the same table that first touches the source?",
              "ru": "Почему таблица, которую запрашивает аналитик, никогда не должна быть той же таблицей, что первой касается источника?"
            },
            "reflectPrompt": {
              "en": "Which of your existing models is doing three jobs at once, and where would you cut it apart?",
              "ru": "Какая из Ваших моделей делает три дела сразу, и где бы Вы её разрезали?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: separation of concerns in transformations (clean, reshape, serve), staging / intermediate / marts (medallion), DRY via intermediate models.",
                  "ru": "Теория: разделение ответственности в трансформациях (очистить, переформировать, подать), staging / intermediate / marts (medallion), DRY через промежуточные модели."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: why marts are business-facing and stable, naming and contracts per layer — the mart is a promise, not a scratchpad.",
                  "ru": "Теория: почему витрины обращены к бизнесу и стабильны, именование и контракты на каждом слое — витрина это обещание, а не черновик."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: classify your models into layers and refactor one fat model into a staging + intermediate + mart chain.",
                  "ru": "Практика: распределите свои модели по слоям и отрефакторьте одну раздутую модель в цепочку staging + intermediate + mart."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "dbt docs",
                  "ru": "dbt docs"
                },
                "note": {
                  "en": "Read \"How we structure our dbt projects\" — staging, intermediate, and marts layers and their responsibilities.",
                  "ru": "Прочитайте «How we structure our dbt projects» — слои staging, intermediate и marts и их зоны ответственности."
                }
              }
            ]
          },
          {
            "id": "w3d5",
            "track": "pipelines",
            "title": {
              "en": "Backfills & watermarks",
              "ru": "Бэкфилы и водяные знаки"
            },
            "warmup": {
              "en": "You need to reprocess last March without re-touching April — what does your job need to know to do that safely?",
              "ru": "Нужно переобработать прошлый март, не задевая апрель — что задача должна знать, чтобы сделать это безопасно?"
            },
            "reflectPrompt": {
              "en": "Where did you place the watermark, and what late data does that choice silently drop or delay?",
              "ru": "Где Вы поставили водяной знак, и какие поздние данные этот выбор молча отбрасывает или задерживает?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: high-water marks, incremental windows, idempotent backfills, safe history reprocessing — re-running a window must converge.",
                  "ru": "Теория: водяные знаки (high-water marks), инкрементальные окна, идемпотентные бэкфилы, безопасная переобработка истории — повтор окна должен сходиться."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: late and out-of-order data, the watermark trade-off (completeness vs latency) — how long you wait before closing a window.",
                  "ru": "Теория: поздние и неупорядоченные данные, компромисс водяного знака (полнота против задержки) — как долго ждать перед закрытием окна."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: implement a watermark-based load and backfill one past window without disturbing newer data.",
                  "ru": "Практика: реализуйте загрузку на основе водяного знака и бэкфильте одно прошлое окно, не задев более новые данные."
                }
              }
            ]
          },
          {
            "id": "w3d6",
            "track": "warehouse",
            "title": {
              "en": "Query performance",
              "ru": "Производительность запросов"
            },
            "warmup": {
              "en": "Two queries return the same rows but one scans 10x more data — what did the cheap one let the engine skip?",
              "ru": "Два запроса возвращают одни и те же строки, но один сканирует в 10 раз больше данных — что дешёвый позволил движку пропустить?"
            },
            "reflectPrompt": {
              "en": "After reading the plan, which cost driver surprised you most — and what would you change in the table layout, not the SQL?",
              "ru": "После чтения плана какой драйвер стоимости удивил Вас больше всего — и что бы Вы изменили в раскладке таблицы, а не в SQL?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: how an engine executes a query (scan, filter, join, aggregate), partition pruning, clustering — laying data out so the engine reads less.",
                  "ru": "Теория: как движок выполняет запрос (scan, filter, join, aggregate), отсечение партиций (partition pruning), кластеризация — раскладка данных так, чтобы движок читал меньше."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: reading a query plan / EXPLAIN, cost drivers (data scanned, shuffles, spilled joins) — finding the expensive step before you tune.",
                  "ru": "Теория: чтение плана запроса / EXPLAIN, драйверы стоимости (объём сканирования, shuffle, проливающиеся на диск join) — найти дорогой шаг до того, как тюнить."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: read the EXPLAIN of a slow query, then rewrite it so the engine prunes a partition.",
                  "ru": "Практика: прочитайте EXPLAIN медленного запроса, затем перепишите его так, чтобы движок отсекал партицию."
                }
              }
            ]
          },
          {
            "id": "w3rest",
            "track": "rest",
            "rest": true,
            "reflectPrompt": {
              "en": "This week you built ELT pipelines that survive re-runs — incremental models, layered transforms, watermarks, backfills. Which idea most changed how you would design a pipeline, and what is still fuzzy?",
              "ru": "На этой неделе Вы строили ELT-конвейеры, переживающие повторные запуски — инкрементальные модели, слоистые трансформации, водяные знаки, бэкфилы. Какая идея сильнее всего изменила Ваш подход к проектированию конвейера, и что осталось неясным?"
            }
          }
        ]
      },
      {
        "id": "g4",
        "title": {
          "en": "Orchestration",
          "ru": "Оркестрация"
        },
        "phase": "2",
        "items": [
          {
            "id": "w4d1",
            "track": "pipelines",
            "title": {
              "en": "Why orchestration",
              "ru": "Зачем нужна оркестрация"
            },
            "warmup": {
              "en": "Three steps must run in order, on a schedule, and survive failures. What does an orchestrator give you that cron does not?",
              "ru": "Три шага должны идти по порядку, по расписанию и переживать сбои. Что даёт оркестратор такого, чего нет у cron?"
            },
            "reflectPrompt": {
              "en": "An operator, a task, and a DAG are three different things. In your own words, where does the boundary between them sit?",
              "ru": "Оператор, задача (task) и DAG — три разные вещи. Своими словами: где проходит граница между ними?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: what an orchestrator adds over cron — dependencies, retries, observability, backfills; the DAG abstraction; tasks / operators / executors; the scheduler loop.",
                  "ru": "Теория: что оркестратор добавляет поверх cron — зависимости, повторы, наблюдаемость, бэкфилы; абстракция DAG; tasks / operators / executors; цикл scheduler'а."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: in Airflow's vocabulary, map each concept above to its concrete object — DAG, task, operator, executor.",
                  "ru": "Теория: в терминах Airflow сопоставьте каждое понятие выше с конкретным объектом — DAG, task, operator, executor."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: diagram a 3-task DAG (extract, transform, load) and draw the dependency edges.",
                  "ru": "Практика: нарисуйте схему DAG из трёх задач (extract, transform, load) и проведите рёбра зависимостей."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "Airflow docs",
                  "ru": "Документация Airflow"
                },
                "note": {
                  "en": "Core Concepts: DAGs, Tasks, Operators, and the Scheduler.",
                  "ru": "Core Concepts: DAGs, Tasks, Operators и Scheduler."
                }
              }
            ]
          },
          {
            "id": "w4d2",
            "track": "pipelines",
            "title": {
              "en": "Authoring DAGs",
              "ru": "Написание DAG"
            },
            "warmup": {
              "en": "A task fails once because an API blinked. Should the whole run die, or should the task retry first?",
              "ru": "Задача упала один раз, потому что API моргнул. Должен ли упасть весь run, или задаче стоит сначала повторить попытку?"
            },
            "reflectPrompt": {
              "en": "You set a schedule interval and a retry policy today. Which one would do more damage if you got it wrong, and why?",
              "ru": "Сегодня вы задали интервал расписания и политику повторов. Какой из них нанёс бы больше вреда при ошибке и почему?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: declaring dependencies; schedule intervals and the execution / data interval; retries and backoff — what each one controls.",
                  "ru": "Теория: объявление зависимостей; интервалы расписания и execution / data interval; retries и backoff — что чем управляется."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: task isolation and idempotency — why an operator must produce the same result when re-run on the same interval.",
                  "ru": "Теория: изоляция задач и идемпотентность — почему оператор должен давать тот же результат при повторе на том же интервале."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: write a small DAG with dependencies, a schedule interval, and a retries setting, then trigger one run.",
                  "ru": "Практика: напишите небольшой DAG с зависимостями, интервалом расписания и настройкой retries, затем запустите один run."
                }
              }
            ]
          },
          {
            "id": "w4d3",
            "track": "quality",
            "title": {
              "en": "Data-quality dimensions",
              "ru": "Измерения качества данных"
            },
            "warmup": {
              "en": "A load silently dropped half the rows last night; nobody noticed until the dashboard looked wrong. Which property of the data was violated?",
              "ru": "Вчера загрузка тихо потеряла половину строк, и никто не заметил, пока дашборд не выглядел странно. Какое свойство данных было нарушено?"
            },
            "reflectPrompt": {
              "en": "A warning gets ignored; a hard failure stops the line. Which checks in your pipeline deserve to be fatal, and which are just noise?",
              "ru": "Предупреждение игнорируют; жёсткое падение останавливает конвейер. Какие проверки в вашем пайплайне заслуживают быть фатальными, а какие — просто шум?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: the data-quality dimensions — completeness, validity, uniqueness, timeliness, consistency, accuracy — and what each one fails to catch.",
                  "ru": "Теория: измерения качества данных — полнота, валидность, уникальность, своевременность, согласованность, точность — и что каждое из них не ловит."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: checks as gates vs warnings; fail-fast vs quarantine; where each check belongs in a pipeline.",
                  "ru": "Теория: проверки как заслоны против предупреждений; fail-fast против карантина; где каждая проверка должна стоять в пайплайне."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: add one check that hard-fails the run on bad data, with an explicit threshold in its failure message.",
                  "ru": "Практика: добавьте одну проверку, которая жёстко роняет run на плохих данных, с явным порогом в сообщении об ошибке."
                }
              }
            ]
          },
          {
            "id": "w4d4",
            "track": "pipelines",
            "title": {
              "en": "Backfills & catchup",
              "ru": "Бэкфилы и catchup"
            },
            "warmup": {
              "en": "You add a DAG today with a start date two weeks ago. How many runs is the scheduler about to fire, and is that what you wanted?",
              "ru": "Вы добавляете DAG сегодня со start date две недели назад. Сколько run'ов сейчас запустит scheduler, и этого ли вы хотели?"
            },
            "reflectPrompt": {
              "en": "Idempotency is what makes a backfill safe. Where in your pipeline does re-running a task quietly double-count, and what would it take to fix that?",
              "ru": "Идемпотентность — то, что делает бэкфил безопасным. Где в вашем пайплайне повторный запуск задачи тихо удваивает данные, и что нужно, чтобы это исправить?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: catchup and execution-date-driven runs; why each run must be idempotent and parameterized by its own interval; reprocessing vs duplicating.",
                  "ru": "Теория: catchup и run'ы, управляемые execution date; почему каждый run должен быть идемпотентным и параметризован своим интервалом; переобработка против дублирования."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: max_active_runs and concurrency — what they bound and how they protect the source and the warehouse during a backfill.",
                  "ru": "Теория: max_active_runs и concurrency — что они ограничивают и как защищают источник и хранилище во время бэкфила."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: run a catchup backfill, then prove one task is safe to re-run (identical row count or checksum on the second run).",
                  "ru": "Практика: запустите catchup-бэкфил, затем докажите, что одна задача безопасна для повтора (тот же row count или контрольная сумма при втором запуске)."
                }
              }
            ]
          },
          {
            "id": "w4d5",
            "track": "quality",
            "title": {
              "en": "Data contracts",
              "ru": "Контракты данных"
            },
            "warmup": {
              "en": "An upstream team renames a column and ships it without telling you. Where do you want that to blow up — at ingestion, or three tables downstream?",
              "ru": "Команда выше по потоку переименовала колонку и выкатила это, не предупредив вас. Где вы хотите, чтобы это взорвалось — на ингесте или через три таблицы вниз по потоку?"
            },
            "reflectPrompt": {
              "en": "A data contract pushes the cost of bad data onto the producer instead of you. Which of your sources most needs one, and why has it survived without it so far?",
              "ru": "Контракт данных перекладывает цену плохих данных на поставщика, а не на вас. Какому из ваших источников он нужнее всего и почему он до сих пор обходился без него?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: schema-on-write vs schema-on-read; a contract as an agreement between producer and consumer — what each side promises.",
                  "ru": "Теория: schema-on-write против schema-on-read; контракт как соглашение между поставщиком и потребителем — что обещает каждая сторона."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: schema enforcement and evolution — compatible vs breaking changes; rejecting vs quarantining bad records.",
                  "ru": "Теория: проверка и эволюция схемы — совместимые против ломающих изменений; отклонение против карантина плохих записей."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: define an executable contract for one source (pydantic or JSON Schema) and feed it a violating record to confirm it is rejected.",
                  "ru": "Практика: опишите исполняемый контракт для одного источника (pydantic или JSON Schema) и подайте нарушающую запись, чтобы убедиться, что она отклонена."
                }
              }
            ]
          },
          {
            "id": "w4d6",
            "track": "pipelines",
            "title": {
              "en": "Orchestrating dbt & sensors",
              "ru": "Оркестрация dbt и сенсоры"
            },
            "warmup": {
              "en": "Your dbt models are only as fresh as the data under them. What guarantees dbt does not run on yesterday's load?",
              "ru": "Ваши модели dbt свежи ровно настолько, насколько свежи данные под ними. Что гарантирует, что dbt не запустится на вчерашней загрузке?"
            },
            "reflectPrompt": {
              "en": "You connected ingestion and dbt into one DAG today. What now lives in the dependency graph that used to live only in someone's head or a runbook?",
              "ru": "Сегодня вы соединили ингест и dbt в один DAG. Что теперь живёт в графе зависимостей, а раньше жило только в чьей-то голове или в runbook'е?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: composing ingestion and transformation in one DAG; where dbt runs in the schedule; decoupling tasks via data availability.",
                  "ru": "Теория: объединение ингеста и трансформации в одном DAG; где dbt стоит в расписании; развязка задач через доступность данных."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: sensors vs explicit dependencies — when to wait for upstream data to land vs wire a direct edge, and the cost of each.",
                  "ru": "Теория: сенсоры против явных зависимостей — когда ждать прихода данных против прямого ребра, и цена каждого варианта."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: add a dbt run task downstream of ingestion plus a sensor so dbt starts only after fresh data lands.",
                  "ru": "Практика: добавьте задачу dbt run ниже по потоку от ингеста плюс сенсор, чтобы dbt стартовал только после прихода свежих данных."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "dbt docs",
                  "ru": "Документация dbt"
                },
                "note": {
                  "en": "How dbt run and dbt build execute models, so you know what the orchestrated task is actually invoking.",
                  "ru": "Как dbt run и dbt build исполняют модели, чтобы понимать, что именно вызывает оркестрируемая задача."
                }
              }
            ]
          },
          {
            "id": "w4rest",
            "track": "rest",
            "rest": true,
            "reflectPrompt": {
              "en": "This week you moved from running steps by hand to having a scheduler run them — with dependencies, retries, backfills, quality gates, and contracts. Where do you still trust your own memory more than the pipeline, and what would it take to trust the orchestration instead?",
              "ru": "На этой неделе вы перешли от запуска шагов вручную к тому, что их запускает scheduler — с зависимостями, повторами, бэкфилами, проверками качества и контрактами. Где вы всё ещё доверяете своей памяти больше, чем пайплайну, и что нужно, чтобы доверять оркестрации вместо этого?"
            }
          }
        ]
      },
      {
        "id": "g5",
        "title": {
          "en": "Quality, scale & capstone",
          "ru": "Качество, масштаб и капстоун"
        },
        "phase": "2",
        "items": [
          {
            "id": "w5d1",
            "track": "quality",
            "title": {
              "en": "Data observability",
              "ru": "Наблюдаемость данных"
            },
            "warmup": {
              "en": "If a table silently stopped updating three days ago, what would tell you before a stakeholder does?",
              "ru": "Если таблица тихо перестала обновляться три дня назад — что сообщит Вам об этом раньше, чем стейкхолдер?"
            },
            "reflectPrompt": {
              "en": "Which of your current tables could break silently for days — and which observability pillar would have caught it first?",
              "ru": "Какая из ваших нынешних таблиц могла бы молча ломаться несколько дней — и какой столп наблюдаемости поймал бы это первым?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: the five observability pillars (freshness, volume, schema, distribution, lineage); data SLAs vs SLOs; detect, triage, resolve as one loop.",
                  "ru": "Теория: пять столпов наблюдаемости (свежесть, объём, схема, распределение, происхождение данных); SLA против SLO для данных; обнаружение, сортировка, устранение как единый цикл."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: alerting design — thresholds vs anomaly detection, severity levels, avoiding alert fatigue.",
                  "ru": "Теория: проектирование оповещений — пороги против выявления аномалий, уровни критичности, борьба с усталостью от оповещений."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: add a freshness check and a volume check to one table, plus one alert condition.",
                  "ru": "Практика: добавьте к одной таблице проверку свежести и проверку объёма плюс одно условие оповещения."
                }
              }
            ]
          },
          {
            "id": "w5d2",
            "track": "quality",
            "title": {
              "en": "File formats & storage",
              "ru": "Форматы файлов и хранение"
            },
            "warmup": {
              "en": "A query reads two of forty columns — why does the file format decide how much disk it touches?",
              "ru": "Запрос читает два столбца из сорока — почему именно формат файла определяет, сколько диска он затронет?"
            },
            "reflectPrompt": {
              "en": "Where in your stack is data still moving as CSV or JSON, and what would columnar storage actually cost or save there?",
              "ru": "Где в вашем стеке данные всё ещё ходят как CSV или JSON, и что на самом деле даст или будет стоить там колоночное хранилище?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: row vs columnar on disk (CSV/JSON vs Parquet/ORC/Avro); embedded schema and schema evolution; compression and encoding; why format dictates scan cost.",
                  "ru": "Теория: строчное против колоночного на диске (CSV/JSON против Parquet/ORC/Avro); встроенная схема и эволюция схемы; сжатие и кодирование; почему формат определяет стоимость сканирования."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: when each format fits — Avro for row-by-row/write-heavy, Parquet/ORC for analytical reads, CSV/JSON for interchange only.",
                  "ru": "Теория: когда какой формат уместен — Avro для построчной и интенсивной записи, Parquet/ORC для аналитического чтения, CSV/JSON только для обмена."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: write the same dataset to CSV and Parquet, then compare on-disk size and time to read two columns.",
                  "ru": "Практика: запишите один и тот же датасет в CSV и в Parquet, затем сравните размер на диске и время чтения двух столбцов."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "Apache Parquet docs",
                  "ru": "Документация Apache Parquet"
                },
                "note": {
                  "en": "The file-format overview — how row groups and column chunks let a reader skip unread columns.",
                  "ru": "Обзор формата файла — как группы строк и фрагменты столбцов позволяют читателю пропускать непрочитанные столбцы."
                }
              }
            ]
          },
          {
            "id": "w5d3",
            "track": "quality",
            "title": {
              "en": "Distributed processing",
              "ru": "Распределённая обработка"
            },
            "warmup": {
              "en": "Why does a Spark transformation run nothing until you call an action?",
              "ru": "Почему трансформация в Spark ничего не выполняет, пока Вы не вызовете действие?"
            },
            "reflectPrompt": {
              "en": "Honestly: how often does your data exceed what a warehouse handles well — and how often is 'use Spark' resume-driven?",
              "ru": "Честно: как часто ваши данные превышают то, с чем хорошо справляется хранилище — и как часто «возьмём Spark» — это строчка в резюме?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: why scale-out (data bigger than one machine); the MapReduce idea; the Spark model — DataFrame, lazy DAG, transformations vs actions, shuffles, partitions.",
                  "ru": "Теория: зачем масштабирование вширь (данные больше одной машины); идея MapReduce; модель Spark — DataFrame, ленивый DAG, трансформации против действий, перемешивания (shuffles), партиции."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Theory: the warehouse-vs-Spark decision — what tips it toward distributed compute, what keeps SQL on a warehouse simpler and cheaper.",
                  "ru": "Теория: решение «хранилище против Spark» — что склоняет к распределённым вычислениям, а что оставляет SQL в хранилище проще и дешевле."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Practice: for two scenarios (a 5 GB nightly aggregation; a 4 TB raw-log reprocess with heavy Python), decide warehouse vs Spark and justify each in one line.",
                  "ru": "Практика: для двух сценариев (ночная агрегация на 5 ГБ; переобработка 4 ТБ сырых логов с тяжёлым Python) решите «хранилище или Spark» и обоснуйте каждый одной строкой."
                }
              }
            ],
            "resources": [
              {
                "label": {
                  "en": "Apache Spark docs",
                  "ru": "Документация Apache Spark"
                },
                "note": {
                  "en": "The DataFrame programming guide on lazy evaluation and the transformation/action split.",
                  "ru": "Руководство по DataFrame о ленивых вычислениях и разделении на трансформации и действия."
                }
              }
            ]
          },
          {
            "id": "w5d4",
            "track": "pipelines",
            "title": {
              "en": "Data lakes & file layout",
              "ru": "Озёра данных и раскладка файлов"
            },
            "warmup": {
              "en": "A query filters on one day but scans a year of files — what about the layout let that happen?",
              "ru": "Запрос фильтрует по одному дню, но сканирует файлы за год — что в раскладке это допустило?"
            },
            "reflectPrompt": {
              "en": "Partitioning trades query speed for more, smaller files. Where is your line — what would make you stop adding partition keys?",
              "ru": "Партиционирование меняет скорость запроса на большее число мелких файлов. Где ваша граница — что заставит Вас перестать добавлять ключи партиционирования?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Theory: lake vs warehouse vs lakehouse; partitioning strategy and partition pruning on a lake; the small-files problem and compaction; open table formats (Iceberg / Delta) at a high level.",
                  "ru": "Теория: озеро против хранилища против lakehouse; стратегия партиционирования и partition pruning на озере; проблема мелких файлов и компакция; открытые табличные форматы (Iceberg / Delta) на высоком уровне."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Practice: partition a dataset by date on disk and confirm a single-day read opens only that day's files.",
                  "ru": "Практика: разложите датасет по дате на диске и убедитесь, что чтение за один день открывает только файлы этого дня."
                }
              }
            ]
          },
          {
            "id": "w5d5",
            "track": "quality",
            "title": {
              "en": "Capstone 1 — design",
              "ru": "Капстоун 1 — проектирование"
            },
            "warmup": {
              "en": "Before any code: what is the one question this pipeline's output must answer reliably?",
              "ru": "Ещё до кода: на какой один вопрос результат этого пайплайна должен надёжно отвечать?"
            },
            "reflectPrompt": {
              "en": "Where is your design most likely to break in production — and did you specify a test or check that catches exactly that?",
              "ru": "Где ваш дизайн скорее всего сломается в продакшене — и заложили ли Вы тест или проверку, которая ловит именно это?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Write a one-page design / DAG sketch of ingest -> raw -> warehouse -> dbt marts -> tests, naming each stage's input, output, and trigger.",
                  "ru": "Напишите одностраничный дизайн / эскиз DAG для ingest -> raw -> warehouse -> dbt marts -> tests, указав для каждой стадии вход, выход и триггер."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Define the final marts data contract: column names, types, nullability, primary key, and freshness expectation.",
                  "ru": "Опишите контракт данных финальных витрин: имена столбцов, типы, допустимость NULL, первичный ключ и ожидание по свежести."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "List the tests the pipeline must pass and name the stage each one runs at.",
                  "ru": "Перечислите тесты, которые пайплайн обязан проходить, и укажите, на какой стадии выполняется каждый."
                }
              }
            ]
          },
          {
            "id": "w5d6",
            "track": "quality",
            "title": {
              "en": "Capstone 2 — ship",
              "ru": "Капстоун 2 — запуск"
            },
            "warmup": {
              "en": "If the 3 a.m. run fails, what does the next person need on hand to fix it without you?",
              "ru": "Если запуск в 3 часа ночи упадёт — что должно быть под рукой у следующего, чтобы починить без Вас?"
            },
            "reflectPrompt": {
              "en": "You shipped it end to end. Which single step was most fragile, and what would you harden first if it had to run unattended for a month?",
              "ru": "Вы довели его до конца. Какой один шаг оказался самым хрупким, и что бы Вы укрепили первым, если бы это работало без присмотра месяц?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Orchestrate the pipeline end to end: one DAG runs the stages and dbt in order, and one trigger produces the populated mart from a clean start.",
                  "ru": "Оркестрируйте пайплайн от начала до конца: один DAG прогоняет стадии и dbt по порядку, и один запуск с чистого состояния выдаёт заполненную витрину."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Add freshness and volume quality checks that fail the run loudly when the mart is stale or the row count is out of range.",
                  "ru": "Добавьте проверки качества на свежесть и объём, которые громко роняют запуск, когда витрина устарела или число строк вне диапазона."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Write a one-page runbook: how to run it, how to backfill a past date, and the first three things to check when it fails.",
                  "ru": "Напишите одностраничный runbook: как запустить, как сделать бэкафилл за прошлую дату и первые три вещи для проверки при падении."
                }
              }
            ]
          },
          {
            "id": "w5rest",
            "track": "rest",
            "rest": true,
            "reflectPrompt": {
              "en": "Five weeks in, you built a real pipeline end to end. Comparing how you thought about data on day one with how you think now — what is the biggest shift, and which gap do you most want to close next?",
              "ru": "Спустя пять недель Вы построили настоящий пайплайн от начала до конца. Сравнивая, как Вы думали о данных в первый день и как думаете сейчас — какой сдвиг самый большой и какой пробел Вы больше всего хотите закрыть следующим?"
            }
          }
        ]
      }
    ]
  };
  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);
  if (typeof module !== 'undefined' && module.exports) module.exports = pack;
})(typeof window !== 'undefined' ? window : globalThis);
