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
                })
            }
        });
        self.update(tables => {
            tables.forEach(({ self: table }) => {
                const obj = array.find(o => o.id === table.id);
                obj.fields.forEach((objfield, index) => {
                    if (objfield.ref)
                        table.fields[index].self = {
                            ...table.fields[index].self,
                            ref: tables.find(t => t.self.id == objfield.ref.table).self.fields.find(f => f.self.id === objfield.ref.field)
                        }
                })
            });
            return tables;
        });
        return self;
    }
};

export const selectedField = writable(null);