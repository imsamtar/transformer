import Custom from "../../stores/definations/Custom";
import fromJSON from "../syntax/fromJSON";
import editor, { editor_mode } from "./index";
import keyup from "./keyup";

import * as monaco from "monaco-editor";

const text = new Custom("");

export default function (editorNode, cond = false) {
    const oldText = text.get();
    let newText;
    switch (editor_mode.get().mode) {
        case "schema":
            newText = fromJSON(editor_mode.get().tables.toJSON());
            break;
        case "trigger":
            newText = editor_mode.get().trigger.self.code;
            break;
    }
    return () => {
        if (oldText !== newText || cond) {
            editorNode
                .querySelectorAll(".monaco-editor")
                .forEach(node => node.remove());
            editor.update(editor => {
                editor = monaco.editor.create(editorNode, {
                    value: [newText].join("\n"),
                    theme: "vs-dark",
                    language: editor_mode.get().language,
                    automaticLayout: true
                });
                editor.onKeyUp(keyup);
                return editor;
            });
        }
        text.set(newText);
    };
}
