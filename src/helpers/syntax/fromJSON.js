export default function (tables) {
    let text = "";
    let schema = "public";
    const fk_tables = [];
    const fk_fields = [];
    tables.forEach(table => {
        schema = table.schema;
        text += `Table ${table.name} {\n`;
        table.fields.forEach(field => {
            if (!field.name) return;
            let brackets = [...field.constraints].map(value => (/with\s+time\s+zone/i).exec(value) ? "timezone" : value);
            if (field.ref) {
                brackets.unshift('fk');
                fk_tables.push(table);
                fk_fields.push(field);
            }
            if (field.pk) brackets.unshift('pk');
            text += `\t${field.name} ${field.type}`;
            if (brackets.find(con => con.toLowerCase() === "not null")) {
                brackets = brackets.filter(con => con.toLowerCase() !== "not null");
            } else brackets.push('null');
            if (brackets.length) {
                text += " [";
                text += brackets.map((con, i) => (i ? ' ' : '') + con.toLowerCase());
                text += "]";
            }
            text += "\n";
        });
        text += '}\n\n';
    });
    fk_fields.forEach((field, index) => {
        const ref_table = tables.find(table => table.id === field.ref.table);
        const ref_field = ref_table.fields.find(_field => _field.id === field.ref.field);
        const ref_type = field.refType.replace(/\s*or\s*/, ' or ').replace(/\s*to\s*/, ' to ');
        text += `\nref(${ref_table.name}.${ref_field.name} <${ref_type}> ${fk_tables[index].name}.${field.name})\n`;
    });
    return `${schema == "public" ? '' : `schema: ${schema}\n\n`}${text}`;
}