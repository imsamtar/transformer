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
    let schema = "public";
    json.forEach(table => {
      schema = table.schema;
      const str = `\nTable ${table.name} {
    ${table.fields.map((field, i) => {
      let refTable;
      let refField;
      if (field.ref) {
        refTable = json.find(table => table.id === field.ref.table);
        refField = refTable.fields.find(
          _field => _field.id === field.ref.field
        );
        ref += `\nref: ${refTable.name}.${
          refField.name
        } <${field.refType
          .replace(/\s*to\s*/, " to ")
          .replace(/\s*or\s*/, " or ")}> ${table.name}.${field.name}`;
      }
      let constraints = [...field.constraints];
      let notNull = constraints.find(c => c.toLowerCase() === "not null");
      if (notNull)
        constraints = constraints.filter(c => c.toLowerCase() !== "not null");
      else constraints.push("null");
      constraints = Array.from(new Set(constraints));
      field.ref && constraints.unshift("fk");
      field.pk && constraints.unshift("pk");
      return `${i ? "\n\t" : ""}${field.name} ${field.type}${constraints.map(
        (con, i) =>
          `${!i ? " [" : ""}${i ? " " : ""}${con}${
            constraints.length - 1 === i ? "]" : ""
          }`
      )}`;
    })}
}\n`;
      result += str;
    });
    result = result[0] === "\n" ? result.substr(1) : result;
    return (
      (schema == "public" ? "" : `schema: ${schema}\n\n`) + result + ref + "\n"
    );
  }

  export function toJSON(text) {
    let result = [];
    let schema;
    if ((schema = text.match(/schema:\s*\w+/)))
      schema = schema[0].replace(/schema:\s*/, "");
    else schema = "public";

    (text.match(/Table[\s]+[\w]+[\s]*{[\s\w\[\],]+}/g) || []).forEach(
      (table, i) => {
        const tableName = table
          .match(/Table[\s]+[\w]+/g)[0]
          .replace(/Table /, "");
        result[i] = {
          id: i,
          name: tableName,
          schema,
          pos: [
            (innerWidth * 0.32 + (i % 4) * 300) % innerWidth,
            50 + parseInt(i / 4) * 300
          ],
          fields: (
            table.replace(/.+{|}/g, "").match(/\w.+(\]|,|\n)/g) || []
          ).map((line, id) => {
            let result = [];
            line = line.replace(/,$/, "");
            result = line
              .match(/\w+[\w\s]*/)[0]
              .split(/\s+/)
              .filter(x => x);
            let constraints;
            if ((constraints = line.match(/\[.*\]/g))) {
              constraints = constraints[0]
                .match(/\w[\w\s,]*\w/)[0]
                .replace(/\s+/g, " ")
                .split(/\s*,\s*/);
              result = [...result, ...constraints];
            }
            if (!result.find(c => c.toLowerCase() === "null"))
              result.push("not null");
            else result = result.filter(c => c.toLowerCase() !== "null");
            result = Array.from(new Set(result));
            let field = {
              id,
              name: result[0],
              pk: !!result.find(word => word === "pk"),
              constraints: result.filter(
                (world, index) =>
                  index > 1 && !["pk", "fk"].find(w => w === world)
              )
            };
            result[1] && (field.type = result[1]);
            return field;
          })
        };
      }
    );
    (text.match(/ref:.+(\n|$)/g) || []).forEach(line => {
      line = line.replace(/(ref:[\s]*|\n)/g, "");
      line = line.match(/(\w+.\w+)|(<.*>)/g);
      if (line.length > 2) {
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
        if ((line[1] = line[1].match(/[\w\*].*[\w\*]/g))) {
          line[1] = line[1][0].replace(/\s+/g, "");
          line[1] = line[1].replace(/1\s*or\s*0/g, "0or1");
          line[1].match(/to/g) && (fkField.refType = line[1]);
          fkField.ref = {
            table: refTable.id,
            field: refField.id
          };
        }
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
            language: "sql",
            automaticLayout: true
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
    z-index: 100;
    width: 30%;
    min-width: 520px;
    height: 100vh;
  }
</style>

<div id="editor" class="editor" bind:this={editorNode} />
