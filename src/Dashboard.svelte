<script>
  import { Query, Mutate, signOut, user } from "hasurafire";
  import { project_opened } from "./App.svelte";
  import parseSQL from "./helpers/parseSQL";

  let search = "";
  let selected_project;
  let selected_schema;
  let create;
  let proceeding = false;
  let new_project = {
    project_name: "",
    endpoint: "",
    admin_secret: ""
  };
  let new_schema = { schema_name: "" };

  function response(event) {
    const projects = event.detail.data.transformer_project;
    if (projects.length === 1) {
      selected_project = projects[0];
      if (search.length < projects[0].project_name.length) {
        search = `${projects[0].project_name}/`;
      }
    }
  }

  function addNew() {
    if (selected_project) create = "Schema";
    else create = "Project";
  }

  async function fetchMetadata(endpoint, admin_secret) {
    let response = await fetch(`${endpoint}/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hasura-Role": "admin",
        "x-hasura-admin-secret": admin_secret
      },
      body: JSON.stringify({ type: "export_metadata", args: {} })
    });
    response = await response.json();
    if (response.tables)
      localStorage.setItem("hasura_metadata", JSON.stringify(response));
  }

  async function proceed() {
    if (selected_project && selected_schema) {
      proceeding = true;
      let { endpoint, admin_secret } = selected_project;
      let { schema_name } = selected_schema;
      endpoint = new URL(selected_project.endpoint).origin;
      let response = await fetch(`${endpoint}/v1alpha1/pg_dump`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Hasura-Role": "admin",
          "x-hasura-admin-secret": admin_secret
        },
        body: JSON.stringify({
          opts: ["-O", "-x", "--schema-only", "--schema", schema_name],
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
        await fetchMetadata(endpoint, admin_secret);
        $project_opened = true;
      }
    }
    proceeding = false;
  }

  $: search_project = search.split("/")[0];
  $: search_schema = search.split("/")[1] || "";
  $: if (selected_project) search_project = selected_project.project_name;
  $: if (selected_project && search_schema) {
    const matched_schemas = selected_project.schemas.filter(
      schema => schema.schema_name.indexOf(search_schema) > -1
    );
    if (matched_schemas.length === 1) selected_schema = matched_schemas[0];
  }
  $: if (!search) selected_project = null;
  $: if (!search_schema) selected_schema = null;
  $: if (selected_project) new_schema.project_id = selected_project.project_id;
  $: variables = { search: `%${search_project}%` };
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: #ccc;
  }
  nav {
    grid-area: nav;
    height: 60px;
    min-height: 60px;
    background: #000000dd;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  nav span#logo {
    margin: 0 1rem;
    font-size: 1.2rem;
    font-weight: bold;
  }
  nav > div.right {
    display: flex;
    min-width: 20%;
    height: 2rem;
    justify-content: flex-end;
  }
  nav input[type="search"] {
    background: #ffffff22;
    padding: 0 0.7rem;
    border: 0;
    outline: none;
    width: 300px;
    transition: 0.3s width;
    color: #ddd;
    font-size: 1rem;
  }
  nav input[type="search"]::placeholder {
    color: #aaa;
  }
  nav input[type="search"]:focus {
    background: #ffffff33;
    width: 700px;
  }
  nav button {
    height: 100%;
    background: #ff000066;
    color: white;
    padding: 0 0.5rem;
    margin: 0 0.5rem;
    border: 0;
    outline: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    cursor: pointer;
  }
  nav button:hover {
    background: #ff0000cc;
  }
  div.projects {
    height: 100%;
    overflow-y: auto;
    padding: 1rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 400px));
    grid-auto-rows: 40px;
    grid-gap: 10px;
    justify-content: center;
  }
  div.breadcrumb {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  div.breadcrumb > span::before {
    content: "/";
    margin: 0 1rem;
    font-size: 1.2rem;
    font-weight: bold;
  }
  div.project,
  div.schema {
    grid-row: span 4;
    background: #000000cc;
    color: white;
    padding: 0.5rem;
    border-radius: 0.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.3rem;
  }
  div.schema {
    background: #000000aa;
  }
  div.project:hover,
  div.schema:hover {
    opacity: 0.95;
  }

  .options {
    display: none;
  }

  .project:hover > .options,
  .schema:hover > .options {
    display: block;
    width: 100px;
    margin-top: 4rem;
    float: right;
    position: absolute;
    display: flex;
    justify-content: space-around;
  }

  .options > span {
    padding: 0.2rem 0.5rem;
    background: #ffffff66;
  }

  main#create-project {
    position: absolute;
    background: #ffffff66;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  main > form {
    min-width: 400px;
    background: #707070;
    color: white;
    border-radius: 0.3rem;
    box-shadow: 0px 0px 10px #222;
    overflow: hidden;
  }
  main > form {
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }
  main > form > * {
    padding: 0.5rem 0;
    outline: none;
    border: 0;
    font-size: 1rem;
    border-radius: 0.3rem;
  }
  main > form > input {
    padding: 0.5rem;
    background: #ffffff11;
    color: white;
  }
  main > form > input:focus {
    background: #ffffff30;
  }
  main > form > button {
    margin-top: 1rem;
    background: #6ed146;
    color: white;
    filter: brightness(0.9);
    cursor: pointer;
  }
  main > form > button[type="button"] {
    background: #bb6226;
  }
  main > form > button:hover {
    filter: brightness(1);
  }
  main.proceeding {
    background: #ffffff66;
    position: absolute;
    top: 0;
    height: 100%;
  }
</style>

<main>
  <nav>
    <span id="logo">Transformer</span>
    <div class="right">
      <input
        type="search"
        bind:value={search}
        spellcheck="false"
        placeholder="project/schema"
        on:keyup={({ key }) => key.toLowerCase() === 'enter' && proceed()} />
      <button on:click={signOut}>Signout</button>
    </div>
  </nav>

  <div class="projects">
    <Query
      started
      query="searchProject"
      {variables}
      let:execute
      let:response
      let:error
      on:response={response}>
      {execute(search_project) ? '' : ''}
      <div class="breadcrumb">
        {#if selected_project}
          <span
            on:click={() => {
              search = 's';
              search = '';
              selected_project = null;
            }}>
            {selected_project.project_name}
          </span>
          {#if selected_schema}
            <span on:click={() => (selected_schema = null)}>
              {selected_schema.schema_name}
            </span>
          {:else}
            <span>Select Schema</span>
          {/if}
        {:else}
          <span>Select Project</span>
        {/if}
      </div>
      {#if selected_project}
        {#each selected_project.schemas.filter(schema => schema.schema_name.indexOf(search_schema) > -1) as schema}
          <div
            class="schema"
            on:click|self={() => {
              selected_schema = schema;
              proceed();
            }}>
            {schema.schema_name}
            <div class="options">
              <span>R</span>
              {#if selected_project.admin === $user.uid}
                <Mutate
                  mutation="deleteSchema"
                  variables={{ schema_id: schema.schema_id }}
                  let:execute={del}
                  on:response={execute}>
                  <span slot="start" on:click={del}>D</span>
                </Mutate>
              {/if}
            </div>
          </div>
        {/each}
      {:else}
        {#each response.data.transformer_project as project}
          <div
            class="project"
            on:click|self={() => (selected_project = project)}>
            {project.project_name}
            {#if project.admin === $user.uid}
              <div class="options">
                <span>R</span>
                <Mutate
                  mutation="deleteProject"
                  variables={{ project_id: project.project_id }}
                  let:execute={del}
                  on:response={execute}>
                  <span slot="start" on:click={del}>D</span>
                </Mutate>
              </div>
            {/if}
          </div>
        {/each}
      {/if}
      <div slot="pending" class="project">...</div>
      <div
        slot="end"
        class:schema={selected_project}
        on:click={addNew}
        class="project">
        +
      </div>
    </Query>
  </div>
</main>

{#if create}
  <main id="create-project">
    <Mutate
      mutation={`create${create}`}
      variables={create === 'Project' ? new_project : new_schema}
      let:execute
      let:response
      on:response={() => {
        search = 's';
        search = create = '';
      }}>
      <form slot="start" on:submit|preventDefault={execute}>
        {#if create === 'Project'}
          <label>Project Name:</label>
          <input type="text" required bind:value={new_project.project_name} />
          <label>Endpoint URL:</label>
          <input type="text" required bind:value={new_project.endpoint} />
          <label>Admin Secret:</label>
          <input
            type="password"
            required
            bind:value={new_project.admin_secret} />
          <button>Create Project</button>
          <button type="button" on:click={() => (create = '')}>Cancel</button>
        {:else if create === 'Schema'}
          <label>Schema Name:</label>
          <input type="text" required bind:value={new_schema.schema_name} />
          <button>Add Schema</button>
          <button type="button" on:click={() => (create = '')}>Cancel</button>
        {/if}
      </form>
      <span slot="error" type="text" let:error>{error.message}</span>
    </Mutate>
  </main>
{/if}

{#if proceeding}
  <main class="proceeding" />
{/if}
