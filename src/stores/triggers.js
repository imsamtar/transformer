import Custom from "./definations/Custom";
import Trigger from "./definations/Trigger";

class Triggers extends Custom {
    constructor() {
        super([]);
    }
    create_trigger(name, options = {}) {
        let pos = [0, -70];
        return new Trigger(name, { triggers: this, pos, ...options });
    }
}

const triggers = new Triggers();

export default triggers;