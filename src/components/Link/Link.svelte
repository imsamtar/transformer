<script>
  import Path from "./Path.svelte";
  export let tables;
</script>

<style>
  :global(svg.active) {
    --path: var(--path-active) !important;
  }
</style>

<svg style="position:absolute;left:0;top: 0;" width="100%" height="100%">
  {#each $tables as table}
    <Path {table} />
  {/each}
</svg>
