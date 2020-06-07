import tables from "../../stores/tables";
import editor from "./index";
import toJSON from "../syntax/toJSON";

export default function (e) {
    if (e.browserEvent.key.toLowerCase() === "control") {
        e.preventDefault();
        editor.subscribe(editor => {
            try {
                let old_scores = [];
                let old_tables = tables.toJSON();
                let new_tables = toJSON(editor.getValue());
                new_tables = new_tables.map((nt, nIndex) => {
                    const otScores = [];
                    old_tables.forEach((ot, oIndex) => {
                        let points = 0;
                        if (ot.name === nt.name) points += 2;
                        else points -= 2;
                        ot.fields.forEach((of, oi) => {
                            let plus_points = 0;
                            const foundField = nt.fields.find((nf, ni) => {
                                if (oi === ni && nf.name === of.name) plus_points++;
                                if (nf.pk && of.pk) plus_points++;
                                if (nf.ref && of.ref) plus_points++;
                                return nf.name === of.name;
                            });
                            if (foundField) points += 1;
                            else points -= 1;
                            points += plus_points;
                        });
                        otScores.push(points);
                    });
                    old_scores.push(otScores);
                    return nt;
                });
                old_scores = old_scores
                    .map(oscore => {
                        const max = Math.max(...oscore);
                        return {
                            score: max,
                            old: oscore.indexOf(max)
                        };
                    })
                    .reduce((result, score, index) => {
                        if (!result[score.old] || result[score.old].score < score.score)
                            result[score.old] = {
                                score: score.score,
                                new: index
                            };
                        return result;
                    }, [])
                    .map(t => t.new);
                old_scores.forEach((ni, oi) => {
                    new_tables.forEach(ntable => {
                        ntable.fields.forEach(f => {
                            if (f.ref && f.ref.table === new_tables[ni].id)
                                f.ref.table = old_tables[oi].id;
                        });
                    });
                    new_tables[ni].id = old_tables[oi].id;
                    new_tables[ni].pos = old_tables[oi].pos;
                });
                tables.fromJSON(new_tables);
            } catch (err) {
                console.error(err);
            }
        })();
    }
}
