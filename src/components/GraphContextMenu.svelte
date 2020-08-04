<script>
  import { onMount, createEventDispatcher } from "svelte";

  export let select;
  export let top;

  let contextMenu;
  let mounted = false;
  const dispatch = createEventDispatcher();

  function click(event) {
    let action =
      event.target.tagName === "SPAN" &&
      event.target.parentElement.tagName === "LI"
        ? event.target.parentElement.id
        : event.target.id;
    if (action) {
      if (action.startsWith("add-")) {
        action = action.replace("add-", "");
        const type = action.replace(/-/g, "/");
        select = null;
        dispatch("add", type);
      } else if (action === "close") {
        select = null;
        console.log(action);
      }
    }
  }
  function keyup(event) {
    if (top == 0) {
      if (event.key == "Enter") {
        return click(event);
      } else if (event.key == "Escape") {
        select = null;
      }
    }
  }

  function outer_click(event) {
    if (top == 0 && select) {
      select = null;
    }
  }

  onMount(function () {
    mounted = true;
  });

  $: if (contextMenu && select && top == 0) {
    const selected = contextMenu.querySelector(`#${select}`);
    if (selected) {
      setTimeout(() => {
        selected.parentElement.parentElement.focus();
        selected.focus();
      });
    }
  }

  $: if (top == 100) {
    select = null;
  }
</script>

<style>
  #context-menu {
    z-index: 160;
    position: absolute;
    top: 100px;
    left: 35vw;
    --width: 200px;
    display: none;
  }
  #context-menu.select {
    display: block;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    width: var(--width);
    position: absolute;
  }
  li {
    border: 0;
    outline: none;
  }
  li > ul {
    margin-top: -2rem;
    margin-left: var(--width);
    display: none;
  }
  li:hover > ul,
  li:focus-within > ul {
    display: block;
  }
  li > span {
    padding: 0.45rem;
    border: 0;
    outline: none;
    cursor: pointer;
    user-select: none;
    background: #333;
    color: white;
    display: block;
  }
  li:hover > span,
  li:focus-within > span {
    background: #444;
  }
  li:hover ~ ul,
  ul:hover {
    display: block !important;
  }
</style>

<svelte:window on:keyup={keyup} on:click={outer_click} />
{#if top == 0}
  <ul id="context-menu" class:select bind:this={contextMenu} on:click={click}>
    <li tabindex="0">
      <span>Add</span>
      <ul>
        <li tabindex="0" id="add-query">
          <span>Query</span>
        </li>
        <li tabindex="0">
          <span>Trigger</span>
          <ul>
            <li tabindex="0" id="add-trigger-table">
              <span>Table Trigger</span>
            </li>
            <li tabindex="0" id="add-trigger-query">
              <span>Query Trigger</span>
            </li>
            <li tabindex="0" id="add-trigger-cron">
              <span>Cron Trigger</span>
            </li>
          </ul>
        </li>
        <li tabindex="0" id="add-component">
          <span>Component</span>
        </li>
      </ul>
    </li>
  </ul>
{/if}
