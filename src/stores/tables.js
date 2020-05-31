import { writable } from "svelte/store";
import Table from "../helpers/classes/Table";

export default new class {
    constructor() {
        const { subscribe, update, set } = writable([]);
        this.subscribe = subscribe;
        this.update = update;
        this.set = set;
    }
    createTable(name, options) {
        return new Table(name, options);
    }
    toJSON() {
        let tables = [];
        this.subscribe(_tables => tables = _tables.map(t => t.toJSON()))();
        return tables;
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    fromJSON(array) {
        this.set([]);
        array.forEach(obj => {
            const newTable = this.createTable(obj.name, { ...obj, fields: [] });
            newTable.self = {
                ...newTable.self,
                fields: obj.fields.map(field => {
                    return newTable.createField(field.name, { ...field, table: newTable, ref: null });
                })
            }
        });
        this.update(tables => {
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
        })
    }
};

export const selectedField = writable(null);