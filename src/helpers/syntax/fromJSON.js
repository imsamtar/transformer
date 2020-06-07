export default function (json) {
    let result = "";
    let ref = "";
    let schema = "public";
    json.forEach(table => {
        schema = table.schema;
        const str = `\nTable ${table.name} {
    ${table.fields.map((field, i) => {
            let refTable;
            let refField;
            if (field.ref) {
                refTable = json.find(table => table.id === field.ref.table);
                refField = refTable.fields.find(
                    _field => _field.id === field.ref.field
                );
                if (refField)
                    ref += `\nref: ${refTable.name}.${
                        refField.name
                        } <${field.refType
                            .replace(/\s*to\s*/, " to ")
                            .replace(/\s*or\s*/, " or ")}> ${table.name}.${field.name}`;
            }
            let constraints = field.constraints.filter(
                c => c.toLowerCase() !== "not null"
            );
            constraints = Array.from(new Set(constraints));
            field.ref && constraints.unshift("fk");
            field.pk && constraints.unshift("pk");
            return `${i ? "\n\t" : ""}${field.name} ${field.type}${constraints.map(
                (con, i) =>
                    `${!i ? " [" : ""}${i ? " " : ""}${con}${
                    constraints.length - 1 === i ? "]" : ""
                    }`
            )}`;
        })}
}\n`;
        result += str;
    });
    result = result[0] === "\n" ? result.substr(1) : result;
    return (
        (schema == "public" ? "" : `schema: ${schema}\n\n`) + result + ref + "\n"
    );
}