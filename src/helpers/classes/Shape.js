import { writable } from "svelte/store";

export default class Shape {
    constructor(name, options) {
        const { subscribe, update, set } = writable({
            name,
            id: (Math.random() * 9999999999).toFixed(),
            pos: [0, 0],
            element: null,
            color: null,
            activeColor: null,
            active: false,
            ...options
        });
        this.subscribe = subscribe;
        this.update = update;
        this.set = set;
    }
    get self() {
        let self;
        this.subscribe(_ => self = _)();
        return self;
    }
    set self(self) {
        this.set(self);
    }
}
