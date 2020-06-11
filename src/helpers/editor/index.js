import Custom from "../../stores/definations/Custom";
import tables from "../../stores/tables";

export default new Custom(null);

export const editor_mode = new Custom({
    mode: "schema",
    language: "sql",
    tables
});
