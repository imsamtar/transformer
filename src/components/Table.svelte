<script>
  import { onMount } from "svelte";
  import { menus } from "../stores/menus";
  import Field from "./Field.svelte";
  import { editorElement } from "./Editor.svelte";
  import render from "../helpers/editor/render";
  import { key_shortcut } from "../helpers/events/index";
  import { selected_trigger } from "../stores/triggers";
  export let table;
  export let diagram;

  let table_name;
  let element;

  onMount(() => {
    if (
      table_name.offsetLeft + table_name.offsetParent.offsetLeft + 200 <
        innerWidth &&
      table_name.offsetTop + table_name.offsetParent.offsetTop + 50 <
        innerHeight
    )
      table_name.focus();
  });

  function mouseover(e) {
    $table.active = $table.hover = true;
    if (diagram === "relation")
      $table.fields.forEach((f) => {
        if (f.self.ref) {
          f.self.ref.self.table.update((_table) => {
            _table.hover = true;
            return _table;
          });
        }
        f.refBy().forEach(({ self }) =>
          self.table.update((_table) => {
            _table.hover = true;
            return _table;
          })
        );
      });
  }
  function mouseleave(e) {
    $table.active = $table.hover = false;
    $table.fields.forEach((f) => {
      if (f.self.ref) {
        f.self.ref.self.table.update((_table) => {
          _table.hover = false;
          return _table;
        });
      }
      f.refBy().forEach(({ self }) =>
        self.table.update((_table) => {
          _table.hover = false;
          return _table;
        })
      );
    });
  }

  let offset = [0, 0];
  $: tables = $table.tables;

  function keyup(event) {
    key_shortcut("enter", event, (event) => {
      if (!event.target.value) return;
      const fieldIndex = $table.fields
        .map((field) => field.self)
        .findIndex((f) => f.name === event.target.value);
      table.createField(
        "",
        {
          type: $table.fields.length ? "text" : "serial",
          pk: !$table.fields.length,
          constraints: ["not null"],
        },
        fieldIndex == -1 ? undefined : fieldIndex + 1
      );
      if (fieldIndex > -1) {
        const el = element.querySelector(
          `div:nth-child(${3 + fieldIndex}) input`
        );
        setTimeout(() => el && el.focus(), 5);
      }
      const last = element.offsetTop + element.offsetHeight;
      if (last > innerHeight - 100)
        $tables.forEach((_table) => {
          _table.self = {
            ..._table.self,
            pos: [
              _table.self.pos[0],
              _table.self.pos[1] - last - 100 + innerHeight,
            ],
          };
        });
    });
  }
  function click(e) {
    if ($selected_trigger) {
      $selected_trigger.update((trigger) => {
        if (trigger.affectedTables.has(table)) {
          trigger.affectedTables.delete(table);
        } else {
          trigger.affectedTables = trigger.affectedTables;
          trigger.affectedTables.add(table);
        }
        return trigger;
      });
      $selected_trigger = null;
    } else if (e.altKey) table.remove();
  }
  function contextmenu(e) {
    $menus.details = table;
    $menus.shown = "table";
  }
  function update() {
    $table.element.style.left = `${$table.pos[0]}px`;
    $table.element.style.top = `${$table.pos[1]}px`;
  }
  function dragStart(e) {
    offset = [e.offsetX, e.offsetY];
  }
  function dragEnd(e) {
    $table.pos[0] = e.clientX - offset[0];
    $table.pos[1] = e.clientY - offset[1];
  }
  $: {
    $table.element = element;
    $table.element === element;
    $editorElement && render($editorElement)();
  }
</script>

<style>
  .table {
    border-radius: 0;
    overflow: hidden;
    z-index: var(--table-z-index);
    background: var(--table-bg);
    width: 250px;
    position: absolute;
    user-select: none;
    border: var(--table-margin) solid var(--table-bg);
  }
  .table:hover,
  :global(.table.active) {
    --table-bg: var(--table-bg-active);
    z-index: calc(var(--table-z-index) + var(--active-bonus)) !important;
  }
  h3 {
    cursor: grab;
    margin: calc(var(--table-margin) * 2) 0;
    text-align: center;
  }
  h3 > input {
    border: 0;
    outline: 0;
    text-align: center;
    font-size: 1.3rem;
    width: 150px;
    background: transparent;
    font-weight: 600;
    color: var(--table-text);
  }
</style>

<div
  class="table"
  class:active={$table.hover || $table.active}
  bind:this={element}
  draggable="true"
  on:dragstart={dragStart}
  on:dragend={dragEnd}
  on:keyup={keyup}
  on:click={click}
  on:contextmenu={contextmenu}
  on:mouseover={mouseover}
  on:mouseleave={mouseleave}
  style="left: {$table.pos[0]}px;top: {$table.pos[1]}px">
  <h3><input type="text" bind:value={$table.name} bind:this={table_name} /></h3>
  {#each $table.fields as field}
    <Field {field} />
  {/each}
</div>
