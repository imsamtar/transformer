<script>
  import { onMount } from "svelte";
  import cytoscape from "cytoscape";
  import blocks from "../stores/blocks";

  let top = 100;
  let container;
  let cy;

  function keyup(event) {
    if (event.ctrlKey && event.altKey) {
      if (event.key == "ArrowUp") top = 100;
      else if (event.key == "ArrowDown") top = 0;
    }
  }
  // { group: "edges", data: { id: "e0", source: "n0", target: "n1" } },

  onMount(function () {
    cy = cytoscape({
      container,
      elements: [],
    });
    $blocks.forEach((block, index) => {
      let array = [
        {
          group: "nodes",
          data: { id: `${block.block_id}` },
          position: {
            x: 300 + ((index * 300) % 500),
            y: 100 + 100 * parseInt((100 + index * 100) / 500),
          },
        },
      ];
      cy.add(array);
    });
    $blocks.forEach((block, index) => {
      let array = [];
      (block.text.links || []).forEach((link) => {
        link = link.split("/").filter(Boolean);
        const id = link[link.length - 1];
        if (id) {
          array.push({
            group: "edges",
            data: {
              id: `${block.block_id}_${id}`,
              source: `${block.block_id}`,
              target: `${id}`,
            },
          });
        }
      });
      cy.add(array);
    });
  });
</script>

<style>
  section {
    width: 100%;
    height: 100%;
    position: absolute;
    background: #666;
    transition: 75ms top ease-in-out;
    z-index: 150;
  }
</style>

<svelte:window on:keyup={keyup} />

<section bind:this={container} style="top: -{top}%;" />
