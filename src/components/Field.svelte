<script>
  import { onMount } from "svelte";
  import { menus } from "../stores/menus";
  import { selectedField } from "../stores/tables";
  import { addRef } from "../helpers/index";
  import { editorElement } from "./Editor.svelte";
  import render from "../helpers/editor/render";

  export let field;
  let element;
  let input;

  onMount(() => {
    if (
      element.offsetParent.offsetLeft + element.offsetWidth < innerWidth - 50 &&
      element.offsetTop + element.offsetParent.offsetTop < innerHeight - 50
    )
      element.querySelector("input").focus();
  });

  let del = true;
  function keyup(e) {
    if (!$field.name && e.key.toLowerCase() === "backspace") {
      if (del) {
        const fieldIndex = $field.table.self.fields.findIndex(
          (f) => f === field
        );
        fieldIndex &&
          $field.table.self.fields[fieldIndex - 1].self.element
            .querySelector("input")
            .focus();
        field.remove();
      } else return (del = true);
    } else if (e.ctrlKey && e.key == "p") {
      field.update((f) => {
        f.pk = !f.pk;
        return f;
      });
    }
    del = false;
  }

  function keydown(event) {
    if (event.key == "ArrowDown") {
      const selection = event.target.selectionStart;
      const nextField = $field.table.self.element.querySelector(
        `#${element.id} + div input`
      );
      if (nextField) {
        nextField.focus();
        event.preventDefault();
      }
    } else if (event.key == "ArrowUp") {
      const selection = event.target.selectionStart;
      const fields = Array.from(
        $field.table.self.element.querySelectorAll(`div`)
      );
      const index = fields.findIndex((e) => e == element);
      if (index > 0) {
        const field = fields[index - 1];
        if (field) {
          (field.querySelector("input") || {}).focus();
        }
        event.preventDefault();
      }
    }
  }

  function click(e) {
    if (e.altKey) {
      field.remove();
      e.stopPropagation();
    } else if (e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      $selectedField = field;
    } else if (e.shiftKey) {
      e.preventDefault();
      addRef({ menus: { details: field } });
    }
  }
  function contextmenu(e) {
    $menus.details = field;
    $menus.shown = "field";
    $menus.pos = [e.x, e.y];
    e.preventDefault();
    e.stopPropagation();
  }
  $: {
    $field.element = element;
    $field.element === element; // For some reason it is required
    $editorElement && render($editorElement)();
  }
  $: if ($field.name.match(/\s/g)) {
    $field.name = $field.name.replace(/\s/g, "");
    $editorElement && render($editorElement)();
  }
  $: if ($field.name.match(/\(\w+\)/g)) {
    $field.name = $field.name.replace(/\(\w+\)/g, (match) => {
      $field.type = match.slice(1, -1);
      return "";
    });
    $field.table.update((t) => t);
  }
</script>

<style>
  div {
    margin: var(--table-margin) 0 0 0;
    padding: calc(var(--table-margin) * 2);
    background: var(--table-field-bg);
    text-align: left;
    display: flex;
    justify-content: space-between;
    color: var(--table-bg);
  }
  div > input {
    font-size: 1rem;
    width: 100%;
    background: transparent;
    border: 0;
    outline: none;
    font-weight: 600;
    color: var(--table-bg);
    filter: brightness(50%);
  }
  div > span {
    padding: 0 0.3rem;
    font-weight: 900;
  }
  .selected {
    background: rgb(252, 225, 177);
  }
</style>

<div
  id="field-{$field.id}"
  bind:this={element}
  on:click={click}
  on:contextmenu={contextmenu}
  class:selected={$selectedField === field}>
  <input
    type="text"
    on:keyup={keyup}
    on:keydown={keydown}
    bind:value={$field.name}
    bind:this={input}
    title={`${$field.table.self.name}.${$field.name} (${($field.type || '').toUpperCase()}) ${$field.pk ? 'pk' : ''}${$field.ref ? 'fk' : ''}`} />
  {#if $field.pk}<span>PK</span>{/if}
  {#if $field.ref}<span>FK</span>{/if}
</div>
