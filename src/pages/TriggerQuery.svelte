<script>
  import { onMount, createEventDispatcher } from "svelte";
  import Block from "../components/Block.svelte";
  import { query, mutate } from "hasurafire";
  import blocks, { project_id, saving, autoSaveBlocks } from "../stores/blocks";
  import { goto } from "../stores/goto";

  let type = "trigger/query";
  export let schema_id = undefined;
  export let block_id = undefined;

  const dispatch = createEventDispatcher();

  $: code_queries = $blocks.filter(block => block.type == type) || [];

  function keyUp(event) {
    if (event.ctrlKey && event.altKey) {
      if (event.key === "ArrowLeft") {
        goto(`/${schema_id}/pseudo/trigger/table/`);
      } else if (event.key === "ArrowRight") {
        goto(`/${schema_id}/pseudo/trigger/cron/`);
      }
    }
  }

  async function addBlock(at_start) {
    let res = await mutate("newBlock", {
      project_id: $project_id,
      type,
      data: {
        title: "Untitled",
        text: "Some text here"
      }
    });
    if (res.data) {
      blocks.update(blocks => {
        blocks.push(res.data.insert_transformer_pseudo_block_one);
        return blocks;
      });
    }
  }

  $: if ($blocks) {
    autoSaveBlocks();
  }
</script>

<style>
  section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    grid-auto-rows: 55px;
    grid-gap: 0.1rem;
    height: min-content;
    padding: 1rem;
    width: 100%;
    min-height: 100vh;
    background: #f0f0f0;
  }
  .block {
    background: var(--dark-color);
    color: var(--light-color);
    display: flex;
    flex-direction: column;
  }
  .block .title {
    padding: 1rem;
    background: transparent;
    color: white;
  }
  #add {
    grid-column: 1/-1;
    text-align: center;
    flex-direction: row;
    user-select: none;
    cursor: pointer;
    background: transparent;
  }
  #add > * {
    margin: 0 0.05rem;
    width: 100%;
    background: #555;
  }
  #add > *:hover {
    background: #333;
  }
  #add > span,
  #add > span:hover {
    background: transparent;
  }
</style>

<svelte:window on:keyup={keyUp} />
<section id="blocks" class="is-light is-min-screenheight">
  <div id="add" class="block is-light">
    <span />
    <h3 class="title align-center" on:click={() => addBlock(false)}>
      add at end
    </h3>
    <h3 class="title align-center" on:click={addBlock}>add new pseudo query trigger</h3>
    <span>
      {#if $saving}
        <span
          style="padding: 0.4rem; background: green;color:white;border-radius:
          0.5rem;">
          saving
        </span>
      {/if}
    </span>
  </div>
  {#each code_queries as ps_query, index}
    <Block bind:ps_query {type} {block_id} />
  {/each}
</section>
