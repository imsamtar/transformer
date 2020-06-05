<script context="module">
  import { writable } from "svelte/store";
  export const project_opened = writable(false);
</script>

<script>
  import Welcome from "./Welcome.svelte";
  import Main from "./Main.svelte";
  import tables from "./stores/tables";

  function keyup(e) {
    if (e.key.toLowerCase() === "delete" && e.ctrlKey) {
      e.preventDefault();
      localStorage.clear();
      $project_opened = false;
      $tables = [];
    }
  }

  if (localStorage.getItem("create_tables")) {
    $project_opened = true;
  }
</script>

<svelte:window on:keyup={keyup} />

{#if !$project_opened}
  <Welcome />
{:else}
  <Main />
{/if}
