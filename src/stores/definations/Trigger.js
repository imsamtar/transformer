import Shape from "./Shape";

export default class Trigger extends Shape {
    constructor(name, options) {
        super(name, {
            on: ["create", "update", "delete"],
            ...options
        });
        this.triggers = [...this.triggers, this];
    }
    remove() {
        this.triggers = this.triggers.filter(trigger => trigger !== this);
    }
    set triggers(triggers) { this.self.triggers.set(triggers) }
    get triggers() {
        let _triggers;
        this.self.triggers.subscribe(__triggers => _triggers = __triggers)();
        return _triggers;
    }
}