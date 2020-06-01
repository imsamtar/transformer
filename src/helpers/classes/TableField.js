import Shape from "./Shape";

export function getID(array) {
    let id = 0;
    array.forEach(_ => id = (_.id >= id) ? _.id + 1 : id);
    return id;
}

export default class TableField extends Shape {
    constructor(name, options = {}) {
        super(name, {
            id: getID(options.table.self.fields.map(f => f.self)),
            type: "int",
            ref: null,
            refType: "1to*",
            ...options
        });
        options.table.self = {
            ...options.table.self,
            fields: [...options.table.self.fields, this]
        }
    }
    refBy(table) {
        const tables = table ? [table] : this.self.table.tables;
        let fields = [];
        tables.forEach(({ self: table }) => {
            table.fields.forEach(field => field.self.ref === this && fields.push(field));
        });
        return fields;
    }
    toJSON() {
        const json = {
            ...this.self,
            id: this.self.id,
            type: this.self.type,
            ref: this.self.ref && { table: this.self.ref.self.table.self.id, field: this.self.ref.self.id },
            table: this.self.table.self.id
        };
        delete json.element;
        return json;
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    remove() {
        this.self = { ...this.self, ref: undefined };
        this.refBy().forEach(f => f.update(f => {
            f.ref = null;
            return f
        }));
        this.self.table.update(table => {
            table.fields = table.fields.filter(_ => _ !== this);
            return table;
        });
    }
}
