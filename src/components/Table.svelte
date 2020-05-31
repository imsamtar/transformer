<script>
  import { onMount } from "svelte";
  import { menus } from "../stores/menus";
  import Field from "./Field.svelte";
  export let table;

  let autofocus = false;
  let element;

  onMount(() => (autofocus = true));

  function mouseover(e) {
    $table.active = true;
    $table.fields.forEach(f => {
      if (f.self.ref) {
        f.self.ref.self.table.update(_table => {
          _table.hover = true;
          return _table;
        });
      }
      f.refBy().forEach(({ self }) =>
        self.table.update(_table => {
          _table.hover = true;
          return _table;
        })
      );
    });
  }
  function mouseleave(e) {
    $table.active = false;
    $table.fields.forEach(f => {
      if (f.self.ref) {
        f.self.ref.self.table.update(_table => {
          _table.hover = false;
          return _table;
        });
      }
      f.refBy().forEach(({ self }) =>
        self.table.update(_table => {
          _table.hover = false;
          return _table;
        })
      );
    });
  }

  let offset = [0, 0];
  $: tables = $table.tables;

  function keyup(e) {
    if (e.key.toLowerCase() === "enter") {
      table.createField("");
      const last = element.offsetTop + element.offsetHeight;
      if (last > innerHeight - 100)
        $tables.forEach(_table => {
          _table.self = {
            ..._table.self,
            pos: [
              _table.self.pos[0],
              _table.self.pos[1] - last - 100 + innerHeight
            ]
          };
        });
      e.preventDefault();
    }
  }
  function click(e) {
    if (e.altKey) table.remove();
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
  class:active={$table.hover}
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
  <h3>
    <input type="text" bind:value={$table.name} />
  </h3>
  {#each $table.fields as field}
    <Field {field} />
  {/each}
</div>
