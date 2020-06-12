<script>
  import { Query } from "hasurafire";
  import { createEventDispatcher } from "svelte";
  let searchquery;
  let selected;

  const dispatch = createEventDispatcher();

  function select(project) {
    dispatch("select", project);
    searchquery = project.project_name;
    selected = true;
  }
</script>

<style>
  label {
    font-size: 1rem;
    font-family: sans-serif;
    margin: 1rem 0 0.2rem 0;
  }
  input:not([type="checkbox"]) {
    background: #eeeeee22;
    color: white;
    font-size: 1rem;
    padding: 0.3rem;
    width: 300px;
    max-width: calc(100vw - 3rem);
    border: 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
    background: white;
    color: black;
    position: absolute;
    width: 300px;
    max-height: 200px;
    overflow-y: auto;
    transform: translateY(-10px);
  }
  li {
    padding: 0.3rem;
  }
  li:hover {
    background: #eee;
  }
</style>

<label for="search">Search</label>

<Query
  let:execute
  query="searchProject"
  variables={{ search: `%${searchquery}%` }}
  let:response>
  <input
    slot="pending"
    type="search"
    bind:value={searchquery}
    on:keyup={() => {
      execute();
      selected = false;
    }} />
  <input
    slot="error"
    type="search"
    bind:value={searchquery}
    on:keyup={() => {
      execute();
      selected = false;
    }} />
  <input
    type="search"
    bind:value={searchquery}
    on:keyup={() => {
      execute();
      selected = false;
    }} />
  {#if searchquery && !selected}
    <ul>
      {#each response.data.transformer_project as project}
        <li on:click={() => select(project)}>{project.project_name}</li>
      {/each}
    </ul>
  {/if}
</Query>
