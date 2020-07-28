<script>
  import { onMount } from "svelte";
  import tables, { mode } from "./stores/tables";
  import { menus } from "./stores/menus";
  import Table from "./components/Table.svelte";
  import Menu from "./components/Menu.svelte";
  import Link from "./components/Link/Link.svelte";
  import Triggers from "./components/Triggers/Triggers.svelte";
  import { main_menu } from "./stores/index";
  import { key_shortcut, download_file } from "./helpers/events/index";
  import to_sql from "./helpers/sql/to_sql";
  import changes_to_sql from "./helpers/sql/changes_to_sql";
  import { mouse_move, touch_start, touch_move } from "./helpers/navigate.js";
  import Editor, { render, editorElement } from "./components/Editor.svelte";
  import { editor_mode } from "./helpers/editor/index";

  let editor = !!JSON.parse(localStorage.getItem("editor"));
  let width;
  let diagram = "relation";
  export let schema_id;

  onMount(() => setTimeout(() => ($tables = $tables), 10));

  function click(event) {
    $menus.shown = null;
    if ($editor_mode.mode !== "schema" && event.target.tagName === "svg") {
      $editor_mode = { mode: "schema", language: "sql", tables };
      $tables = $tables;
    }
  }

  function keyup(event) {
    key_shortcut("!a:sc", event, () =>
      tables.createTable("", {
        pos: [300, 200]
      })
    );
    key_shortcut("!b:c", event, () => (editor = !editor));
    if (event.ctrlKey && event.altKey) {
      if (event.key === "ArrowLeft") {
        goto(`/${schema_id}/pseudo/query/`);
      } else if (event.key === "ArrowRight") {
        goto(`/${schema_id}/pseudo/trigger/table/`);
      }
    }
  }

  function keydown(event) {
    key_shortcut("!b:c", event, () => {});
    key_shortcut("!p:c", event, () => {
      const diagram_modes = ["relation", "trigger"];
      let next_index = diagram_modes.findIndex(dm => dm === diagram) + 1;
      next_index %= diagram_modes.length;
      diagram = diagram_modes[next_index];
    });
    key_shortcut("!e:c", event, () => {
      download_file(tables.toString("  "), `config_${Date.now()}.json`, {
        type: "application/json"
      });
    });
    key_shortcut("!i:c", event, () => {
      const choosefile = document.createElement("input");
      choosefile.type = "file";
      choosefile.click();
      choosefile.onchange = async function(e) {
        tables.fromJSON(JSON.parse(await choosefile.files[0].text()));
      };
    });
    key_shortcut("!s:c", event, () => {
      localStorage.setItem(`${$mode}_tables`, tables.toString());
    });
    key_shortcut("!1:c", event, () => ($mode = "create"));
    key_shortcut("!2:c", event, () => ($mode = "edit"));
    key_shortcut("!3:c", event, () => ($mode = "migration"));

    key_shortcut("!1:ca", event, () =>
      localStorage.setItem("create_tables", tables.toString())
    );
    key_shortcut("!2:ca", event, () =>
      localStorage.setItem("edit_tables", tables.toString())
    );
    key_shortcut("!3:ca", event, () =>
      localStorage.setItem("migration_tables", tables.toString())
    );
    key_shortcut("!o:c", event, () => {
      let { sql, schema_name } = to_sql(tables.toJSON());
      if (schema_name !== "public")
        sql = `CREATE SCHEMA IF NOT EXISTS "${schema_name}";\n${sql}`;
      sql = sql[0] === "\n" ? sql.substr(1) : sql;
      switch ($mode) {
        case "create":
          download_file(sql, `${schema_name}_${Date.now()}.sql`, {
            type: "application/text"
          });
          break;
        case "edit":
          let { sql: esql, schema } = changes_to_sql(
            JSON.parse(localStorage.getItem("create_tables")),
            tables.toJSON()
          );
          download_file(esql, `${schema}_edit_${Date.now()}.sql`, {
            type: "application/text"
          });
          break;
        case "migration":
          download_file(sql, `${schema_name}_${Date.now()}.sql`, {
            type: "application/text"
          });
          break;
      }
    });
  }

  export function switch_mode() {
    if (!editor || $editorElement) {
      switch ($mode) {
        case "create":
          if (!localStorage.getItem("create_tables"))
            localStorage.setItem("create_tables", "[]");
          $tables = tables
            .fromJSON(JSON.parse(localStorage.getItem("create_tables")))
            .read();
          break;
        case "edit":
          if (!localStorage.getItem("edit_tables"))
            localStorage.setItem("edit_tables", tables.toString());
          $tables = tables
            .fromJSON(JSON.parse(localStorage.getItem("edit_tables")))
            .read();
          break;
        case "migration":
          if (!localStorage.getItem("migration_tables"))
            localStorage.setItem("migration_tables", tables.toString());
          $tables = tables
            .fromJSON(JSON.parse(localStorage.getItem("migration_tables")))
            .read();
          break;
      }
    }
  }
  $: switch_mode($mode);

  const saved = localStorage.getItem(`${$mode}_tables`);

  saved && tables.fromJSON(JSON.parse(saved));
  $: localStorage.setItem("editor", editor);
</script>

<style>
  main > button {
    position: absolute;
    right: 2rem;
    bottom: 2rem;
    padding: 1rem;
    font-size: 1rem;
    border: 0;
    outline: none;
    background: var(--table-bg);
    color: white;
    border-radius: 10px;
    box-shadow: 2px 2px 10px var(--table-bg);
    font-weight: bold;
    z-index: calc(var(--table-z-index) + 2);
  }
  button.active {
    background: var(--table-bg-active);
  }
  #mode {
    position: relative;
    top: 10px;
    left: 10px;
    align-self: left;
    font-weight: bold;
    border-radius: 0.2rem;
    background: #eee;
    color: #666;
    padding: 0.3rem;
    display: inline-block;
    width: 1rem;
    text-align: center;
    z-index: calc(var(--table-z-index) + 2);
  }
</style>

<svelte:window on:keyup={keyup} on:keydown={keydown} on:click={click} />

{#if editor}
  <Editor bind:width />
{/if}

<main
  on:contextmenu|preventDefault={main_menu}
  on:mousemove={mouse_move}
  on:touchmove={touch_move}
  on:touchstart={touch_start}
  style="width: {editor ? 100 - width : 100}%;">
  {#if diagram === 'relation'}
    <Link {tables} />
  {:else if diagram === 'trigger'}
    <Triggers />
  {/if}
  {#each $tables as table}
    <Table {table} {diagram} />
  {/each}
  <Menu />
  <button class:active={editor} on:click={() => (editor = !editor)}>
    &lt;/&gt;
  </button>
  <span id="mode">{$mode[0]}</span>
</main>
