<script context="module">
  import { writable } from "svelte/store";
  export const rerender = writable(false);
</script>

<script>
  import { onMount } from "svelte";
  import cytoscape from "cytoscape";
  import blocks from "../stores/blocks";
  import { schemaReply } from "../stores/hasura";
  import { goto } from "../stores/goto";

  let top = 100;
  let container;
  let cy;
  let tooltip = "";
  let tooltip_left = 100;
  let tooltip_top = 100;

  function keyup(event) {
    if (event.ctrlKey && event.altKey) {
      if (event.key == "ArrowUp") top = 100;
      else if (event.key == "ArrowDown") top = 0;
    }
  }
  const colors = {
    query: "#aa4444",
    "trigger/table": "#448844",
    "trigger/query": "#44aa44",
    "trigger/cron": "#44dd44",
    component: "#4444aa",
  };

  $: if ($schemaReply) {
    $rerender;
    if (cy && cy.destory) cy.destory();
    const schema_id = $schemaReply.schema_id;
    cy = cytoscape({
      container,
      elements: [],
      style: [
        {
          selector: "node",
          style: {
            width: 70,
            height: 70,
            "background-color": "#666",
            label: "data(title)",
          },
        },
        {
          selector: "edge",
          style: {
            width: 7,
            "line-color": "#44aa44",
            "target-arrow-color": "#44aa44",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
    });
    $blocks.forEach((block, index) => {
      let array = [
        {
          group: "nodes",
          data: {
            id: `${block.block_id}`,
            type: `${block.type}`,
            title: `${block.text.title.slice(0, 12)}${
              block.text.title.length > 12 ? "..." : ""
            }`,
            full_title: `${block.text.title}`,
          },
          position: {
            x: (innerWidth - 1800) * 1.5 + ((index * 300) % 1800),
            y: 100 + 150 * parseInt(index / 6),
          },
          style: {
            "background-color": colors[block.type],
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
            style: {
              "line-color": colors[block.type],
              "target-arrow-color": colors[block.type],
            },
          });
        }
      });
      cy.add(array);
    });
    cy.on("tap", "node", function (evt) {
      var node = evt.target;
      goto(
        "/" + schema_id + "/pseudo/" + node.data().type + "/" + node.id(),
        true
      );
      top = 100;
    });
    cy.on("mousemove", "node", function (evt) {
      var node = evt.target;
      evt = evt.originalEvent;
      tooltip = node.data().full_title + ` - ${node.data().type}/${node.id()}`;
      tooltip_top = evt.clientY - 30;
      tooltip_left = evt.clientX;
    });
    cy.on("tapstart", "node", function (evt) {
      tooltip = "";
    });
    cy.on("mouseout", "node", function (evt) {
      tooltip = "";
    });
  }

  $: if (top != 0) {
    tooltip = "";
  }
</script>

<style>
  section {
    width: 100%;
    height: 100%;
    position: absolute;
    background: #fff;
    transition: 300ms top ease-out;
    z-index: 150;
    box-sizing: border-box;
    /* border-bottom: 0.5rem solid #222; */
  }
  #tooltip {
    position: absolute;
    display: block;
    min-width: 100px;
    background: #333;
    color: white;
    z-index: 155;
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
  }
</style>

<svelte:window on:keyup={keyup} />

<section bind:this={container} style="top: -{top}%;" />
{#if tooltip}
  <div id="tooltip" style="left:{tooltip_left}px;top:{tooltip_top}px;">
    {tooltip}
  </div>
{/if}
