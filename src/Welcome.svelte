<script>
  import { project_opened } from "./App.svelte";

  let files;
  let disabled;

  async function change(file) {
    try {
      const minified = JSON.stringify(JSON.parse(await file.text()));
      localStorage.setItem("hasura_metadata", minified);
      disabled = false;
    } catch (err) {
      disabled = true;
    }
  }

  $: if (files && files.length) {
    change(files[0]);
  } else disabled = false;
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
  fieldset {
    border: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
  }
  label {
    font-size: 1.1rem;
    font-family: sans-serif;
    margin: 0.5rem 0 0.2rem 0;
  }
  input {
    background: #eeeeee22;
    font-size: 1rem;
    padding: 0.3rem;
  }
  button {
    outline: none;
    border: 0;
    background: rgb(114, 199, 99);
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0.5rem;
    text-shadow: 1px 1px 3px #5d5d5d;
  }
  button:disabled {
    background: red;
    opacity: 0.2;
  }
  @media screen and (max-width: 600px) {
    #center {
      width: 100%;
      border-radius: 0;
    }
  }
</style>

<main>
  <div id="center">
    <div id="upper">
      <h2>Start a new project</h2>
      <fieldset>
        <label for="name">Select metadata file</label>
        <input type="file" bind:files />
      </fieldset>
    </div>
    <button {disabled} on:click={() => ($project_opened = true)}>Start</button>
  </div>
</main>
