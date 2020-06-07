<script context="module">
  import { writable } from "svelte/store";
  import render from "../helpers/editor/render";

  export const editorElement = writable(null);
</script>

<script>
  let editorNode;

  $: editorNode && render(editorNode, true)();
  $: $editorElement = editorNode;
</script>

<style>
  .editor {
    z-index: 100;
    width: 30%;
    min-width: 520px;
    height: 100vh;
  }
</style>

<div id="editor" class="editor" bind:this={editorNode} />
