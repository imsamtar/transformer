<script>
  import { selectedField } from "../../stores/tables";
  export let field;
  export let active;
  let e = {};
  let r = {};
  let x;
  let y;
  let d = "";

  function pos(el) {
    let e = {};
    if (el.offsetParent) {
      e.p = {
        l: el.offsetParent.offsetLeft,
        t: el.offsetParent.offsetTop,
        w: el.offsetParent.offsetWidth,
        h: el.offsetParent.offsetHeight
      };
      e.l = el.offsetLeft;
      e.t = el.offsetTop;
      e.w = el.offsetParent.offsetWidth;
      e.h = el.offsetParent.offsetHeight;
    }
    return e;
  }

  function click(e) {
    if (!e.ctrlKey && !e.shiftKey && e.altKey) {
      $field.ref = null;
    }
  }

  function randInt(n, a = 0) {
    return a + (Math.random() * n).toFixed();
  }

  let s;

  $: element = $field.element;
  $: ref = $field.ref;
  $: refElement = $ref && $ref.element;
  $: cond =
    $field.ref &&
    element &&
    element.offsetParent &&
    refElement &&
    refElement.offsetParent;
  $: if (cond) {
    e = pos(element);
    r = pos(refElement);
    e.x = e.p.l;
    e.y = e.p.t + e.t + 35;
    r.x = r.p.l + r.w;
    r.y = r.p.t + r.t + 35;
    x = e.x - 90 >= r.x;
    y = e.y >= r.y;

    s && s();
    s = $field.ref.subscribe(() => {
      const abs = Math.abs;
      switch (`${x} ${y}`) {
        case "true true":
        case "true false":
          d = `
            M ${e.x} ${e.y}
            h ${(r.x - e.x) / 2}
            V ${(e.y + r.y) / 2}
            ${
              Math.abs(e.y - r.y) > 100
                ? `
                    h 3
                    l -3 ${y ? 10 : -10}
                    l -3 ${y ? -10 : 10}
                    h 3
                `
                : ""
            }
            V ${r.y}
            H ${r.x}
            `;
          break;
        case "false true":
        case "false false":
          d = `
            M ${e.x} ${e.y}
            H ${e.x - 30}
            V ${
              e.p.t + e.p.h < r.p.t
                ? (e.p.t + e.p.h + r.p.t) / 2
                : e.p.t > r.p.t + r.p.h
                ? (e.p.t + r.p.t + r.p.h) / 2
                : Math.max(e.p.t + e.p.h + 20, r.p.t + r.p.h + 20)
            }
            H ${(e.x + r.x + 35) / 2}
            ${
              r.x - e.x > 100
                ? `
                    v 3
                    l -10 -3
                    l 10 -3
                    v 3
                `
                : ""
            }
            H ${r.x + 70}
            V ${r.y}
            H ${r.x}
            `;
          break;
      }
    });
  }
  $: field.refBy().forEach(field => {
    field.self = field.self;
  });
  $: isactive = $field.ref && (active || $field.ref.self.table.self.active);
  $: cardinality = $field.refType.split("to");
  let cardIndex = 0;
  let cardNoChars = 0;
  $: if ($field.ref) {
    cardNoChars = 0;
    $field.ref.refBy().findIndex((f, i) => {
      f.self.refType.split("to")[0];
      cardNoChars += f === field ? 0 : f.self.refType.split("to")[0].length;
      return f === field;
    });
  }
  let cardhover = false;
</script>

<style>
  path:hover,
  path.active {
    stroke: var(--path-active);
    --path-z-index: var(--path-z-index-active) !important;
    opacity: 1 !important;
  }
  path {
    opacity: 0.8;
    mix-blend-mode: darken;
  }
  text {
    background: navy;
  }
  text {
    font-size: 1.4rem;
    font-weight: bolder;
    cursor: pointer;
    opacity: 0.1;
  }
  text:hover,
  :global(text.active) {
    opacity: 1;
  }
</style>

{#if cond}
  <text
    class:active={isactive || cardhover}
    x={r.x + 10 + (cardNoChars + cardIndex) * 20 + 10 * cardIndex}
    y={r.y - 10}
    fill="black"
    stroke="none"
    on:mouseover={() => (cardhover = true)}
    on:mouseout={() => (cardhover = false)}>
    {cardinality[0]}
  </text>
  <path
    class:active={isactive || cardhover}
    {d}
    stroke="var(--path)"
    stroke-width="10"
    fill="none"
    on:mouseover={() => (cardhover = true)}
    on:mouseout={() => (cardhover = false)}
    on:click={click} />
  <text
    class:active={isactive || cardhover}
    x={e.x - 20}
    y={e.y - 10}
    fill="black"
    stroke="none"
    on:mouseover={() => (cardhover = true)}
    on:mouseout={() => (cardhover = false)}>
    {cardinality[1]}
  </text>
{/if}
