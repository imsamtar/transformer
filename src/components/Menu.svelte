<script>
  import { menus, menu, dig } from "../stores/menus";
</script>

<style>
  .menu {
    width: 150px;
    background: #3a3a3a;
    color: #8a8a8a;
    z-index: 10;
    padding: 0.1rem;
    user-select: none;
    position: absolute;
    top: var(--y, 0);
    left: var(--x, 0);
  }
  .menu > div {
    padding: 0.5rem;
    text-align: left;
    font-weight: bold;
    cursor: pointer;
  }
  .menu > div:hover {
    background: #2f2f2f;
    color: white;
  }
  .menu > div > span {
    font-size: 1.4rem;
  }
</style>

{#if $menus.shown}
  <div class="menu" style="--x: {$menus.pos[0]}px; --y: {$menus.pos[1]}px">
    {#each Object.entries($menus.all[$menus.shown]) as action}
      <div on:click={menu(`${$menus.shown}.${action[0]}`)}>
        {#if action[1].symbol}
          <span>{action[1].symbol}</span>
        {:else if action[1].icon}
          <span>{action[1].icon}</span>
        {/if}
        {action[1].name}
      </div>
    {/each}
    <div on:click={() => ($menus.shown = undefined)}>
      <span>×</span>
      Close
    </div>
  </div>
{/if}
