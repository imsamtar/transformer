<script context="module">
  import { writable } from "svelte/store";
  export const rerender = writable(false);
</script>

<script>
  import { onMount } from "svelte";
  import cytoscape from "cytoscape";
  import { mutate } from "hasurafire";
  import blocks, { project_id } from "../stores/blocks";
  import { schemaReply } from "../stores/hasura";
  import { goto } from "../stores/goto";
  import fcose from "cytoscape-fcose";
  import ContextMenu from "../components/GraphContextMenu.svelte";

  let top = 100;
  let container;
  let cy;
  let tooltip = "";
  let tooltip_left = 100;
  let tooltip_top = 100;
  let selected;
  let oldblocks = "";
  let select;
  let linkme;

  async function addBlock(type) {
    type = type || prompt("Type of block?");
    if (type) {
      let res = await mutate("newBlock", {
        project_id: $project_id,
        type,
        data: {
          title: "Untitled",
          text: "Some text here",
          code: "",
          links: [],
        },
      });
      if (res.data) {
        blocks.update((blocks) => {
          blocks.push(res.data.insert_transformer_pseudo_block_one);
          selected = res.data.insert_transformer_pseudo_block_one;
          return blocks;
        });
      }
    }
  }

  async function keyup(event) {
    if (event.ctrlKey && event.altKey) {
      if (event.key == "ArrowUp") top = 100;
      else if (event.key == "ArrowDown") top = 0;
    } else if (event.altKey && event.key === "a") {
      select = "add-query";
    }
  }
  const colors = {
    query: "#aa4444",
    "trigger/table": "#448844",
    "trigger/query": "#44aa44",
    "trigger/cron": "#44dd44",
    component: "#4444aa",
  };

  function ctrlb(event) {
    if (event.ctrlKey && event.key.toLowerCase() === "b") {
      selected = undefined;
    }
  }
  let count = 0;
  $: if ($schemaReply) {
    $rerender;
    if (cy && cy.destory) cy.destory();
    const schema_id = $schemaReply.schema_id;
    // if (oldblocks != JSON.stringify($blocks)) {
    oldblocks = JSON.stringify($blocks);
    cytoscape.use(fcose);
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
    cy.layout({
      name: "fcose",
      quality: "default",
      // Use random node positions at beginning of layout
      // if this is set to false, then quality option must be "proof"
      randomize: true,
      // Whether or not to animate the layout
      animate: true,
      // Duration of animation in ms, if enabled
      animationDuration: 1000,
      // Easing of animation, if enabled
      animationEasing: undefined,
      // Fit the viewport to the repositioned nodes
      fit: true,
      // Padding around layout
      padding: 30,
      // Whether to include labels in node dimensions. Valid in "proof" quality
      nodeDimensionsIncludeLabels: false,
      // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
      uniformNodeDimensions: false,
      // Whether to pack disconnected components - valid only if randomize: true
      packComponents: true,

      /* spectral layout options */

      // False for random, true for greedy sampling
      samplingType: true,
      // Sample size to construct distance matrix
      sampleSize: 25,
      // Separation amount between nodes
      nodeSeparation: 75,
      // Power iteration tolerance
      piTol: 0.0000001,

      /* incremental layout options */

      // Node repulsion (non overlapping) multiplier
      nodeRepulsion: 4500,
      // Ideal edge (non nested) length
      idealEdgeLength: 50,
      // Divisor to compute edge forces
      edgeElasticity: 0.45,
      // Nesting factor (multiplier) to compute ideal edge length for nested edges
      nestingFactor: 0.1,
      // Maximum number of iterations to perform
      numIter: 2500,
      // For enabling tiling
      tile: true,
      // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
      tilingPaddingVertical: 10,
      // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
      tilingPaddingHorizontal: 10,
      // Gravity force (constant)
      gravity: 0.25,
      // Gravity range (constant) for compounds
      gravityRangeCompound: 1.5,
      // Gravity force (constant) for compounds
      gravityCompound: 1.0,
      // Gravity range (constant)
      gravityRange: 3.8,
      // Initial cooling factor for incremental layout
      initialEnergyOnIncremental: 0.3,

      /* layout event callbacks */
      ready: () => {}, // on layoutready
      stop: () => {}, // on layoutstop
    });
    $blocks.forEach((block, index) => {
      cy.add({
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
      });
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
      const event = evt.originalEvent;
      if (event.ctrlKey) {
        if (event.shiftKey) {
          if (linkme) {
            const block = $blocks.find((block) => block.block_id == linkme);
            if (block) {
              const target = $blocks.find(
                (block) => block.block_id == node.id()
              );
              if (target) {
                const index = block.text.links.indexOf(
                  `${target.type}/${target.block_id}`
                );
                if (index > -1) block.text.links.splice(index, 1);
                else block.text.links.push(`${target.type}/${target.block_id}`);
                $blocks = $blocks;
              }
            }
            linkme = null;
          } else {
            linkme = node.id();
          }
        } else {
          goto(`/${schema_id}/pseudo/${node.data().type}/${node.id()}`, true);
          top = 100;
        }
      } else if (event.altKey) {
        const index = $blocks.findIndex((block) => block.block_id == node.id());
        if (index > -1) {
          $blocks.splice(index, 1);
          $blocks = $blocks;
        }
      } else {
        selected = $blocks.find((block) => block.block_id == node.id());
      }
    });
    cy.on("mousemove", "node", function (evt) {
      var node = evt.target;
      event = evt.originalEvent;
      if (event.shiftKey) {
        const foundBlock = $blocks.find((block) => block.block_id == node.id());
        if (foundBlock) {
          tooltip = foundBlock.text.text.replace(/\n/g, "<br>");
        }
      } else {
        tooltip =
          node.data().full_title + ` - ${node.data().type}/${node.id()}`;
      }
      tooltip_top = event.clientY - 80;
      tooltip_left = event.clientX + 30;
    });
    cy.on("tapstart", "node", function (evt) {
      tooltip = "";
    });
    cy.on("mouseout", "node", function (evt) {
      tooltip = "";
    });
    // }
  }

  $: if (top != 0) {
    tooltip = "";
  }

  $: if (selected) {
    blocks.update((blocks) => blocks);
  }
</script>

<style>
  aside {
    z-index: 160;
    width: 30%;
    min-width: 500px;
    background: #333;
    color: white;
    position: absolute;
    height: 100vh;
    top: 0;
    left: 0;
    transition: 300ms top ease-out;
    display: flex;
  }
  aside > textarea {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    background: transparent;
    color: white;
    outline: none;
    padding: 1rem 0.4rem;
  }
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
    padding: 0.5rem;
    border-radius: 0.2rem;
    max-width: 500px;
  }
</style>

<svelte:window on:keyup={keyup} on:keyup={ctrlb} />

{#if selected}
  <aside style="top: -{top}%;">
    <textarea bind:value={selected.text.text} />
  </aside>
{/if}
<section bind:this={container} style="top: -{top}%;" />
<ContextMenu
  bind:select
  {top}
  on:add={(event) => {
    const type = event.detail;
    addBlock(type);
  }} />
{#if tooltip}
  <div
    id="tooltip"
    style="left:{tooltip_left}px;top:{tooltip_top}px;"
    on:mousemove={() => (tooltip = null)}>
    {@html tooltip}
  </div>
{/if}
