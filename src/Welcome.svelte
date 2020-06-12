<script>
  import { project_opened } from "./App.svelte";
  import { mode } from "./stores/tables";
  import tables from "./stores/tables";
  import parseSQL from "./helpers/parseSQL";
  import { signOut } from "hasurafire";

  let files;
  let endpoint;
  let secret;
  let schema = "public";
  let pending = false;

  async function fetchMetadata() {
    let response = await fetch(`${endpoint}/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hasura-Role": "admin",
        "x-hasura-admin-secret": secret
      },
      body: JSON.stringify({ type: "export_metadata", args: {} })
    });
    response = await response.json();
    if (response.tables)
      localStorage.setItem("hasura_metadata", JSON.stringify(response));
  }
  async function submit() {
    if (endpoint && secret) {
      pending = true;
      try {
        endpoint = new URL(endpoint).origin;
        let response = await fetch(`${endpoint}/v1alpha1/pg_dump`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Hasura-Role": "admin",
            "x-hasura-admin-secret": secret
          },
          body: JSON.stringify({
            opts: ["-O", "-x", "--schema-only", "--schema", schema],
            clean_output: true
          })
        });
        response = await response.text();
        try {
          response = JSON.parse(response);
          console.error(response.error);
        } catch ({}) {
          localStorage.setItem(
            "create_tables",
            JSON.stringify(parseSQL(response))
          );
          await fetchMetadata();
          $project_opened = true;
        }
      } catch (err) {
        console.error(err.message);
        $project_opened = false;
      }
      pending = false;
    } else {
      $project_opened = true;
    }
  }

  $: disabled = endpoint && !secret;
</script>

<style>
  main {
    display: flex;
    width: 100%;
    background: #eee;
    align-items: center;
    justify-content: center;
  }
  #center {
    display: flex;
    border-radius: 0.4rem;
    flex-direction: column;
    overflow: hidden;
    max-width: 370px;
    margin: 0 auto;
  }
  #upper {
    background: var(--table-bg);
    color: white;
    padding: 1rem;
  }
  h2 {
    text-align: center;
  }
  fieldset {
    border: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
  }
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
  button {
    outline: none;
    border: 0;
    background: #12c54b;
    color: white;
    font-size: 1.2rem;
    font-weight: 400;
    cursor: pointer;
    padding: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  button:hover {
    filter: brightness(0.95);
  }
  button:disabled {
    background: #c5124b;
  }
  button#signout {
    margin-top: 1px;
    background: #1453db;
  }
</style>

<main>
  <form id="center" on:submit|preventDefault={submit}>
    <div id="upper">
      <h2>Start a new project</h2>
      <fieldset>
        <label for="url">Hasura endpoint</label>
        <input type="url" bind:value={endpoint} />
        <label for="password">Admin secret</label>
        <input type="password" bind:value={secret} required={!!endpoint} />
        <label for="schema">Schema name</label>
        <input type="schema" bind:value={schema} required={!!endpoint} />
      </fieldset>
    </div>
    <button type="submit" {disabled}>
      {disabled ? 'x' : pending ? '...' : 'Start'}
    </button>
    <button type="button" id="signout" on:click={signOut}>Signout</button>
  </form>
</main>
