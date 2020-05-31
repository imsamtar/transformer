<script>
  import { onMount } from "svelte";
  import * as monaco from "monaco-editor";
  import tables from "../stores/tables.js";

  let editorNode;

  function keyup(e) {
    if (e.browserEvent.key.toLowerCase() === "control") {
      fromJSON(tables.toJSON());
      e.preventDefault();
    }
  }

  function fromJSON(json) {
    let result = "";
    json.forEach(table => {
      const str = `Table ${table.name} {
    ${table.fields.map((field, i) => {
      const constraints = [...(field.constraints || [])];
      field.ref && constraints.unshift("ref");
      field.pk && constraints.unshift("pk");
      return `${i ? "\n\t" : ""}${field.name}${constraints.map(
        (con, i) =>
          `${!i ? " [" : ""}${i ? " " : ""}${con}${
            constraints.length - 1 === i ? "]" : ""
          }`
      )}`;
    })}
}
`;
      result += str;
    });
    return result;
  }

  function render() {
    editorNode
      .querySelectorAll(".monaco-editor")
      .forEach(node => node.remove());
    const editor = monaco.editor.create(editorNode, {
      value: [fromJSON(tables.toJSON())].join("\n"),
      theme: "vs-dark",
      language: "sql"
    });
    editor.onKeyUp(keyup);
  }

  onMount(render);
</script>

<style>
  .editor {
    width: 30%;
    background: orange;
    z-index: 100;
  }
</style>

<svelte:window on:resize={render} />

<div id="editor" class="editor" bind:this={editorNode} />
