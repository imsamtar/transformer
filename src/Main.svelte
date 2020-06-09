<script>
  import { onMount } from "svelte";
  import tables, { mode } from "./stores/tables";
  import Table from "./components/Table.svelte";
  import Menu from "./components/Menu.svelte";
  import Link from "./components/Link/Link.svelte";
  import { createTable } from "./helpers/table";
  import { main_menu } from "./stores/index";
  import { key_shortcut, download_file } from "./helpers/events/index";
  import to_sql from "./helpers/sql/to_sql";
  import changes_to_sql from "./helpers/sql/changes_to_sql";
  import { mouse_move, touch_start, touch_move } from "./helpers/navigate.js";
  import Editor, { render, editorElement } from "./components/Editor.svelte";

  let editor = !!JSON.parse(localStorage.getItem("editor"));

  onMount(() => setTimeout(() => ($tables = $tables), 10));

  function keyup(event) {
    key_shortcut("!a:sc", event, () =>
      tables.createTable("", {
        pos: [300, 200]
      })
    );
    key_shortcut("!b:c", event, () => (editor = !editor));
  }

  function keydown(event) {
    key_shortcut("!b:c", event, () => {});
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

<svelte:window on:keyup={keyup} on:keydown={keydown} />

{#if editor}
  <Editor />
{/if}

<main
  on:contextmenu|preventDefault={main_menu}
  on:mousemove={mouse_move}
  on:touchmove={touch_move}
  on:touchstart={touch_start}
  style="width: {editor ? 70 : 100}%;">
  <Link {tables} />
  {#each $tables as table}
    <Table {table} />
  {/each}
  <Menu />
  <button class:active={editor} on:click={() => (editor = !editor)}>
    &lt;/&gt;
  </button>
  <span id="mode">{$mode[0]}</span>
</main>
