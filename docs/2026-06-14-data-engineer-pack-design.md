# Data Engineer content pack — design

**Date:** 2026-06-14
**Status:** approved (brainstorming)
**Deliverable:** one self-registering content pack `data/packs/data-engineer.js` + one
`<script>` line in `index.html`. No `src/` change, so no app rebuild — but `sw.js`
glob-precaches `data/packs/*.js`, so `npm run build` is run once at the end to refresh
the offline cache (caching only; the pack itself needs no compile).

## Context & goal

The repo ships one large content pack — `dev-roadmap` (13 weeks / 78 days / 274 tasks /
9 tracks, bilingual). The goal is a **second, much smaller** course for becoming a data
engineer. "Not so huge" is a constraint on *breadth/duration*, not on per-card richness:
each day keeps the dev pack's warmup + reflection + concrete tasks format.

## Locked decisions

| Decision | Choice |
|---|---|
| Scale | ~5 weeks / ~30 non-rest items (≈40% of dev) |
| Audience | **Analyst → Data Engineer**: already strong in SQL and notebooks; gap is engineering rigor (Python beyond notebooks, modeling, pipelines, orchestration, quality). Teach almost no basic SQL. |
| Language | Bilingual EN/RU, every text field a `{en, ru}` map (EN is fallback) |
| Structure | **Interleaved** (dev-pack style): each week mixes 2–3 tracks; each track's own items stay in pedagogical order across weeks |

### Non-goals (YAGNI)

- No SQL fundamentals (audience already has them).
- No deep Spark/streaming — Spark gets one conceptual "when to reach for it" day; no Kafka.
- No cloud-vendor specifics (no "AWS Glue" etc.) — keep it tool-conceptual (warehouse, dbt, Airflow, Parquet).
- No new app features, no `src/` changes, no new themes.

## Envelope & settings

```
schema:  "sunrise.pack/v1"
id:      "data-engineer"
name:    { en:"Data Engineer", ru:"Дата-инженер" }
version: "1.0.0"
locale:  "ru"
settings:{
  labels:{ phase:{en:"Phase",ru:"Фаза"}, group:{en:"Week",ru:"Неделя"},
           groupAbbr:{en:"Wk",ru:"Нед"}, item:{en:"Day",ru:"День"} },
  reflections:true, warmups:true
}
ui:{
  phaseLabel:{ en:"Phase {p} · Week {w}", ru:"Фаза {p} · Неделя {w}" },
  todayVert:{ en:"TODAY", ru:"СЕГОДНЯ" },
  restVert:{ en:"REST", ru:"ОТДЫХ" },
  aiPrompt: <bilingual DE-tutor prompt; MUST keep all 4 placeholders {title}{track}{text}{guidance}>,
  aiPromptGuidance: <bilingual line wrapping {guidance}>
}
```

The app's default `aiPrompt` is a Russian tutor prompt. We override it with a bilingual
data-engineering-tutor framing and keep `{title}`, `{track}`, `{text}`, `{guidance}`.

## Tracks (5)

| id | label EN / RU | icon | covers |
|---|---|---|---|
| `python` | Python Engineering / Python-инженерия | 🐍 | notebook→script, venv/packaging, typing, pytest, git |
| `modeling` | Data Modeling / Моделирование | 🧱 | OLTP vs OLAP, normalization, dimensional/star, grain, SCD, layering |
| `warehouse` | Warehouse & dbt / Хранилище и dbt | 🏬 | columnar/MPP, partitioning/clustering, dbt models/sources/tests, incremental, query plans |
| `pipelines` | Pipelines & Orchestration / Пайплайны | 🔧 | ETL vs ELT, idempotency, backfills/watermarks, Airflow DAGs, orchestrating dbt |
| `quality` | Quality & Scale / Качество и масштаб | 🛡️ | data tests/contracts, observability, file formats, Spark intro, capstone |

`color` hints optional; pick distinct hues so interleaved weeks read clearly. `rest` track
is built-in (used by rest items, not declared).

## Phases (2)

- `"1"` **Foundations** / Фундамент — weeks 1–2
- `"2"` **Pipelines & Production** / Пайплайны и продакшн — weeks 3–5

## Groups & interleaved syllabus

5 groups (`g1`..`g5`), one per week, each `phase` set per above. Each group: **6 non-rest
items + 1 rest item** at the end. Item id scheme `w{week}d{n}` (globally unique); rest item
`w{week}rest` on `track:"rest"`. Task ids `t1..t3` (unique within item).

Per-day spec below gives **track + EN title + task intent**. Implementation writes the full
bilingual `title` / `warmup` / `reflectPrompt` / `tasks[].text` / optional `guidance` /
optional `resources`. Tasks are **solve-or-build-or-read** (concrete, checkable); reflection
lives **only** in `reflectPrompt`, never as a task; judgment/behavioral tasks carry a
`guidance` spoiler.

### Week 1 — Toolkit & thinking in models (phase 1)
1. `python` **From notebook to script** — venv, project layout, `__main__`, argparse CLI. Tasks: set up a venv + repo skeleton; convert a notebook cell into a runnable `main.py` with a CLI flag.
2. `modeling` **OLTP vs OLAP** — why analytical stores differ; normalization recap (1NF–3NF) from an analyst's lens. Tasks: classify sample schemas as OLTP/OLAP; normalize a denormalized table on paper.
3. `python` **Git for engineers** — branches, atomic commits, `.gitignore`, reviewing your own diff. Tasks: branch + commit the week-1 script; write a one-line diff review of your own change.
4. `modeling` **Dimensional modeling intro** — facts vs dimensions, grain, star schema. Tasks: identify the grain of an "orders" fact; list its dimensions.
5. `python` **pytest basics** — test a pure transform function. Tasks: write 2–3 pytest cases for a small transform; make a failing test pass.
6. `modeling` **Design a star schema** — model the orders domain end-to-end (fact + conformed dims). Tasks: draw the star; write the DDL for the fact + one dimension.
- rest `w1rest`

### Week 2 — Typed Python + the warehouse (phase 1)
1. `python` **Type hints & records** — typing, `dataclass`/`pydantic` for row records. Tasks: add type hints + a record dataclass to the week-1 script; run mypy.
2. `warehouse` **Columnar & MPP** — why a warehouse ≠ Postgres; partitioning/clustering basics. Tasks: explain (short note) when columnar wins; predict which of 2 queries scans less.
3. `modeling` **Slowly changing dimensions** — SCD type 1 vs 2, surrogate keys. Tasks: design an SCD2 dimension table with effective dates + surrogate key.
4. `warehouse` **dbt: first model** — project, `sources`, `ref()`, materializations. Tasks: scaffold a dbt project; build one staging model with `ref()`/`source()`.
5. `python` **Packaging & reproducible env** — `pyproject`, pinning, lockfile mindset. Tasks: add a `pyproject.toml`; pin deps; reproduce the env from scratch.
6. `warehouse` **dbt tests & docs** — generic schema tests (unique/not_null/relationships) vs singular. Tasks: add unique + not_null + relationships tests; run `dbt test` and read output.
- rest `w2rest`

### Week 3 — ELT in practice (phase 2)
1. `pipelines` **ETL vs ELT & idempotency** — re-runnable loads, why idempotency matters. Tasks: rewrite a non-idempotent load to be idempotent; explain the failure it prevents (guidance).
2. `warehouse` **Incremental models & snapshots** — incremental dbt, snapshots for SCD2. Tasks: convert a model to incremental; add a dbt snapshot.
3. `pipelines` **Extract → raw → staging** — pull from an API/files into a raw layer. Tasks: write an extractor that lands raw files; add a staging model over them.
4. `modeling` **Layering: staging → intermediate → marts** — the medallion-ish transform layers. Tasks: classify 6 models into the 3 layers; refactor one model into staging + mart.
5. `pipelines` **Backfills & watermarks** — high-water marks, incremental windows. Tasks: implement a watermark-based incremental load; run a backfill for a past window.
6. `warehouse` **Query performance** — pruning, clustering, reading a query plan. Tasks: read an `EXPLAIN`; make one query prune a partition.
- rest `w3rest`

### Week 4 — Orchestration (phase 2)
1. `pipelines` **Airflow concepts** — DAGs, tasks, operators, the scheduler. Tasks: install Airflow locally (or read the model); diagram a 3-task DAG.
2. `pipelines` **Write a DAG** — dependencies, schedule interval, retries. Tasks: author a DAG with `>>` deps, a schedule, and retries; trigger it.
3. `quality` **Tests as contracts** — data-quality dimensions; fail loudly, not silently. Tasks: add a check that hard-fails a bad load; list the 6 DQ dimensions for your dataset.
4. `pipelines` **Backfills & catchup** — Airflow catchup, idempotent tasks. Tasks: run a catchup backfill; prove a task is safe to re-run.
5. `quality` **Data contracts** — schema enforcement at ingestion. Tasks: define a contract (schema + constraints); reject a record that violates it.
6. `pipelines` **Orchestrate dbt from Airflow** — running dbt as DAG tasks; sensors. Tasks: add a dbt-run task downstream of ingestion; add a sensor/dependency.
- rest `w4rest`

### Week 5 — Quality, scale & capstone (phase 2)
1. `quality` **Observability** — freshness, volume, anomaly checks; alerting. Tasks: add a freshness + volume check; wire one alert condition.
2. `quality` **File formats** — Parquet/Avro vs CSV; columnar-on-disk, compression. Tasks: write the same data to CSV + Parquet; compare size/read cost (short note).
3. `quality` **Distributed processing intro** — Spark model (DataFrame), when to reach for it vs a warehouse. Tasks: read the Spark execution model; decide warehouse-vs-Spark for 2 scenarios (guidance).
4. `pipelines` **Lake partitioning & file layout** — partitioning for query perf, small-files problem. Tasks: partition a dataset by date; explain the small-files problem.
5. `quality` **Capstone 1 — design** — design a small end-to-end pipeline: ingest → raw → warehouse → dbt marts → tests. Tasks: write the design doc / DAG sketch; define the data contract + tests.
6. `quality` **Capstone 2 — ship** — orchestrate it, add quality checks, write a runbook. Tasks: orchestrate the pipeline; add freshness/volume checks; write a one-page runbook.
- rest `w5rest`

**Track totals:** python 5, modeling 5, warehouse 5, pipelines 8, quality 7 = 30 non-rest
items (+5 rest). Weighting is intentional — an analyst's real gap is pipelines + quality.

## Badges (5 pack-specific, on top of the generic auto-set)

| id | title EN/RU | type | param |
|---|---|---|---|
| `de-pythonista` | Pythonista / Питонист | `track-complete` | `track:"python"` |
| `de-warehouse` | Warehouse Wrangler / Хозяин хранилища | `track-complete` | `track:"warehouse"` |
| `de-plumber` | Pipeline Plumber / Сантехник пайплайнов | `track-complete` | `track:"pipelines"` |
| `de-foundations` | Foundations Laid / Фундамент заложен | `phase-complete` | `phase:"1"` |
| `de-shipped` | Shipped It / Зарелижено | `item-complete` | `item:"w5d6"` |

Generic badges (streaks, days-done, percent, all-done, reflections, weekend/night/lark,
perfect-group, halfway, finisher, comeback) ship automatically — don't redeclare them.

## Mottos & surprises

~6 `mottos` and ~5 `surprises`, bilingual, data-engineering flavored (idempotency, pipelines,
"the data is never as clean as the ticket says", etc.). Falls back to app defaults if omitted,
but we include a small set for flavor.

## Validation contract (the gate — must all hold)

- `schema:"sunrise.pack/v1"`, unique `id`, ≥1 track, ≥1 group.
- Every non-rest item has ≥1 task (target 2–3); only `rest:true` items omit tasks.
- All ids match `^[a-z0-9][a-z0-9-]*$`; **item ids globally unique**; task ids unique within item.
- No `null` entries in any array.
- Every `item.track` references a declared track id (or `"rest"`); group `phase` references a declared phase id.
- Badge `track`/`phase`/`item` references all exist (`python`, `warehouse`, `pipelines`, `"1"`, `w5d6`).
- Every text field is a string or `{en,ru}` map.

## Implementation & verification plan (for the plan phase, not now)

1. Author `data/packs/data-engineer.js` as a self-registering IIFE (`registerPack`), full bilingual content per the syllabus above.
2. Add `<script src="data/packs/data-engineer.js"></script>` to `index.html` after the bundle (and after `dev-roadmap.js`).
3. **Validate before claiming done**: load the pack through the same `PackValidator` the app uses (Node harness) and assert it is accepted (no rejection reason logged). This is the hard gate.
4. Run `npm run build` once to regenerate `sw.js` so the new pack is precached for offline/PWA; commit the regenerated `sw.js` with the pack + `index.html` edit.
5. Sanity-check counts (30 non-rest items, 5 rest, track totals) and that EN and RU both resolve.
6. Update `MEMORY.md`/project memory only if a non-obvious decision emerges (per house rule); otherwise no doc churn — the authoring guide already documents the contract.
