<script>
  import tables from "./stores/tables";
  import Table from "./components/Table.svelte";
  import Menu from "./components/Menu.svelte";
  import Link from "./components/Link/Link.svelte";
  import { createTable } from "./helpers/table";
  import { menus } from "./stores/menus";
  import { mouseMove, touchStart, touchMove } from "./helpers/navigate.js";
  import Editor from "./components/Editor.svelte";

  let editor = true;

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
    }
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
      localStorage.setItem("tables", tables.toString());
    } else if (e.key === "o" && e.ctrlKey) {
      e.preventDefault();
      let _sql = "";
      let _tables = tables.toJSON();
      _tables.forEach(table => {
        let statement = `CREATE TABLE ${table.name}(${table.fields.map(
          (f, i) =>
            `${i ? " " : ""}${f.name} VARCHAR${f.pk ? " PRIMARY KEY" : ""}`
        )});`;
        _sql += statement + "\n";
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([_sql], { type: "application/text" })
      );
      link.download = "tables.sql";
      link.click();
    }
  }
  function toggleEditor(e) {
    editor = !editor;
  }

  const saved = localStorage.getItem("tables");

  tables.fromJSON(JSON.parse(saved));
  // const user = createTable("User", { pos: [600, 500] });
  // user.createField("user_id", { pk: true });
  // user.createField("username");
  // user.createField("email");
  // user.createField("secret");
  // const calendar = createTable("Calendar", { pos: [100, 100] });
  // calendar.createField("id", { pk: true });
  // calendar.createField("name");
  // calendar.createField("description");
  // calendar.createField("created_by", { ref: $user.fields[0] });
  // const event = createTable("Event", { pos: [1500, 100] });
  // event.createField("event_id", { pk: true });
  // event.createField("event_name");
  // event.createField("description");
  // event.createField("calendar", { ref: $calendar.fields[0], refType: "1to*" });
  // event.createField("user", { ref: $user.fields[0] });
  // user.createField("calendar1", { ref: $calendar.fields[0], refType: "0to*" });
</script>

<style>
  main {
    text-align: center;
    background: var(--bg);
    width: 50%;
  }
  main > button {
    position: absolute;
    right: 2rem;
    bottom: 2rem;
    padding: 1rem;
    font-size: 1rem;
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
  on:touchstart={touchStart}>
  <Link {tables} />
  {#each $tables as table}
    <Table {table} />
  {/each}
  <Menu />
  <button on:click={toggleEditor}>Toggle editor</button>
</main>
