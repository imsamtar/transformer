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
  let nodes = [];

  async function addBlock(type) {
    type = type || prompt("Type of block?");
    if (type) {
      let res = await mutate("newBlock", {
        project_id: $project_id,
        type,
        data: {
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

  function keyup(event) {
    if (event.ctrlKey && event.altKey) {
      if (event.key == "ArrowUp") top = 100;
      else if (event.key == "ArrowDown") top = 0;
    }
  }
  function keydown(event) {
    if (event.altKey && event.key === "a") {
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
    });
    $blocks.forEach((block, index) => {
      cy.add({
        group: "nodes",
        data: {
          id: `${block.block_id}`,
          type: `${block.type}`,
          title:
            block.type == "if"
              ? "if"
              : `${block.text.text.slice(0, 12)}${
                  block.text.text.length > 12 ? "..." : ""
                }`,
          full_title:
            block.type == "if" ? "if" : `${block.text.text.split("\n")[0]}`,
        },
        position: {
          x: (innerWidth - 1800) * 1.5 + ((index * 300) % 1800),
          y: 100 + 150 * parseInt(index / 6),
        },
        style: {
          "background-color": colors[block.type],
          shape: block.type == "if" ? "diamond" : "circle",
          ...(nodes.find((node) => node.data().id == `${block.block_id}`)
            ? { "border-width": 7, "border-color": "orange" }
            : {}),
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
          // CTRL + SHIFT
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
        } else if (event.altKey) {
          const index = nodes.findIndex((n) => n.data().id == node.data().id);
          if (index == -1) {
            nodes = [...nodes, node];
          } else {
            nodes.splice(index, 1);
            nodes = nodes;
          }
        } else {
          // CTRL
          goto(`/${schema_id}/pseudo/${node.data().type}/${node.id()}`, true);
          top = 100;
        }
      } else if (event.altKey) {
        const index = $blocks.findIndex((block) => block.block_id == node.id());
        if (index > -1) {
          if (selected === $blocks[index]) {
            selected = null;
          }
          $blocks.splice(index, 1);
          $blocks = $blocks;
        }
      } else {
        selected = $blocks.find((block) => block.block_id == node.id());
      }
    });
    // Hover Node
    cy.on("mousemove", "node", function (evt) {
      const node = evt.target;
      const event = evt.originalEvent;
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
    // Hover edge
    cy.on("mousemove", "edge", function (evt) {
      const event = evt.originalEvent;
      const edge = evt.target;
      const node = edge._private.source._private;
      if (node.data.type == "if") {
        const block = $blocks.find((block) => block.block_id == node.data.id);
        if (block) {
          const edges = node.edges.filter((edge) =>
            edge._private.data.id.startsWith(node.data.id)
          );
          const index = edges.findIndex(
            (ed) => ed._private.data.id === edge._private.data.id
          );
          if (index) tooltip = `if is not: ${block.text.text}`;
          else tooltip = `if: ${block.text.text}`;
        }
      }
      tooltip_top = event.clientY - 80;
      tooltip_left = event.clientX + 30;
    });

    // Tap Node
    cy.on("tapstart", "node", function (evt) {
      tooltip = "";
    });
    cy.on("mouseout", "node", function (evt) {
      tooltip = "";
    });
    // Hover end
    cy.on("mouseout", "edge", function (evt) {
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

<svelte:window on:keyup={keyup} on:keydown={keydown} on:keyup={ctrlb} />

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
