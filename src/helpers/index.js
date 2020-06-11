import triggers from "../stores/triggers";
import { selectedField } from "../stores/tables";
import { selected_trigger } from "../stores/triggers";

export function addTable({ tables, event }) {
    tables.createTable("", { pos: [event.x - 70, event.y - 20] });
}
export function addField({ menus: { details: table } }) {
    table.createField("");
    if ((innerHeight - table.self.pos[1] - (table.self.fields.length * 37 + 50)) < 10) {
        table.self = {
            ...table.self,
            pos: [table.self.pos[0], table.self.pos[1] - 100]
        };
    }
}
export function deleteTable({ menus: { details: table } }) {
    table.remove();
}
export function togglePrimaryKey({ menus: { details: field } }) {
    field.self = { ...field.self, pk: !field.self.pk };
}
export function addRef({ menus: { details: field } }) {
    selectedField.update(selected => {
        if (selected) {
            if (selected === field) return null;
            if (field.self.ref !== selected)
                field.self = { ...field.self, ref: selected };
            else field.self = { ...field.self, ref: null };
            return null;
        }
        return field;
    });
}
export function deleteField({ menus: { details: field } }) {
    field.remove();
}

export function addTrigger({ menus: { details: table } }) {
    setTimeout(() =>
        table.createTrigger(prompt("Enter trigger name:") || ''), 10);
}

export function renameTrigger({ menus: { details: trigger } }) {
    trigger.update(trigger => {
        const name = trigger.name;
        trigger.name = prompt("Rename trigger", trigger.name) || name;
        return trigger;
    });
}

export function deleteTrigger({ menus: { details: trigger } }) {
    trigger.remove();
}

export function linkTable({ menus: { details: trigger } }) {
    selected_trigger.set(trigger);
}
