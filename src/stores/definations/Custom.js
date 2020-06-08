import { writable } from "svelte/store";

export default class CustomStore {
    constructor(initail) {
        const { set, update, subscribe } = writable(initail);
        this.set = set;
        this.update = update;
        this.subscribe = subscribe;
    }
    get() {
        let current;
        this.subscribe(value => current = value)();
        return current;
    }
}
