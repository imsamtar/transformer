<script>
  import Trigger from "./Trigger.svelte";
  export let table;
  export let selected_trigger;
</script>

{#each Array.from($table.triggers) as trigger}
  <Trigger {trigger} bind:selected_trigger />
{/each}
