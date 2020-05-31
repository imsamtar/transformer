import { writable } from "svelte/store";
import * as helpers from "../helpers/";
import tables from "./tables";

export const menus = writable({
    all: {
        main: {
            create_table: {
                name: "Create Table",
                handler: "addTable",
                symbol: "+"
            }
        },
        table: {
            addField: {
                name: "Add Field",
                handler: "addField",
                symbol: "+"
            },
            delete: {
                name: "Delete",
                handler: "deleteTable",
                symbol: "×"
            }
        },
        field: {
            pk: {
                name: "Primary Key",
                handler: "togglePrimaryKey",
                symbol: "±"
            },
            fk: {
                name: "Foreign Key",
                handler: "addRef",
                symbol: "±"
            },
            delete: {
                name: "Delete",
                handler: "deleteField",
                symbol: "×"
            }
        }
    },
    shown: undefined,
    pos: [100, 100],
    details: undefined
});

export function menu(action, data = {}, hidemenu = true) {
    return function (event) {
        let __res;
        menus.update(menus => {
            if (hidemenu) menus.shown = undefined;
            data = { ...menus.details, menus, tables, event, ...data };
            __res = helpers[dig(action, menus.all).handler](data);
            return menus;
        });
        return __res;
    }
}

export function dig(key, from, separator = ".") {
    let result = from;
    key.split(separator).forEach(key => {
        if (result[key] && result[key] !== result)
            result = result[key];
    });
    return result;
}
