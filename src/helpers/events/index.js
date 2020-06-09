export function key_shortcut(key, event, ontrue, onfalse = () => { }) {
    key = key.split(':');
    let hold = (key[1] && key[1].split(/\s*,*\s*/) || []);
    key = key[0];
    const condition = ['ctrlKey', 'altKey', 'shiftKey'].map(key => {
        if (hold.find(c => c === key[0]))
            return !!event[key] === true;
        else
            return !!event[key] === false;
    }).reduce((r, c) => r && c, true);
    let prevented = false;
    if (key[0] === '!') {
        key = key.substr(1);
        prevented = true;
    }
    if (event.key.toLowerCase() === key && condition) {
        prevented && event.preventDefault();
        ontrue(event);
    }
    else onfalse(event);
}

export function download_file(data, filename, options) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
        new Blob([data], options)
    );
    link.download = filename;
    link.click();
}
