<script>
  import { createEventDispatcher } from "svelte";
  import blocks from "../stores/blocks";
  import CodeMirror from "codemirror";
  import "codemirror/mode/javascript/javascript.js";

  export let ps_query;

  let dragAfter;
  let textarea;
  let draggable = true;
  let editor;

  // $: if (textarea) {
  //   editor = CodeMirror.fromTextArea(textarea, {
  //     lineNumbers: true
  //   });
  //   console.log(editor);
  // }

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
      console.log($blocks.length);
      if (index > -1) $blocks.splice(index, 1);
      console.log($blocks.length);
      $blocks = $blocks;
    }
  }
  function focus(event) {}
  function blur(event) {}
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
  .block:focus-within {
    grid-row: span 4;
  }
  .block:focus-within > textarea {
    height: 100%;
    display: block;
    resize: none;
    overflow: auto;
    padding: 0.4rem;
  }
  .dragBefore {
    border-left: 1rem solid white;
  }
  .dragAfter {
    border-right: 1rem solid white;
  }
</style>

<div
  class="block is-light"
  {draggable}
  class:dragAfter={dragAfter == 1}
  class:dragBefore={dragAfter == -1}
  on:click={remove}
  on:focus={focus}
  on:blur={blur}
  on:dragstart={e => dragStart(e, ps_query.id)}
  on:dragleave={dragLeave}
  on:dragover|preventDefault={dragOver}
  on:drop={e => blockDrop(e, ps_query.id)}>
  <input
    on:focus={focus}
    on:blur={blur}
    class="title"
    on:keyup={keyUp}
    bind:value={ps_query.text.title} />
  <textarea
    bind:this={textarea}
    on:focus={focus}
    on:blur={blur}
    on:mousedown={textAreaMouseDown}
    on:mouseup={textAreaMouseUp}
    on:mouseleave={textAreaMouseUp}
    bind:value={ps_query.text.text}
    style="width: 100%;" />
</div>
