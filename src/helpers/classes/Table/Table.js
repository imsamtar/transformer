import _Table from "./_Table";
import tables from "../../../stores/tables";

export default class Table extends _Table {
    constructor(name, options) {
        super(name, options);
        this.fields = [];
    }
    set newfield(_field) {
        this.fields = [...this.fields, _field];
    }
}