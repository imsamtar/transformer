<script>
  import tables, { mode } from "./stores/tables";
  import Table from "./components/Table.svelte";
  import Menu from "./components/Menu.svelte";
  import Link from "./components/Link/Link.svelte";
  import { createTable } from "./helpers/table";
  import { menus } from "./stores/menus";
  import { mouseMove, touchStart, touchMove } from "./helpers/navigate.js";
  import Editor, { render, editorElement } from "./components/Editor.svelte";

  let editor = !!JSON.parse(localStorage.getItem("editor"));

  function mainMenu(e) {
    $menus.pos = [e.x, e.y];
    if (!$menus.shown) $menus.shown = "main";
  }

  function keyup(e) {
    if (e.shiftKey && e.ctrlKey && e.key.toLowerCase() === "a") {
      tables.createTable("", {
        pos: [300, 200]
      });
      e.preventDefault();
    } else if (e.ctrlKey && e.key.toLowerCase() === "b") {
      editor = !editor;
    }
  }
  function schema({ schema }) {
    return schema === "public" ? "" : `"${schema}".`;
  }
  function toSQL(_tables, options = {}) {
    let schema_name = "public";
    let sql = "";
    _tables.forEach(table => {
      schema_name = options.schema || table.schema;
      sql += `\nCREATE TABLE ${schema({ schema: schema_name })}"${
        table.name
      }" (${table.fields.map((f, i) => {
        return `\n  "${f.name}" ${f.type.toUpperCase()}${f.constraints.reduce(
          (r, c) => `${r} ${c.toUpperCase()}`,
          ""
        )}`;
      })},\n  PRIMARY KEY (${table.fields
        .filter(f => f.pk)
        .map(f => `"${f.name}"`)})
);\n`;
    });
    _tables.forEach(table => {
      table.fields.forEach(f => {
        let statement = "";
        if (f.ref) {
          const refTable = (options.tables || _tables).find(
            t => t.id === f.ref.table
          );
          const refField =
            refTable && refTable.fields.find(fd => fd.id === f.ref.field);
          if (refField)
            statement += `\nALTER TABLE ${schema({ schema: schema_name })}"${
              table.name
            }" ADD FOREIGN KEY ("${f.name}") REFERENCES ${schema({
              schema: schema_name
            })}"${refTable.name}" ("${refField.name}");\n`;
        }
        sql += statement;
      });
    });
    return { sql, schema_name };
  }
  function keydown(e) {
    if (e.ctrlKey && e.key.toLowerCase() === "e") {
      e.preventDefault();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([tables.toString()], { type: "application/json" })
      );
      link.download = "config.json";
      link.click();
    } else if (e.key === "i" && e.ctrlKey) {
      const choosefile = document.createElement("input");
      choosefile.type = "file";
      choosefile.click();
      choosefile.onchange = async function(e) {
        tables.fromJSON(JSON.parse(await choosefile.files[0].text()));
      };
    } else if (e.key === "s" && e.ctrlKey) {
      e.preventDefault();
      localStorage.setItem(`${$mode}_tables`, tables.toString());
    } else if (e.key === "o" && e.ctrlKey && $mode === "create") {
      e.preventDefault();
      let { sql, schema_name } = toSQL(tables.toJSON());

      if (schema_name !== "public")
        sql = `CREATE SCHEMA IF NOT EXISTS "${schema_name}";\n${sql}`;
      sql = sql[0] === "\n" ? sql.substr(1) : sql;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([sql], { type: "application/text" })
      );
      link.download = `${schema_name}_${Date.now()}.sql`;
      link.click();
    } else if (e.key === "o" && e.ctrlKey && $mode === "edit") {
      e.preventDefault();
      let sql = "";
      let schema_name = "public";
      const otables = JSON.parse(localStorage.getItem("create_tables"));
      const etables = tables.toJSON();
      etables.forEach(etable => {
        const otable = otables.find(otable => otable.id === etable.id);
        if (otable) {
          schema_name = otable.schema;
          etable.fields.forEach(efield => {
            const ofield = otable.fields.find(
              ofield => ofield.id === efield.id
            );
            if (!ofield) {
              sql += `ALTER TABLE ${schema({ schema: schema_name })}"${
                otable.name
              }" ADD "${efield.name}" ${efield.type.toUpperCase()}${
                efield.pk ? " PRIMARY KEY" : ""
              }${efield.constraints.reduce(
                (r, c) => `${r} ${c.toUpperCase()}`,
                ""
              )};\n`;
            }
          });
        } else {
          sql += toSQL([etable], { schema: schema_name, tables: otables }).sql;
        }
      });
      if (sql) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(
          new Blob([sql], { type: "application/text" })
        );
        link.download = `${schema_name}_edit_${Date.now()}.sql`;
        link.click();
      }
    } else if (e.key === "o" && e.ctrlKey && $mode === "migration") {
      e.preventDefault();
      let { sql, schema_name } = toSQL(tables.toJSON());

      if (schema_name !== "public")
        sql = `CREATE SCHEMA IF NOT EXISTS "${schema_name}";\n${sql}`;
      sql = sql[0] === "\n" ? sql.substr(1) : sql;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([sql], { type: "application/text" })
      );
      link.download = `${schema_name}_${Date.now()}.sql`;
      link.click();
    } else if (e.ctrlKey && !e.altKey) {
      switch (e.key) {
        case "1":
          e.preventDefault();
          $mode = "create";
          break;
        case "2":
          e.preventDefault();
          $mode = "edit";
          break;
        case "3":
          e.preventDefault();
          $mode = "migration";
          break;
      }
    } else if (e.ctrlKey && e.altKey) {
      switch (e.key) {
        case "1":
          e.preventDefault();
          localStorage.setItem("create_tables", tables.toString());
          break;
        case "2":
          e.preventDefault();
          localStorage.setItem("edit_tables", tables.toString());
          break;
        case "3":
          e.preventDefault();
          localStorage.setItem("migration_tables", tables.toString());
          break;
      }
    }
  }
  function switchMode() {
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
  $: switchMode($mode);

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
  on:contextmenu|preventDefault={mainMenu}
  on:mousemove={mouseMove}
  on:touchmove={touchMove}
  on:touchstart={touchStart}
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
