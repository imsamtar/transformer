<script>
  import { onDestroy } from "svelte";
  export let cx, cy;
  export let table;
  export let trigger;
  export let active;
  export let hover;

  const random = 50 + Math.random() * 200;

  function click(event) {
    if (event.altKey) {
      trigger.update(trigger => {
        trigger.affectedTables.delete(table);
        return trigger;
      });
    }
  }

  onDestroy(() => ($table.hover = false));

  $: pos = [$table.pos[0] - cx, $table.pos[1] - cy];
  $: $table.hover = active;
  $: hover = $table.hover;
</script>

<style>
  path {
    stroke: var(--trigger-bg);
    mix-blend-mode: darken;
  }
  path:hover,
  path.active {
    stroke: var(--trigger-bg-active);
    --path-z-index: var(--path-z-index-active) !important;
    opacity: 1 !important;
  }
</style>

<path
  class:active={$table.hover || active}
  on:click={click}
  marker-mid="url(#arrow)"
  d={`M${cx} ${cy} L${$table.pos[0] + 10} ${$table.pos[1] + 25}`}
  fill="none"
  stroke-width="5" />
