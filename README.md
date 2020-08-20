# Transformer

Visual database schema designer and app-logic planner for **Hasura + Postgres**, built with **Svelte**.

Transformer connects to any Hasura GraphQL endpoint, reverse-engineers an existing Postgres schema into an interactive ER-style diagram, lets you redesign it visually (or as code), and generates the SQL to make it real. Alongside the schema editor, a "pseudo blocks" workspace lets you sketch the queries, triggers and UI components of your app and link them together — a planning scratchpad that sits between a napkin sketch and the actual implementation.

<!-- Add screenshots in docs/ and uncomment:
<p align="center">
  <img src="docs/screenshot-schema.png" width="800" alt="Schema editor" />
  <br><em>Schema editor: drag tables, draw foreign keys, edit the DBML-style DSL side by side</em>
</p>
<p align="center">
  <img src="docs/screenshot-graph.png" width="800" alt="Pseudo block graph" />
  <br><em>Pseudo blocks visualized as a linked graph</em>
</p>
-->

## Features

### Schema editor

- **Reverse-engineer an existing database** — pulls a schema-only `pg_dump` through Hasura's API, parses the SQL, and lays out all tables and relationships as a draggable diagram
- **Visual editing** — create tables, add/rename/retype fields, mark primary keys, and draw foreign keys between fields directly on the diagram
- **Three working modes** — `create` (design from scratch), `edit` (design a modified version of the existing schema) and `migration` — with snapshot save/restore for each
- **SQL generation** — export a full `CREATE TABLE` script, or in edit mode export just the **diff as `ALTER TABLE` migrations**
- **DBML-style DSL editor** — a Monaco code panel that mirrors the diagram in a `Table users { id uuid [pk] }` syntax; edit the text, hit `Ctrl`, and the diagram updates (and vice versa)
- **JSON import/export** of the whole schema model
- **Trigger diagram** — a second layout (`Ctrl+P`) that arranges tables by their triggers instead of their relations

### Pseudo blocks (app-logic planner)

- Sketch **queries, table/query/cron triggers and UI components** as small text cards
- Link blocks to each other (with automatic backlinks) and jump between them via URL routes like `/{schema}/pseudo/query/{block}`
- **Graph view** of the whole plan (force-directed layout via cytoscape) — `if` blocks render as diamonds, plain blocks as colored circles per type
- Auto-saves to the backend with debounced diffs (only the changed blocks are sent)

### Auth & projects

- Google sign-in via Firebase (`hasurafire` — Firebase auth wired into a Hasura GraphQL backend)
- Projects and schemas live in a central backend, so you can share a schema by simply sharing its URL (`/{schema_id}/`)

## Tech stack

| | |
|---|---|
| [Svelte 3](https://svelte.dev) | UI framework, everything is a component |
| [Cytoscape.js](https://js.cytoscape.org) + [fCoSE](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) | pseudo-block graph rendering & layout |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | DSL/code editor panel |
| [page.js](https://github.com/visionmedia/page.js) | client-side routing |
| [hasurafire](https://www.npmjs.com/package/hasurafire) | Firebase auth + Hasura GraphQL client |
| Webpack 4 | bundling |

## Getting started

```bash
git clone https://github.com/imsamtar/transformer.git
cd transformer
npm install
npm run dev        # http://localhost:8080
```

`npm run build` produces a static production bundle in `public/`.

> The app is a pure frontend — it talks to Firebase and to Hasura endpoints you configure. There is no server code in this repo.

### Configuration

All backend configuration lives in `src/config/index.js`. Fill in your own values before running:

1. **Firebase** — create a project in the [Firebase console](https://console.firebase.google.com), enable Google sign-in, and paste the web app credentials into `firebaseConfig`.
2. **Backend endpoint** — point `endpoint` at the Hasura instance that stores users, projects and pseudo blocks (see below).

### Backend (Hasura) requirements

The central backend is a Hasura GraphQL Engine instance whose tracked tables make up the `transformer` schema (rename by changing `schema` in the config; queries interpolate it via `%s`):

| Table | Columns | Purpose |
|---|---|---|
| `*_user` | `username`, `email` | registered users (created on first sign-in) |
| `*_project` | `project_name`, `endpoint`, `admin_secret`, `admin` | a Hasura app you manage — endpoint + admin secret + owner uid |
| `*_schema` | `schema_name`, `project_id` | a Postgres schema within a project |
| `*_pseudo_block` | `type`, `project_id`, `text` (jsonb) | pseudo blocks (`pseudo_query`, `component`, `trigger/table`, `trigger/query`, `trigger/cron`, `if`) |

The exact queries/mutations used by the frontend are listed in `src/config/index.js`. Set up relationships (`project.schemas`, `project.pseudo_blocks`) and restrict `select`/`update`/`delete` permissions to the row owner (`admin` = Firebase uid). The `admin_secret` column is sensitive — never expose it to users other than the owner.

To edit a real database, the app also calls two admin endpoints **of the target project's** Hasura instance: `/v1alpha1/pg_dump` (to pull the schema) and `/v1/query` (to export metadata). These run with the admin secret stored for that project.

## Keyboard shortcuts

### Schema view

| Shortcut | Action |
|---|---|
| `Shift+Ctrl+A` | new table |
| `Ctrl+B` | toggle DSL editor panel |
| `Ctrl+P` | switch diagram (relations ↔ triggers) |
| `Ctrl+1` / `Ctrl+2` / `Ctrl+3` | switch mode: create / edit / migration |
| `Ctrl+Alt+1` / `Ctrl+Alt+2` / `Ctrl+Alt+3` | save snapshot for that mode |
| `Ctrl+S` | save current snapshot |
| `Ctrl+O` | download SQL for current mode (edit mode exports the diff) |
| `Ctrl+E` | export schema as JSON |
| `Ctrl+I` | import schema JSON |
| `Ctrl+Alt+←` / `Ctrl+Alt+→` | move between schema and pseudo-block pages |
| `Ctrl+Delete` | reset local app state |

### DSL editor

| Shortcut | Action |
|---|---|
| `Ctrl` (released in editor) | apply DSL changes to the diagram |

### Pseudo-block graph

| Shortcut | Action |
|---|---|
| `Alt+A` | add a new block |
| Click | open block in the side editor |
| `Ctrl+click` | open the block's page |
| `Ctrl+Shift+click` | link / unlink two blocks |
| `Alt+click` | delete block |
| `Shift+hover` | preview full block text |

## Project structure

```
src/
├── config/          # Firebase + backend endpoint + all GraphQL queries
├── stores/          # Svelte stores: tables model, blocks, routing (page.js)
│   └── definations/ # Table / field / trigger model classes
├── components/      # Diagram pieces: Table, Field, links, blocks, editor
├── pages/           # Route pages: Graph, Query, Trigger*, Component
├── helpers/
│   ├── parseSQL.js  # pg_dump SQL → table model
│   ├── sql/         # table model → CREATE/ALTER SQL, diff → migration
│   └── syntax/      # table model ↔ DBML-style DSL
├── App.svelte       # auth shell + router
├── Main.svelte      # schema editor view
└── Dashboard.svelte # project/schema picker
```

## License

[MIT](LICENSE)
