<script>
  import { onMount } from "svelte";
  import { menus } from "../stores/menus";
  import { selectedField } from "../stores/tables";
  import { addRef } from "../helpers/index";
  import { render, editorElement } from "./Editor.svelte";

  export let field;
  let element;

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
        const fieldIndex = $field.table.self.fields.findIndex(f => f === field);
        fieldIndex &&
          $field.table.self.fields[fieldIndex - 1].self.element
            .querySelector("input")
            .focus();
        field.remove();
      } else return (del = true);
    }
    del = false;
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
  bind:this={element}
  on:click={click}
  on:contextmenu={contextmenu}
  class:selected={$selectedField === field}>
  <input
    type="text"
    on:keyup={keyup}
    bind:value={$field.name}
    title={`${$field.table.self.name}.${$field.name} (${($field.type || '').toUpperCase()}) ${$field.pk ? 'pk' : ''}${$field.ref ? 'fk' : ''}`} />
  {#if $field.pk}
    <span>PK</span>
  {/if}
  {#if $field.ref}
    <span>FK</span>
  {/if}
</div>
