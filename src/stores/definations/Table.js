import Shape from "./Shape";
import tables from "../../stores/tables";
import Trigger from "../../stores/definations/Trigger";
import TableField from "./TableField";

export default class Table extends Shape {
    constructor(name, options) {
        super(name, {
            schema: "public",
            fields: [],
            triggers: new Set(),
            tables,
            ...options,
            triggers: new Set()
        });
        this.self.tables.update(tables => [...tables, this]);
    }
    createField(name, options) {
        return new TableField(name, { table: this, ...options });
    }
    createTrigger(name, options) {
        let pos = [20, -100];
        return new Trigger(name, { table: this, pos, ...options });
    }
    toJSON() {
        const json = {
            ...this.self,
            id: this.self.id,
            fields: this.self.fields.map(_f => _f.toJSON()),
            triggers: Array.from(this.self.triggers).map(trigger => trigger.toJSON())
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
        this.self.tables.read().forEach(table =>
            table.self.triggers.forEach(({ update }) =>
                update(trigger => {
                    trigger.affectedTables.delete(this);
                    return trigger;
                })
            )
        );
        this.self.fields.forEach(field => field.remove());
        this.self.triggers.forEach(trigger => trigger.remove());
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
