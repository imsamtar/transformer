<script>
  import { selected_trigger as sel_trigger } from "../../stores/triggers";
  import { menus } from "../../stores/menus";
  import LinkedTo from "./LinkedTo.svelte";

  export let trigger;
  export let selected_trigger;
  let cx, cy, hov;

  $: table = $trigger.table;
  function mouseover(event) {
    $table.active = true;
    $trigger.active = true;
  }
  function mouseleave(event) {
    $table.active = false;
    $trigger.active = false;
  }
  function mousedown(event) {
    selected_trigger = trigger;
  }
  function mouseup(event) {
    selected_trigger = null;
  }
  function contextmenu(event) {
    selected_trigger = null;
    $menus.details = trigger;
    $menus.shown = "trigger";
  }
  function click(event) {
    if (event.ctrlKey && event.shiftKey) {
      if ($sel_trigger) $sel_trigger = null;
      else $sel_trigger = trigger;
    } else if (event.altKey) {
      $table.active = false;
      trigger.remove();
    }
  }

  $: cx = $table.pos[0] + $trigger.pos[0];
  $: cy = $table.pos[1] + $trigger.pos[1];
</script>

<style>
  path {
    stroke: var(--trigger-bg);
    mix-blend-mode: darken;
    stroke-width: 5;
    fill: none;
  }
  path:hover,
  path.active {
    stroke: var(--path-active);
    --path-z-index: var(--path-z-index-active) !important;
    opacity: 1 !important;
  }
  circle {
    cursor: grab;
    stroke: var(--trigger-bg);
    stroke-width: 5;
  }
  circle.overlay {
    fill: #00000000;
    stroke: none;
  }
  circle.dragable {
    cursor: grabbing;
  }
  circle.active {
    stroke: var(--trigger-bg-active);
  }
  text {
    fill: var(--table-bg);
    font-weight: 600;
    font-family: Arial, Helvetica, sans-serif;
    user-select: none;
  }
  text.active {
    fill: var(--table-bg-active);
  }
</style>

<path
  on:click={click}
  class:active={$table.active}
  d={`M${cx} ${cy} L${$table.pos[0] + 250} ${$table.pos[1] + 25}`} />

{#each Array.from($trigger.affectedTables) as linked_table}
  <LinkedTo
    table={linked_table}
    {trigger}
    {cx}
    {cy}
    r={Math.max($trigger.name.length * 6, 45)}
    bind:hover={hov}
    active={$trigger.active} />
{/each}

<circle
  class:active={$table.active || hov}
  {cx}
  {cy}
  r={Math.max($trigger.name.length * 6, 30)}
  fill="#eee"
  on:mousedown={mousedown} />

<text
  class:active={$table.active || hov}
  x={cx}
  y={cy}
  fill="black"
  dy=".3em"
  text-anchor="middle"
  contenteditable="true">
  {$trigger.name}
</text>

<circle
  class="overlay"
  class:dragable={selected_trigger}
  on:mousedown={mousedown}
  on:mouseover={mouseover}
  on:mouseleave={mouseleave}
  on:mouseup={mouseup}
  on:contextmenu={contextmenu}
  on:click={click}
  {cx}
  {cy}
  r={Math.max($trigger.name.length * 6, 45)}
  on:mousedown={mousedown} />
