import Shape from "./Shape";
import tables from "../../stores/tables";
import triggers from "../../stores/triggers";
import TableField, { getID } from "./TableField";

export default class Table extends Shape {
    constructor(name, options) {
        super(name, {
            schema: "public",
            fields: [],
            tables,
            ...options
        });
        this.self.tables.update(tables => [...tables, this]);
    }
    createField(name, options) {
        return new TableField(name, { table: this, ...options });
    }
    toJSON() {
        const json = {
            ...this.self,
            id: this.self.id,
            fields: this.self.fields.map(_f => _f.toJSON())
        };
        delete json.element;
        delete json.hover;
        delete json.tables;
        delete json.active;
        return json;
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    remove() {
        triggers.get().forEach(trigger => {
            if (trigger.self.table === this)
                trigger.remove();
        });
        this.self.fields.forEach(field => field.remove());
        this.tables = this.tables.filter(_table => _table !== this);
    }
    get fields() { return this.self.fields }
    set fields(fields) { this.self = { ...this.self, fields } }
    set tables(_) { tables.set(_) }
    get tables() {
        let _tables;
        tables.subscribe(__tables => _tables = __tables)();
        return _tables;
    }
}
