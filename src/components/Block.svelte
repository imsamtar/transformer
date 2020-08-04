<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import blocks from "../stores/blocks";
  import { schemaReply } from "../stores/hasura";
  // import CodeMirror from "codemirror";
  // import "codemirror/mode/javascript/javascript.js";

  export let ps_query;
  export let block_id = undefined;
  export let type;
  export let focus_type = "pseudo";

  let dragAfter;
  let textarea;
  let draggable = true;
  let editor;
  let pseudoEdit;
  let codeEdit;
  let newLink;
  let editLinkIndex;
  let linkInput;
  let expanded = block_id == ps_query.block_id;

  const dispatch = createEventDispatcher();

  onMount(function () {
    (focus_type === "code" ? codeEdit : pseudoEdit).focus();
  });

  function keyUp(event) {
    if (event.key === "Enter") {
      pseudoEdit.focus();
    }
  }

  function textAreaMouseDown(event) {
    draggable = false;
  }
  function textAreaMouseUp(event) {
    draggable = true;
  }

  function dragStart(event, pseudo_query) {
    event.dataTransfer.setData("pseudo_query", pseudo_query);
  }

  function blockDrop(event, target_id) {
    dragAfter = 0;
  }

  function dragOver(event) {
    const after = event.target.offsetWidth / 2 < event.offsetX;
    dragAfter = after ? 1 : -1;
  }

  function dragLeave(event) {
    dragAfter = 0;
  }

  function remove(event) {
    if (event.altKey) {
      const index = $blocks.indexOf(ps_query);
      // console.log($blocks.length);
      if (index > -1) $blocks.splice(index, 1);
      // console.log($blocks.length);
      $blocks = $blocks;
    }
  }
  function addLink(event) {
    if (event.key === "Enter") {
      if (typeof editLinkIndex !== "undefined") {
        ps_query.text.links[editLinkIndex] = newLink;
        editLinkIndex = undefined;
      } else {
        ps_query.text.links = [...(ps_query.text.links || []), newLink];
      }
      newLink = "";
    }
  }
  function editLink(index) {
    editLinkIndex = index;
    newLink = ps_query.text.links[index];
    linkInput.focus();
  }
  function removeLink(index) {
    ps_query.text.links.splice(index, 1);
    ps_query.text.links = ps_query.text.links;
  }
  function focus(event) {
    pseudoFocus(event);
  }
  function pseudoFocus(event) {
    history.replaceState(
      null,
      null,
      `/${$schemaReply.schema_id}/pseudo/${type}/${ps_query.block_id}`
    );
  }
  function codeFocus(event) {
    history.replaceState(
      null,
      null,
      `/${$schemaReply.schema_id}/code/${type}/${ps_query.block_id}`
    );
  }
  function expand(event) {
    expanded = !expanded;
    if (expanded) {
      focus();
    } else {
      history.replaceState(
        null,
        null,
        `/${$schemaReply.schema_id}/pseudo/${type}/`
      );
    }
  }

  $: links = ps_query.text.links || [];
  $: backlinks = $blocks
    .filter(function (other_block) {
      return (other_block.text.links || []).find((link) => {
        return `${ps_query.type}/${ps_query.block_id}` === link;
      });
    })
    .map((block) => {
      return `${block.type}/${block.block_id}`;
    });
</script>

<style>
  * {
    border: 0;
    outline: none;
    box-sizing: border-box;
    font-size: 1rem;
  }
  .block {
    display: flex;
    flex-direction: column;
    transition: 20ms 70ms border;
    background: #555;
  }
  .block .title {
    padding: 1rem;
    background: #555;
    color: #f0f0f0;
    font-size: 1.2rem;
  }
  .block textarea {
    height: 0;
    display: none;
    border: 0.3rem solid #555;
    font-size: 1.3rem;
  }
  .expanded {
    grid-row: span 8;
  }
  .expanded > textarea {
    height: 100%;
    display: block;
    resize: none;
    overflow: auto;
    padding: 0 0.4rem 0.4rem 0.4rem;
  }
  .links {
    display: none;
    color: white;
    padding: 0.4rem;
  }
  .links input {
    background: transparent;
    padding: 0.4rem;
    border: none;
    outline: none;
    color: white;
    font-size: 1rem;
    border-bottom: 2px solid white;
    width: 100%;
  }
  .links a {
    color: white;
  }
  .expanded > .links {
    display: block;
  }
  .dragBefore {
    border-left: 1rem solid white;
  }
  .dragAfter {
    border-right: 1rem solid white;
  }
  .top {
    display: flex;
  }
  .top input {
    width: 100%;
  }
  .icon {
    flex: 1;
    width: max-content;
    background: transparent;
    color: white;
    font-weight: bold;
  }
  .right {
    flex: 0.1;
    float: right;
  }
  .link-btn {
    margin: 0 0.5rem;
  }
</style>

<div
  class="block is-light"
  class:expanded
  {draggable}
  class:dragAfter={dragAfter == 1}
  class:dragBefore={dragAfter == -1}
  on:click={remove}
  on:focus={focus}
  on:dragstart={(e) => dragStart(e, ps_query.id)}
  on:dragleave={dragLeave}
  on:dragover|preventDefault={dragOver}
  on:drop={(e) => blockDrop(e, ps_query.id)}>
  <div class="top">
    <input
      on:focus={pseudoFocus}
      class="title"
      on:keyup={keyUp}
      value={ps_query.text.text.split('\n')[0]}
      readonly />
    <button class="icon right" on:click={expand}>expand</button>
  </div>
  <textarea
    bind:this={pseudoEdit}
    on:focus={focus}
    on:mousedown={textAreaMouseDown}
    on:mouseup={textAreaMouseUp}
    on:mouseleave={textAreaMouseUp}
    bind:value={ps_query.text.text}
    style="width: 100%;" />
  <textarea
    bind:this={codeEdit}
    on:focus={codeFocus}
    on:mousedown={textAreaMouseDown}
    on:mouseup={textAreaMouseUp}
    on:mouseleave={textAreaMouseUp}
    bind:value={ps_query.text.code}
    style="width: 100%;" />
  <div class="links">
    <input
      bind:this={linkInput}
      type="text"
      placeholder="enter new link"
      bind:value={newLink}
      on:keyup={addLink} />
    <dl>
      {#if links.length}
        <dt>Links</dt>
        {#each links as link, index}
          <dd>
            <a href="/{$schemaReply.schema_id}/pseudo/{link}">{link}</a>
            <button class="link-btn" on:click={() => editLink(index)}>
              edit
            </button>
            <button class="link-btn" on:click={() => removeLink(index)}>
              remove
            </button>
          </dd>
        {/each}
      {/if}
      {#if backlinks.length}
        <dt>Backlinks</dt>
        {#each backlinks as link}
          <dd>
            <a href="/{$schemaReply.schema_id}/pseudo/{link}">{link}</a>
          </dd>
        {/each}
      {/if}
    </dl>
  </div>
</div>
