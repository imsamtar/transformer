<script context="module">
  import { writable } from "svelte/store";
  import render from "../helpers/editor/render";

  export const editorElement = writable(null);
</script>

<script>
  export let width = localStorage.getItem("editor_width") || 35;
  let editorNode;
  let dragbar;
  let timeout;
  let moving = false;

  function dragstart(event) {
    moving = true;
    event.dataTransfer.setDragImage(new Image(), 0, 0);
  }
  function drag(event) {
    if (!event.clientX) return;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      width = (event.screenX / innerWidth) * 100 - 3;
      localStorage.setItem("editor_width", width);
    }, 2);
  }
  function dragend(event) {
    moving = false;
  }

  $: editorNode && render(editorNode, true)();
  $: $editorElement = editorNode;
</script>

<style>
  .editor {
    z-index: 100;
    width: calc(30% - 1.5rem);
    min-width: 10%;
    max-width: 90%;
    height: 100vh;
  }
  #resize {
    z-index: 100;
    width: 1.5rem;
    background: #1e1e1ecc;
    cursor: grabbing;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: #777;
    transition: 130ms all;
  }
  #resize:hover, #resize.moving {
    background: #eeeeee66;
    color: #565656;
  }
</style>

<div
  id="editor"
  class="editor"
  bind:this={editorNode}
  style="width: {width}%;" />
<div
  id="resize"
  class:moving
  draggable="true"
  on:dragstart={dragstart}
  on:drag={drag}
  on:dragend={dragend}
  bind:this={dragbar} >=</div>
