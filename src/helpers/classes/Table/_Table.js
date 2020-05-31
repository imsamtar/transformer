import Shape from "../Shape";
import TableField from "./TableField";
import store from "../../stores/tables";
import { writable } from "svelte/store";

export default class _Table extends Shape {
    constructor(name = "", options = {}) {
        let id = 0;
        tables.subscribe(_ => _.forEach(_table => id = (_table.id > id) ? _table.id + 1 : id))();
        super(name, { store, id, ...options });
        this.fieldsStore = writable([]);
    }
    createField(name, options) {
        return new TableField(name, { store: this.fieldsStore, table: this, ...options });
    }
    removeField(field) {
        return field.delete();
    }
    set tables(tables) { this.store = tables }
    get tables() { return this.store }
    set fields(fields) { this.fieldsStore.set(fields) }
    get fields() {
        let __fields;
        this.fieldsStore.subscribe(fields => __fields = fields)();
        return __fields;
    }
}