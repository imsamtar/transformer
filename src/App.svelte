<script context="module">
  import { writable } from "svelte/store";
  export const project_opened = writable(false);
</script>

<script>
  import { Root, User, SaveUser } from "hasurafire";
  import Dashboard from "./Dashboard.svelte";
  import Main from "./Main.svelte";
  import tables from "./stores/tables";
  import Signin from "./Signin.svelte";
  import config from "./config/index";
  import { key_shortcut } from "./helpers/events/index";
  import blocks, { autoSaveBlocks } from "./stores/blocks";
  import { schemaReply } from "./stores/hasura";
  import { goto, parameters, activeComponent } from "./stores/goto";
  import Graph from "./pages/Graph.svelte";

  function keyup(e) {
    if (e.key.toLowerCase() === "delete" && e.ctrlKey) {
      e.preventDefault();
      localStorage.clear();
      $project_opened = false;
      $tables = [];
      history.replaceState(null, null, "/");
    }
    key_shortcut("!arrowright:ac", e, function () {
      activePage = activePage < pages.length - 1 ? activePage + 1 : activePage;
    });
    key_shortcut("!arrowleft:ac", e, function () {
      activePage = activePage > 0 ? activePage - 1 : activePage;
    });
    // console.log("key up", e.key);
  }

  let pages = ["pseudo_query", "schema", "graphql_query", "pseudo_trigger"];
  let activePage = 0;
  let selected_schema;

  $: {
    $project_opened = !!localStorage.getItem("create_tables");
  }
</script>

<style>
  main {
    background: #000000dd;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    color: white;
  }
</style>

<svelte:window on:keyup={keyup} />

<Root {...config}>
  <User let:user={{ email }} let:fresh_signin let:signout>
    {goto(location.pathname, true) ? '' : ''}
    {#if fresh_signin}
      <SaveUser
        mutation="insertUser"
        variables={{ email, username: email.split('@')[0] }}
        on:error={signout} />
    {/if}
    {#if $activeComponent}
      <Graph />
      <svelte:component this={$activeComponent} {...$parameters} />
    {/if}
    <main slot="pending">
      <h1>...</h1>
    </main>
    <main slot="signed-out">
      <Signin />
    </main>
  </User>
</Root>
