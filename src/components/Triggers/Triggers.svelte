<script>
  import tables from "../../stores/tables";
  import TableTriggers from "./TableTriggers.svelte";

  let selected_trigger = null;

  function mousemove(event) {
    if (selected_trigger) {
      $selected_trigger.pos[0] +=
        event.clientX -
        ($selected_trigger.pos[0] + $selected_trigger.table.self.pos[0]);
      $selected_trigger.pos[1] +=
        event.clientY -
        ($selected_trigger.pos[1] + $selected_trigger.table.self.pos[1]);
    }
  }
  function mouseup(event) {
    selected_trigger = null;
  }
</script>

<style>
  svg {
    width: 100%;
    height: 100%;
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>

<svg on:mousemove={mousemove} on:mouseup={mouseup}>
  {#each $tables as table}
    <TableTriggers {table} bind:selected_trigger />
  {/each}
</svg>
