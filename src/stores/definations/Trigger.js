import Shape from "./Shape";

export default class Trigger extends Shape {
    constructor(name, options) {
        super(name, {
            on: ["create", "update", "delete"],
            code: "function name(){\n\t\n}",
            affectedTables: new Set(),
            ...options
        });
        this.self.table.update(table => {
            table.triggers.add(this);
            return table;
        });
    }
    toJSON() {
        const json = {
            ...this.self,
            table: this.self.table.self.id,
            affectedTables: Array.from(this.self.affectedTables).map(table => table.self.id)
        };
        delete json.element;
        return json;
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    remove() {
        this.self.table.update(table => {
            table.triggers.delete(this);
            return table;
        });
    }
}
