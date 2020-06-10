import Shape from "../../stores/definations/Shape";

export default function (text) {
    // Search Schema
    let schema = text.match(/schema:\s*\w+/) || [];
    schema = schema[0] || "public";
    schema = schema.replace(/schema:\s*/, '');
    // Search Tables
    let tables = Array.from(text.matchAll(/Table\s+(\w+)\s*{((.|\n)*?)}/g));
    tables = tables.map(table => ({
        id: Shape.genId(),
        name: table[1],
        schema,
        pos: [700, 200],
        fields: table[2]
    }));
    tables = tables.map(table => {
        table.fields = table.fields.split(/\s*\n\s*/g);
        table.fields = table.fields.filter(field => field);
        table.fields = table.fields.map(field => {
            field = Array.from(field.matchAll(/\ *(\w+)\ +(\w+)\ *(\[.*\])?/g))[0];
            if (field) {
                field = field.slice(1, 4);
                let constraints = [];
                let pk = false;
                if (field[2]) {
                    field[2] = field[2].replace(/timezone/, 'with time zone');
                    constraints = field[2].match(/\w([\s\w\:\.\(\)]|\'.*\')*\w?/g);
                    if (constraints.find(con => (/^pk$/i).exec(con))) pk = true;
                }
                if (!constraints.find(con => (/^null$/i).exec(con)))
                    constraints.push("NOT NULL");
                constraints = constraints.filter(con => {
                    const regexp = /(^pk$|^fk$|^null$)/i;
                    return !regexp.exec(con);
                });
                return {
                    id: Shape.genId(),
                    name: field[0],
                    type: field[1],
                    pk,
                    constraints
                };
            }
        });
        table.fields = table.fields.filter(field => field);
        return table;
    });
    // Search Ref
    let refs = Array.from(text.matchAll(/ref\s*\(\s*(\w+).(\w+)\s*<\s*([\w\s*]+)\s*>\s*(\w+).(\w+)\s*\)/g));
    refs = refs.map(ref => ref.splice(1, 5));
    refs.forEach(ref => {
        const table = tables.find(table => table.name === ref[3]);
        const field = table.fields.find(field => field.name === ref[4]);
        const reftable = tables.find(table => table.name === ref[0]);
        const reffield = reftable.fields.find(field => field.name === ref[1]);
        if (table && field && reftable && reffield) {
            field.refType = ref[2].replace(/\s+/g, '');
            field.ref = { table: reftable.id, field: reffield.id };
        }
    });

    return tables;
}
