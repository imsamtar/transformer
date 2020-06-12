import { writable } from "svelte/store";
import Custom from "./definations/Custom";
import Table from "./definations/Table";

export const mode = new Custom("create");

export default new class Tables {
    constructor() {
        const { subscribe, update, set } = writable([]);
        this.subscribe = subscribe;
        this.update = update;
        this.set = set;
    }
    read() {
        let tables;
        this.subscribe(ts => tables = ts)();
        return tables;
    }
    createTable(name, options = {}) {
        let schema = "public";
        const tables = this.toJSON();
        if (tables.length) {
            schema = tables[0].schema;
        }
        return new Table(name, { schema, tables: this, ...options });
    }
    toJSON() {
        let tables = [];
        this.subscribe(_tables => tables = _tables.map(t => t.toJSON()))();
        return tables;
    }
    toString(space = '') {
        return JSON.stringify(this.toJSON(), null, space);
    }
    fromJSON(array, apply = true) {
        const self = apply ? this : new Tables();
        self.set([]);
        array.forEach(obj => {
            const newTable = self.createTable(obj.name, { ...obj, fields: [] });
            newTable.self = {
                ...newTable.self,
                fields: obj.fields.map(field => {
                    return newTable.createField(field.name, { ...field, table: newTable, ref: null });
                }),
                triggers: new Set()
            }
        });
        self.update(tables => {
            tables.forEach(table => {
                const obj = array.find(o => o.id === table.self.id);
                obj.fields.forEach((objfield, index) => {
                    if (objfield.ref)
                        table.self.fields[index].self = {
                            ...table.self.fields[index].self,
                            ref: tables.find(t => t.self.id == objfield.ref.table).self.fields.find(f => f.self.id === objfield.ref.field)
                        }
                });
                if (obj.triggers) {
                    obj.triggers.forEach(trigger => {
                        table.createTrigger(trigger.name, {
                            ...trigger,
                            table,
                            affectedTables: new Set(trigger.affectedTables.map(affected_table =>
                                tables.find(table => table.self.id === affected_table)
                            ))
                        });
                    });
                }
            });
            return tables;
        });
        return self;
    }
};

export const selectedField = writable(null);