export default function (sql) {
    let tables = [];
    let regexp = /CREATE\s+TABLE\s+\"?(\w+)\"?.\"?(\w+)\"?\s+\((\s+(.*)\s+)*\);/g;
    let matches = Array.from(sql.matchAll(regexp));
    matches.forEach((match, id) => {
        let fields = [];
        let fieldMatches = match[0].match(/(\w.+)/g).filter(l => !l.startsWith("CREATE TABLE")).map(l => l.slice(-1) === "," ? l.slice(0, -1) : l);
        fieldMatches.forEach((match, fid) => {
            if (!match.startsWith('CONSTRAINT')) {
                let parts = match.match(/(\'.*\'[^\s]*)|(NOT\s+\w+)|(with\stime\szone)|([\w\(\)]+)/g);
                const def = parts.findIndex(p => p === "DEFAULT");
                const constraints = def > -1 ? parts.slice(2, def) : parts.slice(2);
                let field = { id: fid, table: id, name: parts[0], type: parts[1], constraints }
                fields.push(field);
            }
        });
        let table = { id, name: match[2], schema: match[1], pos: [600 + id * 300, 150], fields };
        tables.push(table);
    });

    regexp = /ALTER\s+TABLE\s+ONLY\s+\"?(\w+)\"?.\"?(\w+)\"?\s+ADD.*;/g;
    matches = Array.from(sql.matchAll(regexp));
    matches.forEach(match => {
        const table = tables.find(table => table.schema === match[1] && table.name === match[2]);
        if (table) {
            let part = match[0].match(/PRIMARY KEY.*\)/g);
            if (part) {
                const cols = part[0].match(/\(.*\)/)[0].replace(/\(|\)/g, '').split(/,\s*/);
                cols.forEach(col => {
                    const field = table.fields.find(f => f.name === col);
                    if (field) field.pk = true;
                });
            }
            part = Array.from(match[0].matchAll(/FOREIGN KEY \(\"?(\w+)\"?\) REFERENCES \"?(\w+)\"?.\"?(\w+)\"?\(\"?(\w+)\"?\)/g));
            if (part.length) {
                const field = table.fields.find(f => f.name === part[0][1]);
                if (field) {
                    const table = tables.find(table => table.schema === part[0][2] && table.name === part[0][3]);
                    if (table) {
                        const refField = table.fields.find(f => f.name === part[0][4]);
                        field.ref = {
                            table: table.id,
                            field: refField.id
                        };
                    }
                }
            }
        }
    });
    return tables;
}
