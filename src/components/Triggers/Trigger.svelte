<script>
  import tables from "../../stores/tables";
  import { menus } from "../../stores/menus";

  export let trigger;
  export let selected_trigger;
  let cx, cy;

  let dragable = false;
  $: table = $trigger.table;

  function mousedown(event) {
    selected_trigger = trigger;
  }
  function contextmenu(event) {
    selected_trigger = null;
    $menus.details = trigger;
    $menus.shown = "trigger";
  }
  function click(event) {
    if (event.altKey) {
      $table.active = false;
      trigger.remove();
    }
  }

  $: cx = $table.pos[0] + $trigger.pos[0];
  $: cy = $table.pos[1] + $trigger.pos[1];
</script>

<style>
  circle.dragable {
    cursor: move;
  }
  circle.active {
    stroke: var(--table-bg-active);
  }
  text {
    font-size: 1.08rem;
    font-family: Arial, Helvetica, sans-serif;
    user-select: none;
  }
</style>

<path
  class:active={$table.active}
  on:mouseover={() => ($table.active = true)}
  on:mouseleave={() => ($table.active = false)}
  d="M {cx}
  {cy} L {$table.pos[0] + 125}
  {$table.pos[1] + 25}"
  stroke="var(--table-bg)"
  stroke-width="12" />

<circle
  class:active={$table.active}
  class:dragable
  on:mouseover={() => ($table.active = true)}
  on:mouseleave={() => ($table.active = false)}
  on:contextmenu={contextmenu}
  on:click={click}
  {cx}
  {cy}
  r={Math.max($table.name.length * 12, 60)}
  fill="#eee"
  stroke="var(--table-bg)"
  stroke-width="12"
  draggable="true"
  on:mousedown={mousedown}>
  <text fill="red">Hello</text>
</circle>

<text
  on:contextmenu={contextmenu}
  on:click={click}
  x={cx}
  y={cy}
  fill="black"
  dy=".3em"
  text-anchor="middle"
  contenteditable="true">
  {$trigger.name}
</text>
