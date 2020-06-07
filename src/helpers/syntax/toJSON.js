import Shape from "../classes/Shape";

export default function (text) {
    let result = [];
    let schema;
    if ((schema = text.match(/schema:\s*\w+/)))
        schema = schema[0].replace(/schema:\s*/, "");
    else schema = "public";

    (text.match(/Table[\s]+[\w]+[\s]*{[\s\w\[\],]+}/g) || []).forEach(
        (table, tableIndex) => {
            const tableId = Shape.genId();
            const tableName = table
                .match(/Table[\s]+[\w]+/g)[0]
                .replace(/Table /, "");
            result[tableIndex] = {
                id: tableId,
                name: tableName,
                schema,
                pos: [
                    (innerWidth * 0.32 + (tableIndex % 4) * 300) % innerWidth,
                    50 + parseInt(tableIndex / 4) * 300
                ],
                fields: (
                    table.replace(/.+{|}/g, "").match(/\w.+(\]|,|\n)/g) || []
                ).map((line, fieldIndex) => {
                    const fieldId = Shape.genId();
                    let result = [];
                    line = line.replace(/,$/, "");
                    result = line
                        .match(/\w+[\w\s]*/)[0]
                        .split(/\s+/)
                        .filter(x => x);
                    result.length < 2 && result.push("int");
                    let constraints;
                    if ((constraints = line.match(/\[.*\]/g))) {
                        constraints = constraints[0]
                            .match(/\w[\w\s,]*\w/)[0]
                            .replace(/\s+/g, " ")
                            .split(/\s*,\s*/);
                        if (!constraints.find(c => c === "null"))
                            constraints.push("not null");
                        result = [...result, ...Array.from(new Set(constraints))];
                    } else result.push("not null");
                    let field = {
                        id: fieldId,
                        name: result[0],
                        pk: !!result.find(word => word === "pk"),
                        constraints: result.filter(
                            (world, index) =>
                                index > 1 && !["pk", "fk"].find(w => w === world)
                        )
                    };
                    result[1] && (field.type = result[1]);
                    return field;
                })
            };
        }
    );
    (text.match(/ref:.+(\n|$)/g) || []).forEach(line => {
        line = line.replace(/(ref:[\s]*|\n)/g, "");
        line = line.match(/(\w+.\w+)|(<.*>)/g);
        if (line.length > 2) {
            let fkTable = result.find(t => t.name === line[2].split(".")[0]);
            if (!fkTable) throw new Error("fk table does not exist");
            let fkField = fkTable.fields.find(
                f => f.name === line[2].split(".")[1]
            );
            if (!fkField) throw new Error("fk field does not exist");
            let refTable = result.find(t => t.name === line[0].split(".")[0]);
            if (!refTable) throw new Error("ref table does not exist");
            let refField = refTable.fields.find(
                f => f.name === line[0].split(".")[1]
            );
            if (!refField) throw new Error("ref field does not exist");
            if ((line[1] = line[1].match(/[\w\*].*[\w\*]/g))) {
                line[1] = line[1][0].replace(/\s+/g, "");
                line[1] = line[1].replace(/1\s*or\s*0/g, "0or1");
                line[1].match(/to/g) && (fkField.refType = line[1]);
                fkField.ref = {
                    table: refTable.id,
                    field: refField.id
                };
            }
        }
        return line;
    });
    return result;
}
