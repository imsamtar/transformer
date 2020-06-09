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

  function dragstart(event) {
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

  $: editorNode && render(editorNode, true)();
  $: $editorElement = editorNode;
</script>

<style>
  .editor {
    z-index: 100;
    width: calc(30% - 2rem);
    min-width: 10%;
    max-width: 90%;
    height: 100vh;
  }
  #resize {
    z-index: 100;
    width: 2rem;
    background: linear-gradient(to right, #282828 50%, #ffffff66 50%);
    cursor: grabbing;
  }
  #resize:hover {
    background: linear-gradient(to right, #282828 50%, #ffffff88 50%);
  }
</style>

<div
  id="editor"
  class="editor"
  bind:this={editorNode}
  style="width: {width}%;" />
<div
  id="resize"
  draggable="true"
  on:dragstart={dragstart}
  on:drag={drag}
  bind:this={dragbar} />
