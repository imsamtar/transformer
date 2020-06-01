<script context="module">
  import { writable } from "svelte/store";
  import * as monaco from "monaco-editor";
  import tables from "../stores/tables.js";

  export const editorElement = writable(null);
  const text = writable("");
  const editor = writable(null);

  export function fromJSON(json) {
    let result = "";
    let ref = "";
    json.forEach(table => {
      const str = `Table ${table.name} {
    ${table.fields.map((field, i) => {
      let refTable;
      let refField;
      if (field.ref) {
        refTable = json.find(table => table.id === field.ref.table);
        refField = refTable.fields.find(
          _field => _field.id === field.ref.field
        );
        ref += `\nref: ${refTable.name}.${refField.name} ${
          field.refType == "1to1"
            ? "<>"
            : field.refType == "1to*"
            ? "<"
            : field.refType == "*to*"
            ? "><"
            : ""
        } ${table.name}.${field.name}`;
      }
      const constraints = [...field.constraints];
      field.ref && constraints.unshift("fk");
      field.pk && constraints.unshift("pk");
      return `${i ? "\n\t" : ""}${field.name} ${field.type}${constraints.map(
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
    return result + ref + "\n";
  }

  export function toJSON(text) {
    let result = [];
    (text.match(/Table[\s]+[\w]+[\s]*{[\s\w\[\],]+}/g) || []).forEach(
      (table, i) => {
        const tableName = table
          .match(/Table[\s]+[\w]+/g)[0]
          .replace(/Table /, "");
        result[i] = {
          id: i,
          name: tableName,
          pos: [
            (innerWidth * 0.32 + (i % 4) * 300) % innerWidth,
            50 + parseInt(i / 4) * 300
          ],
          fields: (
            table.replace(/.+{|}/g, "").match(/\w.+(\]|,|\n)/g) || []
          ).map((line, id) => {
            line = line.replace(/,$/, "");
            line = line
              .replace(/\[|\]|,/g, "")
              .split(/[\s]+/)
              .filter(m => m);
            let field = {
              id,
              name: line[0],
              pk: !!line.find(word => word === "pk"),
              constraints: line.filter(
                (world, index) =>
                  index > 1 && !["pk", "fk"].find(w => w === world)
              )
            };
            line[1] && (field.type = line[1]);
            return field;
          })
        };
      }
    );
    (text.match(/ref:.+(\n|$)/g) || []).forEach(line => {
      line = line.replace(/(ref:[\s]*|\n)/g, "");
      line = line.match(/((\w+.\w+)|(<>|><|<))/g);
      if (
        line.length > 2 &&
        line[0].match(/\w+\.\w+/g) &&
        line[2].match(/\w+\.\w+/g) &&
        line[1].match(/(<>|><|<)/)
      ) {
        let fkTable = result.find(t => t.name === line[2].split(".")[0]);
        if (!fkTable) throw new Error("fk table does not exist");
        let fkField = fkTable.fields.find(
          f => f.name === line[2].split(".")[1]
        );
        if (!fkField) throw new Error("fk field does not exist");
        let refTable = result.find(t => t.name === line[0].split(".")[0]);
        if (!refTable) throw new Error("ref table does not exist");
        let refField = refTable.fields.find(
          f => f.name === line[0].split(".")[1]
        );
        if (!refField) throw new Error("ref field does not exist");
        fkField.refType =
          line[1] === "<>"
            ? "1to1"
            : line[1] === "<"
            ? "1to*"
            : line[1] === "><"
            ? "*to*"
            : "";
        fkField.ref = {
          table: refTable.id,
          field: refField.id
        };
      }
      return line;
    });
    return result;
  }

  export function keyup(e) {
    if (e.browserEvent.key.toLowerCase() === "control") {
      editor.subscribe(editor => {
        try {
          let old_tables = tables.toJSON();
          let new_tables = toJSON(editor.getValue());
          new_tables = new_tables.map(nt => {
            const ot = old_tables.find(ot => ot.name === nt.name);
            if (ot) nt.pos = ot.pos;
            return nt;
          });
          tables.fromJSON(new_tables);
        } catch (err) {
          console.error(err.message);
        }
      })();
      e.preventDefault();
    }
  }
  export function render(editorNode, cond = false) {
    let oldText;
    const newText = fromJSON(tables.toJSON());
    text.subscribe(_t => (oldText = _t))();
    return () => {
      if (oldText !== newText || cond) {
        editorNode
          .querySelectorAll(".monaco-editor")
          .forEach(node => node.remove());
        editor.update(ed => {
          ed = monaco.editor.create(editorNode, {
            value: [newText].join("\n"),
            theme: "vs-dark",
            language: "sql"
          });
          ed.onKeyUp(keyup);
          return ed;
        });
      }
      text.set(newText);
    };
  }
</script>

<script>
  let editorNode;

  $: editorNode && render(editorNode, true)();
  $: $editorElement = editorNode;
</script>

<style>
  .editor {
    width: 30%;
    background: orange;
    z-index: 100;
  }
</style>

<svelte:window on:resize={render(editorNode, true)} />

<div id="editor" class="editor" bind:this={editorNode} />
