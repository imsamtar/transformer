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
                }
            });
        } else {
            sql += to_sql([etable], { schema: schema, tables: otables }).sql;
        }
    });
    return { sql, schema };
}
