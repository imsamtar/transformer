<script context="module">
  import { writable } from "svelte/store";
  export const project_opened = writable(false);
</script>

<script>
  import { Root, User, SaveUser, signOut } from "hasurafire";
  import Welcome from "./Welcome.svelte";
  import Main from "./Main.svelte";
  import tables from "./stores/tables";
  import Signin from "./Signin.svelte";
  import config from "./config/index";

  function keyup(e) {
    if (e.key.toLowerCase() === "delete" && e.ctrlKey) {
      e.preventDefault();
      localStorage.clear();
      $project_opened = false;
      $tables = [];
    }
  }

  $: $project_opened = !!localStorage.getItem("create_tables");
</script>

<style>
  main {
    background: #00000099;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: white;
  }
</style>

<svelte:window on:keyup={keyup} />

<Root {...config}>
  <User let:user={{ email }} let:needToSave>
    {#if needToSave}
      <SaveUser
        mutation="insertUser"
        variables={{ email, username: email.split('@')[0] }}
        on:error={signOut} />
    {/if}
    {#if !$project_opened}
      <Welcome />
    {:else}
      <Main />
    {/if}
    <main slot="pending">
      <h1>...</h1>
    </main>
    <main slot="signed-out">
      <Signin />
    </main>
  </User>
</Root>
