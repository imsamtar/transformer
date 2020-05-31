import { writable } from "svelte/store";
import tables from "../stores/tables";

const position = writable([0, 0]);
const timer = writable(0);

export function mouseMove(e) {
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        timer.update(timer => {
            clearTimeout(timer);
            let pos;
            position.subscribe(_pos => pos = _pos)();
            tables.subscribe(tables => tables.forEach(table => {
                if (pos[0] !== 0 && pos[1] !== 0)
                    table.self = {
                        ...table.self,
                        pos: [table.self.pos[0] - pos[0] + e.x, table.self.pos[1] - pos[1] + e.y]
                    }
            }))();
            position.set([e.x, e.y]);
            return setTimeout(() => position.set([0, 0]), 100);
        });
    }
}
export function touchStart(e) {
    position.update(pos => [e.touches[0].clientX, e.touches[0].clientY]);
}
export function touchMove(e) {
    position.update(pos => {
        if (pos[0] !== 0 && pos[1] !== 0) {
            const diff = [
                e.touches[0].clientX - pos[0],
                e.touches[0].clientY - pos[1]
            ];
            tables.update(tables =>
                tables.map(table => {
                    table.pos[0] += diff[0] / 2;
                    table.pos[1] += diff[1] / 2;
                    return table;
                })
            );
        }
        return [e.touches[0].clientX, e.touches[0].clientY];
    });
}
