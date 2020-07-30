<script>
  import Blocks from "../components/Blocks.svelte";

  let type = "query";
  export let schema_id = undefined;
  export let block_id = undefined;
  export let focus_type;
</script>

<Blocks {type} {schema_id} bind:block_id {focus_type} right="schema" />
