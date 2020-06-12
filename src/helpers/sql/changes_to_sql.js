import to_sql from "./to_sql";

function schema_name({ schema }) {
    return schema === "public" ? "" : `"${schema}".`;
}

export default function (otables, etables) {
    let sql = "";
    let schema = "public";
    etables.forEach(etable => {
        const otable = otables.find(otable => otable.id === etable.id);
        if (otable) {
            schema = otable.schema;
            etable.fields.forEach(efield => {
                const ofield = otable.fields.find(ofield => (ofield.id === efield.id || ofield.name === efield.name));
                if (!ofield) {
                    sql += `ALTER TABLE ${schema_name({ schema })}"${
                        otable.name
                        }" ADD "${efield.name}" ${efield.type.toUpperCase()}${
                        efield.pk ? " PRIMARY KEY" : ""
                        }${efield.constraints.reduce(
                            (r, c) => `${r} ${c.toUpperCase()}`,
                            ""
                        )};\n`;
                    if (efield.ref) {
                        const ref_table = etables.find(table => table.id === efield.ref.table);
                        if (ref_table) {
                            const ref_field = ref_table.fields.find(field => field.id === efield.ref.field);
                            if (ref_field) {
                                sql += `\nALTER TABLE ${schema_name({ schema })}"${etable.name}" ADD FOREIGN KEY ("${efield.name}") REFERENCES ${schema_name({ schema })}"${ref_table.name}" ("${ref_field.name}");\n`;
                            }
                        }
                    }
                }
            });
        } else {
            sql += to_sql([etable], { schema: schema, tables: otables }).sql;
        }
    });
    return { sql, schema };
}
