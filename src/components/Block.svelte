<script>
  import { createEventDispatcher } from "svelte";
  import blocks from "../stores/blocks";
  import CodeMirror from "codemirror";
  import "codemirror/mode/javascript/javascript.js";

  export let ps_query;
  export let block_id = undefined;

  let dragAfter;
  let textarea;
  let draggable = true;
  let editor;

  const dispatch = createEventDispatcher();

  function keyUp(event) {
    if (event.key.toLowerCase() === "enter") {
      textarea.focus();
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
  function focus(event) {
    history.replaceState(null, null, `./${ps_query.block_id}`);
  }
  let expanded = block_id == ps_query.block_id;

  function expand(event) {
    expanded = !expanded;
  }
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
    padding: 0.4rem;
  }
  .links {
    display: none;
    color: white;
    padding: 0.4rem;
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
      on:focus={focus}
      class="title"
      on:keyup={keyUp}
      bind:value={ps_query.text.title} />
    <button class="icon right" on:click={expand}>expand</button>
  </div>
  <textarea
    bind:this={textarea}
    on:focus={focus}
    on:mousedown={textAreaMouseDown}
    on:mouseup={textAreaMouseUp}
    on:mouseleave={textAreaMouseUp}
    bind:value={ps_query.text.text}
    style="width: 100%;" />
  <div class="links">
    <h1>Add link</h1>
    <input type="text" />
    <dl>
      <dt>Links</dt>
      <dd>link1</dd>
      <dd>link2</dd>
      <dt>Linked by</dt>
      <dd>/link1</dd>
      <dd>/link1</dd>
    </dl>
  </div>
</div>
