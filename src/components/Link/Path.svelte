<script>
  import FLink from "./FLink.svelte";
  export let table;
  $: active = $table.active;
</script>

{#each $table.fields as field}
  <FLink {field} {active} />
{/each}
