import { writable } from "svelte/store";
import fromJSON from "../syntax/fromJSON";
import tables from "../../stores/tables";
import editor from "./index";
import keyup from "./keyup";

import * as monaco from "monaco-editor";

const text = writable("");

export default function (editorNode, cond = false) {
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
