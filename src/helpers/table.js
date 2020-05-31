import tables from "../stores/tables";
import Table from "./classes/Table";

export function createTable(name, options) {
    return new Table(name, options);
}
