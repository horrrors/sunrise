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
                  "en": "Create a project skeleton — a fresh venv, a pyproject.toml, a src/ package folder, and a README — and commit it as the first commit.",
                  "ru": "Создай каркас проекта — свежий venv, pyproject.toml, папку-пакет src/ и README — и закоммить это первым коммитом."
                },
                "guidance": {
                  "en": "A good layout keeps importable code under src/ and a single entry point separate from library logic, so the same functions can be both run and imported by tests.",
                  "ru": "Хорошая раскладка держит импортируемый код в src/, а единственную точку входа — отдельно от библиотечной логики, чтобы одни и те же функции можно было и запускать, и импортировать в тестах."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Take one notebook cell that loads and transforms data and rewrite it as a main.py with a __main__ guard and an argparse flag (e.g. --input PATH), then run it from the terminal.",
                  "ru": "Возьми одну ячейку ноутбука, которая загружает и преобразует данные, и перепиши её в main.py с защитой __main__ и флагом argparse (например, --input PATH), затем запусти из терминала."
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
              "ru": "Твой отчётный запрос сканирует миллионы строк — почему база, в которую пишет приложение, ненавидит такую нагрузку?"
            },
            "reflectPrompt": {
              "en": "Which normalization rule that helps an OLTP system actively hurts an analytical one, and why?",
              "ru": "Какое правило нормализации, полезное для OLTP, активно вредит аналитической системе, и почему?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Classify 4-5 sample schemas (e.g. an orders table, a wide event log, a normalized customer/address pair, a star-shaped report table) as OLTP or OLAP, with one line per schema justifying the call by access pattern and write rate.",
                  "ru": "Классифицируй 4-5 примерных схем (например, таблицу заказов, широкий журнал событий, нормализованную пару customer/address, отчётную таблицу-звезду) как OLTP или OLAP, по одной строке на схему, обосновывая решение паттерном доступа и частотой записи."
                },
                "guidance": {
                  "en": "Anchor each verdict in concrete signals — many small writes vs. large scans, point lookups vs. aggregations — not just row count.",
                  "ru": "Привязывай каждый вердикт к конкретным признакам — много мелких записей против больших сканов, точечные выборки против агрегаций — а не только к числу строк."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Take a deliberately denormalized table (repeating groups and transitive dependencies) and split it into 3NF tables, naming the dependency you removed at each step.",
                  "ru": "Возьми намеренно денормализованную таблицу (повторяющиеся группы и транзитивные зависимости) и разбей её на таблицы 3NF, называя на каждом шаге устранённую зависимость."
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
              "ru": "Что коллега узнаёт из истории твоих коммитов, чего не узнать из одного лишь финального кода?"
            },
            "reflectPrompt": {
              "en": "Reading your own diff before pushing — what would a reviewer have flagged that you almost shipped?",
              "ru": "Читая собственный diff перед push — что отметил бы ревьюер из того, что ты чуть не отправил?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Add a .gitignore that excludes the venv, __pycache__, and any local data files, then create a feature branch off main for the week-1 script.",
                  "ru": "Добавь .gitignore, исключающий venv, __pycache__ и любые локальные файлы данных, затем создай feature-ветку от main для скрипта недели 1."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Make exactly 2 atomic commits on that branch — each self-contained, with a message stating what changed and why (not just \"wip\").",
                  "ru": "Сделай ровно 2 атомарных коммита в этой ветке — каждый самодостаточный, с сообщением о том, что изменилось и зачем (а не просто «wip»)."
                },
                "guidance": {
                  "en": "Atomic means the repo builds and the tests pass at that commit, and the diff tells one story — splitting unrelated changes into separate commits.",
                  "ru": "Атомарный значит, что на этом коммите проект собирается и тесты проходят, а diff рассказывает одну историю — несвязанные изменения разнесены по разным коммитам."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Run git diff main against your branch and write one line reviewing your own change as if you were the reviewer.",
                  "ru": "Запусти git diff main против своей ветки и напиши одну строку с ревью собственного изменения, будто ты ревьюер."
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
              "en": "In a sales report, which numbers do you sum and which ones do you slice by? That split is facts vs. dimensions.",
              "ru": "В отчёте по продажам какие числа ты суммируешь, а по каким — режешь? Это и есть деление на факты и измерения."
            },
            "reflectPrompt": {
              "en": "How would the grain you chose change which questions the fact table can and cannot answer?",
              "ru": "Как выбранная тобой grain меняет то, на какие вопросы fact-таблица может и не может ответить?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "State the grain of an orders fact table in exactly one sentence (\"one row per ___\"), choosing between order header and order line.",
                  "ru": "Сформулируй grain fact-таблицы заказов ровно одним предложением («одна строка на ___»), выбрав между шапкой заказа и строкой заказа."
                },
                "guidance": {
                  "en": "A precise grain names the single business event a row represents; \"one row per order line\" and \"one row per order\" give very different fact tables.",
                  "ru": "Точная grain называет единственное бизнес-событие, которое представляет строка; «одна строка на строку заказа» и «одна строка на заказ» дают очень разные fact-таблицы."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "List every dimension that the orders fact joins to (e.g. date, customer, product, store) and mark which measures live on the fact itself.",
                  "ru": "Перечисли все измерения, к которым присоединяется fact заказов (например, date, customer, product, store), и отметь, какие меры живут в самом факте."
                }
              }
            ]
          },
          {
            "id": "w1d5",
            "track": "python",
            "title": {
              "en": "pytest basics",
              "ru": "Основы pytest"
            },
            "warmup": {
              "en": "Why is a pure transform function — same input, same output, no I/O — the easiest thing in your pipeline to test?",
              "ru": "Почему чистая функция-преобразование — тот же вход, тот же выход, без I/O — самое простое для тестирования звено пайплайна?"
            },
            "reflectPrompt": {
              "en": "Writing the failing test first — what did seeing it fail confirm that a passing test never would have?",
              "ru": "Написав сначала падающий тест — что подтвердило его падение, чего проходящий тест никогда бы не показал?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Write 2-3 pytest cases for a small pure transform function from your week-1 script (e.g. parsing a row, cleaning a value), covering a normal input and an edge case.",
                  "ru": "Напиши 2-3 теста pytest для маленькой чистой функции-преобразования из скрипта недели 1 (например, разбор строки, очистка значения), покрыв обычный вход и граничный случай."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Add one test that fails first (red), then change the function so it passes (green), and confirm the whole suite is green with one pytest run.",
                  "ru": "Добавь один тест, который сначала падает (red), затем измени функцию так, чтобы он прошёл (green), и убедись, что весь набор зелёный за один запуск pytest."
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
                  "en": "Read the \"Get Started\" page — how pytest discovers test files/functions and how plain assert statements work.",
                  "ru": "Прочитай страницу «Get Started» — как pytest находит тестовые файлы/функции и как работают обычные assert."
                }
              }
            ]
          },
          {
            "id": "w1d6",
            "track": "modeling",
            "title": {
              "en": "Design a star schema",
              "ru": "Спроектируй star schema"
            },
            "warmup": {
              "en": "Recall: what makes a dimension \"conformed\" — and why does the warehouse care?",
              "ru": "Вспомни: что делает измерение «conformed» — и почему это важно для хранилища?"
            },
            "reflectPrompt": {
              "en": "Where in your star did you have to choose between a clean model and an easy query — and how did you decide?",
              "ru": "Где в своей звезде тебе пришлось выбирать между чистой моделью и удобным запросом — и как ты решил?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Sketch the full orders star: the fact table at its chosen grain in the center, surrounded by its conformed dimensions, with foreign-key lines drawn.",
                  "ru": "Нарисуй полную звезду заказов: fact-таблицу на выбранной grain в центре, окружённую conformed-измерениями, с проведёнными линиями внешних ключей."
                },
                "guidance": {
                  "en": "A strong sketch shows the fact holding only foreign keys plus numeric measures, and each dimension carrying its descriptive attributes plus a surrogate key.",
                  "ru": "Сильный набросок показывает, что в факте только внешние ключи плюс числовые меры, а каждое измерение несёт свои описательные атрибуты плюс surrogate key."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Write the CREATE TABLE DDL for the orders fact and for one dimension (e.g. dim_customer), with surrogate keys, foreign keys, and explicit column types.",
                  "ru": "Напиши DDL CREATE TABLE для fact заказов и для одного измерения (например, dim_customer), с surrogate-ключами, внешними ключами и явными типами колонок."
                }
              }
            ]
          },
          {
            "id": "w1rest",
            "track": "rest",
            "rest": true,
            "reflectPrompt": {
              "en": "Looking back at the week: which idea changed how you'll structure your next data project — the script discipline, the model thinking, or the testing habit?",
              "ru": "Оглядываясь на неделю: какая идея изменила то, как ты будешь строить следующий data-проект — дисциплина скриптов, мышление моделями или привычка тестировать?"
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
              "en": "Type hints & records",
              "ru": "Type hints и типизированные записи"
            },
            "warmup": {
              "en": "Recall: what is the practical difference between a dict row and a typed record?",
              "ru": "Вспомни: в чём практическая разница между строкой-dict и типизированной записью?"
            },
            "reflectPrompt": {
              "en": "What did mypy catch today that would otherwise have shipped to production unnoticed?",
              "ru": "Что сегодня поймал mypy, что иначе уехало бы в прод незамеченным?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Add type hints to every function signature in your week-1 script, and model one row as a dataclass (or a pydantic model) instead of a raw dict.",
                  "ru": "Добавь type hints к каждой сигнатуре функции в скрипте из недели 1 и опиши одну строку как dataclass (или модель pydantic) вместо голого dict."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Run mypy in strict mode on the script and fix every error it reports until it passes clean.",
                  "ru": "Запусти mypy в строгом режиме на скрипте и почини все ошибки, пока проверка не пройдёт чисто."
                },
                "guidance": {
                  "en": "Resist silencing errors with Any or type: ignore. If mypy complains, it usually found a real shape mismatch (an unhandled Optional, a wrong return type) — fix the data flow, not the annotation.",
                  "ru": "Не глуши ошибки через Any или type: ignore. Если mypy ругается, обычно он нашёл реальное несоответствие формы (необработанный Optional, неверный return type) — чини поток данных, а не аннотацию."
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
              "en": "Recall: in an analytical query, do you read most columns or most rows?",
              "ru": "Вспомни: в аналитическом запросе ты читаешь большинство колонок или большинство строк?"
            },
            "reflectPrompt": {
              "en": "Where in your past analyst work did you fight a row-store that a columnar warehouse would have made trivial?",
              "ru": "Где в прошлой аналитической работе ты боролся с row-store, который колоночное хранилище сделало бы тривиальным?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Write a half-page note: name three workloads where columnar storage wins over a row-oriented OLTP store like Postgres, and explain the mechanism (column pruning, compression, vectorized scans).",
                  "ru": "Напиши заметку на полстраницы: назови три нагрузки, где колоночное хранилище выигрывает у строкового OLTP-хранилища вроде Postgres, и объясни механизм (отсечение колонок, сжатие, векторные сканы)."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Given two queries over the same table — one selecting 2 columns, one selecting * — write down which scans less data and which filter on the partition/clustering key avoids a full scan, with the reason for each.",
                  "ru": "Даны два запроса по одной таблице — один выбирает 2 колонки, другой выбирает *. Запиши, какой просканирует меньше данных и какой фильтр по ключу партиционирования/кластеризации избежит полного скана, с обоснованием для каждого."
                },
                "guidance": {
                  "en": "A strong answer separates two independent levers: columnar layout cuts data by which columns you touch; partitioning/clustering cuts it by which rows survive the filter. SELECT * defeats the first lever; a filter that doesn't match the partition key defeats the second.",
                  "ru": "Сильный ответ разделяет два независимых рычага: колоночная раскладка режет данные по тому, какие колонки ты трогаешь; партиционирование/кластеризация — по тому, какие строки переживут фильтр. SELECT * убивает первый рычаг; фильтр не по ключу партиции — второй."
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
              "en": "Recall: when a customer changes city, should the old fact rows keep the old city or the new one?",
              "ru": "Вспомни: когда клиент сменил город, старые строки фактов должны хранить старый город или новый?"
            },
            "reflectPrompt": {
              "en": "Which of your real-world dimensions actually need history (SCD type 2), and which are fine to just overwrite (type 1)?",
              "ru": "Какие из твоих реальных измерений действительно нуждаются в истории (SCD type 2), а какие можно просто перезаписывать (type 1)?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Design an SCD type-2 dimension table: write out its columns including a surrogate key, the natural/business key, effective-from and effective-to dates, and a current-flag.",
                  "ru": "Спроектируй таблицу измерения SCD type 2: выпиши её колонки, включая surrogate key, натуральный/бизнес-ключ, даты effective-from и effective-to и флаг текущей версии."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Write the rule, in plain words, for what happens to the existing row and what new row is inserted when a tracked attribute changes — and contrast it with what SCD type 1 would do instead.",
                  "ru": "Сформулируй словами правило: что происходит с существующей строкой и какая новая строка вставляется при изменении отслеживаемого атрибута — и противопоставь это тому, что сделал бы SCD type 1."
                },
                "guidance": {
                  "en": "A correct type-2 rule closes the old row (set effective-to and clear current-flag) AND inserts a new row with a fresh surrogate key — never mutate the business key. The point of the surrogate key is that one business entity can own many dimension rows over time.",
                  "ru": "Корректное правило type 2 закрывает старую строку (проставить effective-to и снять current-flag) И вставляет новую строку с новым surrogate key — бизнес-ключ никогда не мутируется. Смысл surrogate key в том, что одна бизнес-сущность владеет многими строками измерения во времени."
                }
              }
            ]
          },
          {
            "id": "w2d4",
            "track": "warehouse",
            "title": {
              "en": "dbt: first model",
              "ru": "dbt: первая модель"
            },
            "warmup": {
              "en": "Recall: what is the difference between a source you read from and a model you build?",
              "ru": "Вспомни: чем источник, из которого читаешь, отличается от модели, которую строишь?"
            },
            "reflectPrompt": {
              "en": "How does ref() change the way you think about dependencies compared to hand-written CREATE TABLE scripts?",
              "ru": "Как ref() меняет твой взгляд на зависимости по сравнению с рукописными скриптами CREATE TABLE?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Scaffold a dbt project (dbt init), point it at your warehouse, and declare your raw table as a source in a sources YAML file.",
                  "ru": "Создай dbt-проект (dbt init), направь его на своё хранилище и объяви свою сырую таблицу как source в YAML-файле sources."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Build one staging model that selects from the source via source() and a downstream model that selects from it via ref(); run dbt run and confirm both materialize.",
                  "ru": "Построй одну staging-модель, которая читает из источника через source(), и нижестоящую модель, которая читает из неё через ref(); запусти dbt run и убедись, что обе материализуются."
                },
                "guidance": {
                  "en": "Use source() only for raw inputs you don't manage and ref() for everything dbt builds — that's what lets dbt infer the DAG. Hardcode a table name instead and notice you lose lineage and build ordering.",
                  "ru": "Используй source() только для сырых входов, которыми ты не управляешь, и ref() для всего, что строит dbt — именно это позволяет dbt вывести DAG. Захардкодь имя таблицы вместо этого и заметь, что теряешь lineage и порядок сборки."
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
                  "en": "Build your first models — sources, ref(), and materializations",
                  "ru": "Build your first models — про sources, ref() и materializations"
                }
              }
            ]
          },
          {
            "id": "w2d5",
            "track": "python",
            "title": {
              "en": "Packaging & reproducible env",
              "ru": "Упаковка и воспроизводимое окружение"
            },
            "warmup": {
              "en": "Recall: why does \"it works on my machine\" happen, in dependency terms?",
              "ru": "Вспомни: почему случается «у меня работает», если говорить языком зависимостей?"
            },
            "reflectPrompt": {
              "en": "If a teammate cloned your repo today, what exact set of commands gets them a working environment — and did anything surprise you?",
              "ru": "Если коллега склонирует твой репозиторий сегодня, какой точный набор команд даст ему рабочее окружение — и что-то тебя удивило?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Add a pyproject.toml that declares your project and its direct dependencies, replacing any loose requirements you had before.",
                  "ru": "Добавь pyproject.toml, который описывает твой проект и его прямые зависимости, заменив прежние разрозненные requirements."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Pin the dependency versions (a lockfile or explicit versions), then delete your venv, create a fresh one, install from scratch, and confirm the week-1 script still runs.",
                  "ru": "Зафиксируй версии зависимостей (lockfile или явные версии), затем удали свой venv, создай новый, установи всё с нуля и убедись, что скрипт из недели 1 всё ещё работает."
                },
                "guidance": {
                  "en": "Pinning direct deps isn't enough for true reproducibility — a transitive dependency can still drift. A lockfile captures the full resolved graph; that's the difference between \"declared\" and \"reproducible\".",
                  "ru": "Фиксации прямых зависимостей мало для настоящей воспроизводимости — транзитивная зависимость всё ещё может уплыть. Lockfile фиксирует весь разрешённый граф; в этом разница между «объявлено» и «воспроизводимо»."
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
                  "en": "Packaging Python Projects — the pyproject.toml tutorial",
                  "ru": "Packaging Python Projects — туториал по pyproject.toml"
                }
              }
            ]
          },
          {
            "id": "w2d6",
            "track": "warehouse",
            "title": {
              "en": "dbt tests & docs",
              "ru": "dbt-тесты и документация"
            },
            "warmup": {
              "en": "Recall: what is the cheapest data-quality bug to catch — at write time or three dashboards downstream?",
              "ru": "Вспомни: какой баг качества данных дешевле всего поймать — при записи или через три дашборда ниже по потоку?"
            },
            "reflectPrompt": {
              "en": "Which generic tests would have caught a real data incident from your analyst days, and where do they fall short?",
              "ru": "Какие generic-тесты поймали бы реальный инцидент с данными из твоей аналитической практики и где их не хватает?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Add generic schema tests to your staging model: unique and not_null on its key, plus a relationships test pointing a foreign key at its parent model.",
                  "ru": "Добавь generic schema-тесты к своей staging-модели: unique и not_null на её ключ плюс relationships-тест, связывающий внешний ключ с родительской моделью."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Run dbt test, then deliberately introduce a duplicate or a broken reference, re-run, and write down how dbt reports the failing rows.",
                  "ru": "Запусти dbt test, затем намеренно внеси дубликат или сломанную ссылку, перезапусти и запиши, как dbt сообщает о падающих строках."
                },
                "guidance": {
                  "en": "Generic tests cover shape (uniqueness, nullability, referential integrity); a singular test is a custom SQL query that returns the offending rows. Reach for a singular test when the rule is business-specific, like \"revenue is never negative\".",
                  "ru": "Generic-тесты покрывают форму (уникальность, заполненность, ссылочную целостность); singular-тест — это кастомный SQL-запрос, возвращающий нарушающие строки. Бери singular-тест, когда правило бизнес-специфичное, например «выручка никогда не отрицательна»."
                }
              }
            ]
          },
          {
            "id": "w2rest",
            "track": "rest",
            "rest": true,
            "reflectPrompt": {
              "en": "This week you moved from notebooks to typed code and from queries to a modeled, tested warehouse. Which single habit — type checking, pinned environments, or testable models — will most change how you ship, and why?",
              "ru": "На этой неделе ты перешёл от ноутбуков к типизированному коду и от запросов к смоделированному, протестированному хранилищу. Какая одна привычка — проверка типов, зафиксированные окружения или тестируемые модели — сильнее всего изменит то, как ты выкатываешь, и почему?"
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
              "en": "If tonight's load fires twice by accident, does the table stay correct?",
              "ru": "Если сегодняшняя загрузка случайно сработает дважды, останется ли таблица корректной?"
            },
            "reflectPrompt": {
              "en": "Which of your current loads would break on a re-run, and why did 'load once' feel safe enough until now?",
              "ru": "Какая из ваших текущих загрузок сломалась бы при повторном запуске, и почему до сих пор казалось, что грузить ровно один раз — достаточно надёжно?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Take a load that does a blind INSERT and rewrite it as a merge/upsert (or delete-then-insert) keyed on a stable business key.",
                  "ru": "Возьмите загрузку, которая делает слепой INSERT, и перепишите её как merge/upsert (или delete-then-insert) по устойчивому бизнес-ключу."
                },
                "guidance": {
                  "en": "Idempotency prevents duplicate rows after a retry: a job that crashes mid-load and re-runs (or fires twice from the scheduler) must converge to the same final state, not accumulate copies.",
                  "ru": "Идемпотентность защищает от дублей после повторного запуска: задача, упавшая на середине и перезапущенная (или дважды сработавшая в планировщике), должна приходить к тому же конечному состоянию, а не накапливать копии."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Run the rewritten load twice in a row against the same source and confirm the row count and key values are identical after both runs.",
                  "ru": "Запустите переписанную загрузку дважды подряд на том же источнике и убедитесь, что число строк и значения ключей одинаковы после обоих запусков."
                }
              }
            ]
          },
          {
            "id": "w3d2",
            "track": "warehouse",
            "title": {
              "en": "Incremental models & snapshots",
              "ru": "Инкрементальные модели и snapshots"
            },
            "warmup": {
              "en": "Yesterday's data hasn't changed — so why rebuild the whole table tonight?",
              "ru": "Вчерашние данные не менялись — так зачем перестраивать всю таблицу сегодня ночью?"
            },
            "reflectPrompt": {
              "en": "When does an incremental model save real time, and when does its added complexity cost more than the full refresh it replaces?",
              "ru": "Когда инкрементальная модель действительно экономит время, а когда её усложнение стоит дороже, чем полный пересчёт, который она заменяет?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Convert one full-refresh dbt model to incremental: add the materialization config and an is_incremental() block that filters to rows newer than the max timestamp already in the table.",
                  "ru": "Переведите одну dbt-модель с полного пересчёта на инкрементальную: добавьте конфиг материализации и блок is_incremental(), который отбирает строки новее максимальной отметки времени, уже лежащей в таблице."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Add a dbt snapshot over a slowly changing dimension (e.g. a customer or product table), choosing a strategy and the columns that define a change.",
                  "ru": "Добавьте dbt snapshot на медленно меняющееся измерение (например, таблицу клиентов или товаров), выбрав стратегию и столбцы, по которым определяется изменение."
                },
                "guidance": {
                  "en": "A snapshot gives you SCD2 history: change one source row, run the snapshot twice, and confirm the old version closes (dbt_valid_to set) while a new version opens.",
                  "ru": "Snapshot даёт историю по SCD2: измените одну строку источника, запустите snapshot дважды и убедитесь, что старая версия закрывается (заполняется dbt_valid_to), а новая открывается."
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
                  "en": "Read the 'Incremental models' and 'Snapshots' pages — focus on is_incremental() and snapshot strategies.",
                  "ru": "Прочитайте страницы «Incremental models» и «Snapshots» — сосредоточьтесь на is_incremental() и стратегиях snapshot."
                }
              }
            ]
          },
          {
            "id": "w3d3",
            "track": "pipelines",
            "title": {
              "en": "Extract to raw, then staging",
              "ru": "Извлечение в raw, затем staging"
            },
            "warmup": {
              "en": "If you clean data before storing it, where do you turn when the cleaning logic was wrong?",
              "ru": "Если вы чистите данные до сохранения, куда обращаться, когда логика очистки оказалась неверной?"
            },
            "reflectPrompt": {
              "en": "Why is keeping an untouched raw copy worth the extra storage, even when staging looks 'good enough' on its own?",
              "ru": "Почему хранить нетронутую копию raw стоит дополнительного места, даже когда staging сам по себе выглядит «достаточно хорошим»?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Write a Python extractor that pulls from an API or set of files and lands records into a raw layer exactly as received — no renaming, no casting, just the payload plus an ingestion timestamp and source filename.",
                  "ru": "Напишите экстрактор на Python, который тянет данные из API или набора файлов и складывает записи в raw-слой ровно в том виде, как получены — без переименований и приведения типов, только полезная нагрузка плюс отметка времени загрузки и имя исходного файла."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Add a staging model on top of that raw data that renames columns to a consistent convention and casts each field to its proper type.",
                  "ru": "Добавьте staging-модель поверх этих raw-данных, которая переименовывает столбцы к единому соглашению и приводит каждое поле к правильному типу."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Make the extractor safe to re-run for the same source pull: overwrite or skip the existing raw partition instead of appending a duplicate.",
                  "ru": "Сделайте экстрактор безопасным для повторного запуска по той же выборке источника: перезаписывайте или пропускайте существующую raw-партицию, а не добавляйте дубликат."
                }
              }
            ]
          },
          {
            "id": "w3d4",
            "track": "modeling",
            "title": {
              "en": "Layering: staging to marts",
              "ru": "Слои: от staging к marts"
            },
            "warmup": {
              "en": "Name the three layers a row passes through before a dashboard reads it.",
              "ru": "Назовите три слоя, через которые проходит строка, прежде чем её прочитает дашборд."
            },
            "reflectPrompt": {
              "en": "Looking at your real project, which models are doing two jobs at once — and which layer does each job actually belong in?",
              "ru": "Глядя на ваш реальный проект, какие модели делают два дела сразу — и к какому слою на самом деле относится каждое из этих дел?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "List 6 example model names (yours or made up), label each as staging, intermediate, or mart, and write one line per model justifying the label.",
                  "ru": "Выпишите 6 примеров имён моделей (свои или придуманные), пометьте каждую как staging, intermediate или mart и напишите по одной строке на модель, обосновывая метку."
                },
                "guidance": {
                  "en": "Staging = one source cleaned 1:1; intermediate = reusable joins/aggregations not exposed directly; mart = the business-facing fact/dim a consumer queries.",
                  "ru": "Staging = один источник, почищенный один к одному; intermediate = переиспользуемые джойны/агрегации, не отдаваемые напрямую; mart = бизнес-ориентированный факт/измерение, который запрашивает потребитель."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Take one fat model that mixes cleaning and business logic and split it into a thin staging model plus a mart that selects from it.",
                  "ru": "Возьмите одну «толстую» модель, смешивающую очистку и бизнес-логику, и разделите её на тонкую staging-модель плюс mart, который из неё выбирает."
                }
              }
            ]
          },
          {
            "id": "w3d5",
            "track": "pipelines",
            "title": {
              "en": "Backfills & watermarks",
              "ru": "Бэкфилл и watermarks"
            },
            "warmup": {
              "en": "How does tonight's run know which rows yesterday's run already handled?",
              "ru": "Откуда сегодняшний ночной запуск знает, какие строки уже обработал вчерашний?"
            },
            "reflectPrompt": {
              "en": "What goes wrong if the high-water mark advances before the load that produced it actually committed?",
              "ru": "Что пойдёт не так, если high-water mark сдвинется раньше, чем зафиксируется загрузка, которая его породила?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Implement a watermark-based incremental load: read the stored high-water mark, pull only rows past it, and advance the mark only after the load succeeds.",
                  "ru": "Реализуйте инкрементальную загрузку на основе watermark: прочитайте сохранённый high-water mark, заберите только строки после него и сдвиньте отметку только после успешной загрузки."
                },
                "guidance": {
                  "en": "Advancing the mark only on success makes a failed run replay the same window next time instead of silently skipping it — combine with the idempotent load from Day 1.",
                  "ru": "Сдвиг отметки только при успехе заставляет упавший запуск в следующий раз переиграть то же окно, а не молча его пропустить — сочетайте с идемпотентной загрузкой из Дня 1."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Parameterize the load by a start/end date window and run a backfill for a past date range, confirming it doesn't disturb already-loaded current data.",
                  "ru": "Параметризуйте загрузку окном начальной/конечной даты и выполните бэкфилл за прошлый диапазон дат, убедившись, что он не задевает уже загруженные актуальные данные."
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
              "en": "Your query scanned 400M rows to return 12 — where did the other 399,999,988 come from?",
              "ru": "Ваш запрос просканировал 400 млн строк, чтобы вернуть 12 — откуда взялись остальные 399 999 988?"
            },
            "reflectPrompt": {
              "en": "Reading the plan, what assumption about your data did the slow query reveal — and would partitioning or clustering fix it at the source?",
              "ru": "Что план запроса раскрыл о ваших данных через медленный запрос — и решили бы это партиционирование или кластеризация в самом источнике?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Run EXPLAIN (or open the query plan view) on a slow query and identify the single most costly step — a full scan, a large sort, or a join blowing up row counts.",
                  "ru": "Запустите EXPLAIN (или откройте просмотр плана запроса) на медленном запросе и определите самый дорогой шаг — полный скан, крупную сортировку или джойн, раздувающий число строк."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Rewrite one query so it prunes a partition: add a filter on the partition column and re-read the plan to confirm the engine now scans fewer partitions.",
                  "ru": "Перепишите один запрос так, чтобы он отсекал партицию: добавьте фильтр по столбцу партиционирования и перечитайте план, убедившись, что движок теперь сканирует меньше партиций."
                },
                "guidance": {
                  "en": "Pruning only works when the filter is on the actual partition key and isn't wrapped in a function the engine can't see through — compare bytes/rows scanned before and after.",
                  "ru": "Отсечение работает только когда фильтр стоит на самом ключе партиционирования и не обёрнут в функцию, сквозь которую движок не видит — сравните просканированные байты/строки до и после."
                }
              }
            ]
          },
          {
            "id": "w3rest",
            "track": "rest",
            "rest": true,
            "reflectPrompt": {
              "en": "This week you turned loads from 'run once and hope' into idempotent, incremental, layered pipelines. Which single habit — re-runnable loads, the raw/staging split, layering, or watermarks — will change how you build your next pipeline, and what made it click?",
              "ru": "На этой неделе вы превратили загрузки из «запусти один раз и надейся» в идемпотентные, инкрементальные, послойные пайплайны. Какая одна привычка — перезапускаемые загрузки, разделение raw/staging, слои или watermarks — изменит то, как вы строите следующий пайплайн, и что помогло это осознать?"
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
              "en": "Airflow concepts",
              "ru": "Основы Airflow"
            },
            "warmup": {
              "en": "A nightly job has three steps that must run in order. What decides what runs, and when?",
              "ru": "У ночной задачи три шага, которые должны идти по порядку. Что решает, что и когда запускается?"
            },
            "reflectPrompt": {
              "en": "An operator, a task, and a DAG are three different things. In your own words, where does the boundary between them sit?",
              "ru": "Оператор, задача (task) и DAG — это три разные вещи. Своими словами: где проходит граница между ними?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Install Airflow locally and start the scheduler and webserver (or, if that is not feasible tonight, read the Core Concepts docs end to end)",
                  "ru": "Установите Airflow локально и запустите scheduler и webserver (или, если сегодня это нереально, прочитайте раздел Core Concepts в документации целиком)"
                },
                "guidance": {
                  "en": "A local standalone install is enough; the goal is to see the scheduler heartbeat and the UI list of DAGs, not a production setup.",
                  "ru": "Достаточно локальной standalone-установки; цель — увидеть heartbeat scheduler'а и список DAG в UI, а не продакшен-конфигурацию."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Diagram a 3-task DAG (extract, transform, load) and draw the dependency edges between the tasks",
                  "ru": "Нарисуйте схему DAG из трёх задач (extract, transform, load) и проведите рёбра зависимостей между ними"
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
              "en": "Write a DAG",
              "ru": "Пишем DAG"
            },
            "warmup": {
              "en": "A task fails once because an API blinked. Should the whole run die, or should the task retry first?",
              "ru": "Задача упала один раз, потому что API моргнул. Должен ли упасть весь run, или задаче стоит сначала повторить попытку?"
            },
            "reflectPrompt": {
              "en": "You set a retry count and a schedule interval tonight. Which one would cause more damage if you got it wrong, and why?",
              "ru": "Сегодня вы задали число повторов (retries) и интервал расписания. Какой из них нанёс бы больше вреда при ошибке и почему?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Author a DAG with at least three tasks wired using >> dependencies, a defined schedule interval, and a retries setting on the tasks",
                  "ru": "Напишите DAG минимум из трёх задач, связанных через зависимости >>, с заданным интервалом расписания и настройкой retries у задач"
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Trigger one run (manually or by waiting for the schedule) and confirm in the UI that the tasks ran in dependency order",
                  "ru": "Запустите один run (вручную или дождавшись расписания) и убедитесь в UI, что задачи отработали в порядке зависимостей"
                }
              }
            ]
          },
          {
            "id": "w4d3",
            "track": "quality",
            "title": {
              "en": "Tests as contracts",
              "ru": "Тесты как контракты"
            },
            "warmup": {
              "en": "Last night a load silently dropped half the rows; nobody noticed until the dashboard looked wrong. How could the pipeline have caught it?",
              "ru": "Вчера загрузка тихо потеряла половину строк, и никто не заметил, пока дашборд не выглядел странно. Как пайплайн мог это поймать?"
            },
            "reflectPrompt": {
              "en": "A warning gets ignored; a hard failure stops the line. Which checks in your pipeline deserve to be fatal, and which are just noise?",
              "ru": "Предупреждение игнорируют; жёсткое падение останавливает конвейер. Какие проверки в вашем пайплайне заслуживают быть фатальными, а какие — просто шум?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Add one check to your pipeline that hard-fails the run (raises and stops downstream tasks) when a load is bad — for example a row-count drop or an unexpected null rate, not a logged warning",
                  "ru": "Добавьте в пайплайн одну проверку, которая жёстко роняет run (бросает исключение и останавливает зависимые задачи) при плохой загрузке — например, при падении row count или неожиданной доле null, а не лог-предупреждение"
                },
                "guidance": {
                  "en": "A strong check states an explicit threshold and what it protects (e.g. \"fail if today's row count is below 80% of the 7-day median\"), so the failure message tells the next person exactly what broke.",
                  "ru": "Сильная проверка задаёт явный порог и то, что она защищает (например, «падать, если row count за сегодня ниже 80% от медианы за 7 дней»), чтобы сообщение об ошибке сразу объясняло следующему человеку, что сломалось."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Write down the data-quality dimensions that matter for your dataset (completeness, uniqueness, freshness, validity, consistency) and mark which one each existing check covers",
                  "ru": "Выпишите измерения качества данных, важные для вашего датасета (полнота, уникальность, свежесть, валидность, согласованность), и отметьте, какое из них покрывает каждая существующая проверка"
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
              "en": "You add a DAG today with a start date two weeks ago. How many runs is Airflow about to fire, and is that what you wanted?",
              "ru": "Вы добавляете DAG сегодня со start date две недели назад. Сколько run'ов Airflow сейчас запустит, и этого ли вы хотели?"
            },
            "reflectPrompt": {
              "en": "Idempotency is what makes a backfill safe. Where in your pipeline does re-running a task quietly double-count or corrupt data, and what would it take to fix that?",
              "ru": "Идемпотентность — это то, что делает бэкфил безопасным. Где в вашем пайплайне повторный запуск задачи тихо удваивает или портит данные, и что нужно, чтобы это исправить?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Run a catchup backfill that produces several dated runs over past intervals, and watch the scheduler create one run per interval",
                  "ru": "Запустите catchup-бэкфил, который создаёт несколько датированных run'ов за прошлые интервалы, и понаблюдайте, как scheduler создаёт по одному run на интервал"
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Make one task idempotent (delete-then-insert by partition/date, or upsert) and prove it: run it twice for the same interval and show the output is identical, not duplicated",
                  "ru": "Сделайте одну задачу идемпотентной (delete-then-insert по партиции/дате или upsert) и докажите это: запустите её дважды для одного интервала и покажите, что результат идентичен, а не задублирован"
                },
                "guidance": {
                  "en": "The proof is a before/after row count or a checksum of the target partition that stays the same across the second run — not just \"it didn't error\".",
                  "ru": "Доказательство — это row count или контрольная сумма целевой партиции до/после, которые не меняются при втором запуске, а не просто «не упало»."
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
                  "en": "Define a data contract for one incoming source: the expected schema (field names + types) plus constraints (required fields, allowed ranges/enums, uniqueness)",
                  "ru": "Опишите контракт данных для одного входящего источника: ожидаемую схему (имена полей + типы) плюс ограничения (обязательные поля, допустимые диапазоны/enum, уникальность)"
                },
                "guidance": {
                  "en": "Express it as something executable at the boundary — a pydantic model, a JSON Schema, or explicit assertions — not just prose, so the contract can actually reject input.",
                  "ru": "Выразите его как нечто исполняемое на границе — модель pydantic, JSON Schema или явные проверки — а не просто текстом, чтобы контракт мог реально отклонять вход."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Feed ingestion a record that violates the contract (wrong type or out-of-range value) and confirm the record is rejected (raised, quarantined, or routed to a dead-letter path), not loaded",
                  "ru": "Подайте на ингест запись, нарушающую контракт (неверный тип или значение вне диапазона), и убедитесь, что запись отклонена (брошено исключение, помещена в карантин или отправлена в dead-letter), а не загружена"
                }
              }
            ]
          },
          {
            "id": "w4d6",
            "track": "pipelines",
            "title": {
              "en": "Orchestrate dbt from Airflow",
              "ru": "Запуск dbt из Airflow"
            },
            "warmup": {
              "en": "Your dbt models are only as fresh as the data under them. What guarantees dbt does not run on yesterday's load?",
              "ru": "Ваши модели dbt свежи ровно настолько, насколько свежи данные под ними. Что гарантирует, что dbt не запустится на вчерашней загрузке?"
            },
            "reflectPrompt": {
              "en": "You connected ingestion and dbt into one DAG today. What now lives in Airflow's dependency graph that used to live only in someone's head or a runbook?",
              "ru": "Сегодня вы соединили ингест и dbt в один DAG. Что теперь живёт в графе зависимостей Airflow, а раньше жило только в чьей-то голове или в runbook'е?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Add a dbt run task (BashOperator calling dbt, or a dbt operator) downstream of the ingestion task in your DAG",
                  "ru": "Добавьте задачу dbt run (BashOperator, вызывающий dbt, или dbt-оператор) ниже по потоку от задачи ингеста в вашем DAG"
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Add a sensor or an explicit >> dependency so the dbt task only starts after fresh data has actually landed, then trigger a run to confirm the ordering holds",
                  "ru": "Добавьте сенсор или явную зависимость >>, чтобы задача dbt стартовала только после того, как свежие данные реально приземлились, и запустите run, чтобы подтвердить, что порядок соблюдается"
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
                  "en": "How dbt run and dbt build execute models, so you know what the Airflow task is actually invoking.",
                  "ru": "Как dbt run и dbt build исполняют модели, чтобы понимать, что именно вызывает задача Airflow."
                }
              }
            ]
          },
          {
            "id": "w4rest",
            "track": "rest",
            "rest": true,
            "reflectPrompt": {
              "en": "This week you moved from running steps by hand to having a scheduler run them for you — with retries, backfills, quality gates, and contracts. Where do you still trust your own memory more than the pipeline, and what would it take to trust the orchestration instead?",
              "ru": "На этой неделе вы перешли от запуска шагов вручную к тому, что их за вас запускает scheduler — с retries, бэкфилами, проверками качества и контрактами. Где вы всё ещё доверяете своей памяти больше, чем пайплайну, и что нужно, чтобы доверять оркестрации вместо этого?"
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
              "en": "Observability",
              "ru": "Наблюдаемость"
            },
            "warmup": {
              "en": "If a table silently stopped updating three days ago, how would you find out?",
              "ru": "Если таблица тихо перестала обновляться три дня назад — как вы об этом узнаете?"
            },
            "reflectPrompt": {
              "en": "Which of your current tables would break silently, with no one noticing for days? What signal would have caught it?",
              "ru": "Какая из ваших нынешних таблиц сломалась бы молча, и этого не заметили бы несколько дней? Какой сигнал поймал бы это?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Add a freshness check to a table: assert its newest timestamp is within an expected lag, and make the check fail when it is not.",
                  "ru": "Добавьте к таблице проверку свежести: убедитесь, что самая поздняя метка времени укладывается в ожидаемый лаг, и сделайте так, чтобы проверка падала, когда это не так."
                },
                "guidance": {
                  "en": "Derive the threshold from the table's real cadence (a daily load tolerates ~26h, an hourly one far less), not a round number you guessed.",
                  "ru": "Выводите порог из реальной частоты обновления таблицы (суточная загрузка терпит ~26 ч, часовая — гораздо меньше), а не из круглого числа наугад."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Add a volume check: assert the row count (or rows added today) falls inside an expected range, and trip it on both an empty load and an unexpected spike.",
                  "ru": "Добавьте проверку объёма: убедитесь, что число строк (или добавленных за сегодня) попадает в ожидаемый диапазон, и проверьте срабатывание и на пустой загрузке, и на неожиданном всплеске."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Wire one alert condition: route a failing check to a real notification channel (email, Slack, or a log the on-call actually reads) and trigger it once on purpose.",
                  "ru": "Подключите одно условие алерта: направьте падающую проверку в настоящий канал уведомлений (email, Slack или лог, который дежурный реально читает) и намеренно вызовите его один раз."
                }
              }
            ]
          },
          {
            "id": "w5d2",
            "track": "quality",
            "title": {
              "en": "File formats",
              "ru": "Форматы файлов"
            },
            "warmup": {
              "en": "A query reads two of forty columns. Why does the storage format decide how much disk it touches?",
              "ru": "Запрос читает два столбца из сорока. Почему именно формат хранения определяет, сколько диска он затронет?"
            },
            "reflectPrompt": {
              "en": "Where in your stack are you still moving data as CSV, and what would switching to a columnar format actually cost or save you there?",
              "ru": "Где в вашем стеке данные всё ещё ходят как CSV, и что на самом деле даст или будет стоить переход на колоночный формат именно там?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Write the same non-trivial dataset (at least 100k rows, mixed types) to both CSV and Parquet from one script.",
                  "ru": "Запишите один и тот же нетривиальный датасет (не менее 100 тыс. строк, смешанные типы) и в CSV, и в Parquet из одного скрипта."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Measure and record the on-disk file size of each, plus the time to read only two columns from each.",
                  "ru": "Замерьте и зафиксируйте размер файла на диске для каждого, а также время чтения только двух столбцов из каждого."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "Write a short note (5-8 lines) explaining the size and read-cost gap in terms of columnar layout and compression — name why Parquet skipped the unread columns.",
                  "ru": "Напишите короткую заметку (5–8 строк), объясняющую разницу в размере и стоимости чтения через колоночную раскладку и сжатие — назовите, почему Parquet пропустил непрочитанные столбцы."
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
              "ru": "Почему трансформация в Spark ничего не выполняет, пока вы не вызовете действие?"
            },
            "reflectPrompt": {
              "en": "Be honest: how often does your data actually exceed what a warehouse handles well — and how often is 'use Spark' just resume-driven?",
              "ru": "Честно: как часто ваши данные действительно превышают то, с чем хорошо справляется хранилище — и как часто «возьмём Spark» это просто строчка в резюме?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Read the Spark execution model: lazy evaluation, the transformation/action split, and what a shuffle is and why it is the expensive operation.",
                  "ru": "Прочитайте про модель выполнения Spark: ленивые вычисления, разделение на трансформации и действия, что такое shuffle и почему это дорогая операция."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "For two concrete scenarios — (a) a 5 GB nightly aggregation that fits in your warehouse, (b) a 4 TB reprocessing of raw event logs with heavy custom Python — decide warehouse vs Spark for each and write one sentence justifying each call.",
                  "ru": "Для двух конкретных сценариев — (а) ночная агрегация на 5 ГБ, влезающая в ваше хранилище, (б) переобработка 4 ТБ сырых логов событий с тяжёлым кастомным Python — решите для каждого «хранилище или Spark» и обоснуйте каждый выбор одним предложением."
                },
                "guidance": {
                  "en": "What tips it toward Spark: data that won't fit the warehouse, logic the warehouse can't express (arbitrary Python/ML), or needing engine-agnostic compute over files. What tips it back: if SQL on a warehouse already does the job, that is almost always simpler and cheaper.",
                  "ru": "Что склоняет к Spark: данные не влезают в хранилище, логика, которую хранилище не выражает (произвольный Python/ML), или нужны вычисления над файлами вне привязки к движку. Что склоняет обратно: если SQL в хранилище уже решает задачу — почти всегда это проще и дешевле."
                }
              }
            ]
          },
          {
            "id": "w5d4",
            "track": "pipelines",
            "title": {
              "en": "Lake partitioning & layout",
              "ru": "Партиционирование и раскладка озера"
            },
            "warmup": {
              "en": "A query filters on one day but scans a year of files. What about the layout let that happen?",
              "ru": "Запрос фильтрует по одному дню, но сканирует файлы за год. Что в раскладке это допустило?"
            },
            "reflectPrompt": {
              "en": "Partitioning trades query speed against more, smaller files. Where is the line — what would make you stop adding partition keys?",
              "ru": "Партиционирование меняет скорость запроса на большее число мелких файлов. Где граница — что заставит вас перестать добавлять ключи партиционирования?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Partition a dataset by date on disk into a dt=YYYY-MM-DD/ directory layout, and confirm a single-day read opens only that day's files.",
                  "ru": "Разложите датасет по дате на диске в структуру каталогов dt=YYYY-MM-DD/ и убедитесь, что чтение за один день открывает только файлы этого дня."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Write a short note on the small-files problem (why thousands of tiny files starve a query engine) and one concrete fix — e.g. a compaction job that rewrites a partition into fewer, larger files.",
                  "ru": "Напишите короткую заметку о проблеме мелких файлов (почему тысячи крошечных файлов душат движок запросов) и об одном конкретном решении — например, задаче компакции, переписывающей партицию в меньшее число крупных файлов."
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
              "en": "Looking at your design, where is it most likely to break in production — and did you specify a test or check that would catch exactly that?",
              "ru": "Глядя на свой дизайн: где он скорее всего сломается в продакшене — и заложили ли вы тест или проверку, которая поймает именно это?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Write a one-page design: a DAG sketch of the stages ingest -> raw -> warehouse -> dbt marts -> tests, naming each stage's input, output, and what triggers it.",
                  "ru": "Напишите одностраничный дизайн: эскиз DAG со стадиями ingest -> raw -> warehouse -> dbt marts -> tests, указав для каждой стадии вход, выход и что её запускает."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Define the data contract for the final mart: column names, types, nullability, primary key, and freshness expectation.",
                  "ru": "Опишите контракт данных для финальной витрины: имена столбцов, типы, допустимость NULL, первичный ключ и ожидание по свежести."
                }
              },
              {
                "id": "t3",
                "text": {
                  "en": "List the tests the pipeline must pass — at minimum a uniqueness test on the key, a not-null test on required columns, and one referential or business-rule test — naming the stage each runs at.",
                  "ru": "Перечислите тесты, которые пайплайн обязан проходить — минимум тест на уникальность ключа, тест not-null на обязательные столбцы и один тест на ссылочную целостность или бизнес-правило — указав, на какой стадии каждый выполняется."
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
              "ru": "Если запуск в 3 часа ночи упадёт — что должно быть под рукой у следующего, чтобы починить без вас?"
            },
            "reflectPrompt": {
              "en": "You shipped it end to end. Which single step was the most fragile, and what would you harden first if this had to run unattended for a month?",
              "ru": "Вы довели его до конца. Какой один шаг оказался самым хрупким, и что бы вы укрепили первым, если бы это работало без присмотра месяц?"
            },
            "tasks": [
              {
                "id": "t1",
                "text": {
                  "en": "Orchestrate the pipeline end to end: one DAG runs the stages in order and invokes dbt, and a single trigger produces the populated mart from a clean start.",
                  "ru": "Оркестрируйте пайплайн от начала до конца: один DAG прогоняет стадии по порядку и вызывает dbt, и один запуск с чистого состояния выдаёт заполненную витрину."
                }
              },
              {
                "id": "t2",
                "text": {
                  "en": "Add freshness and volume quality checks to the run so the DAG fails loudly when the mart is stale or the row count is out of range.",
                  "ru": "Добавьте в запуск проверки качества на свежесть и объём, чтобы DAG громко падал, когда витрина устарела или число строк вне диапазона."
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
              "en": "Five weeks in, you built a real pipeline end to end. Comparing how you thought about data on day one with how you think now — what is the biggest shift, and what is the next gap you most want to close?",
              "ru": "Спустя пять недель вы построили настоящий пайплайн от начала до конца. Сравнивая, как вы думали о данных в первый день и как думаете сейчас — какой сдвиг самый большой, и какой следующий пробел вы больше всего хотите закрыть?"
            }
          }
        ]
      }
    ]
  };
  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);
  if (typeof module !== 'undefined' && module.exports) module.exports = pack;
})(typeof window !== 'undefined' ? window : globalThis);
