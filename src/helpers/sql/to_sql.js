function schema({ schema }) {
    return schema === "public" ? "" : `"${schema}".`;
}

export default function (_tables, options = {}) {
    let schema_name = "public";
    let sql = "";
    _tables.forEach(table => {
        schema_name = options.schema || table.schema;
        sql += `\nCREATE TABLE ${schema({ schema: schema_name })}"${
            table.name
            }" (${table.fields.map((f, i) => {
                if (f.constraints.find(c => c.toLowerCase() === "null")) {
                    f.constraints = [
                        ...f.constraints.filter(c => c !== "null"),
                        "not null"
                    ];
                }
                return `\n  "${f.name}" ${f.type.toUpperCase()}${f.constraints.reduce(
                    (r, c) => `${r} ${c.toUpperCase()}`,
                    ""
                )}`;
            })},\n  PRIMARY KEY (${table.fields
                .filter(f => f.pk)
                .map(f => `"${f.name}"`)})
);\n`;
    });
    _tables.forEach(table => {
        table.fields.forEach(f => {
            let statement = "";
            if (f.ref) {
                const refTable = (options.tables || _tables).find(
                    t => t.id === f.ref.table
                );
                const refField =
                    refTable && refTable.fields.find(fd => fd.id === f.ref.field);
                if (refField)
                    statement += `\nALTER TABLE ${schema({ schema: schema_name })}"${
                        table.name
                        }" ADD FOREIGN KEY ("${f.name}") REFERENCES ${schema({
                            schema: schema_name
                        })}"${refTable.name}" ("${refField.name}");\n`;
            }
            sql += statement;
        });
    });
    return { sql, schema_name };
}
