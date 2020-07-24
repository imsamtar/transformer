import { get, writable } from "svelte/store";
import getMutation from "../helpers/getBlocksChangesMutation";
import { mutate } from "hasurafire";

export const project_id = writable(localStorage.getItem("project_id") || null);

let blocks = writable([]);

export const saving = writable(false);
export default blocks;

let old_blocks = JSON.parse(JSON.stringify(get(blocks)));
let nextTick;
let is_first_time = true;

export function autoSaveBlocks(event) {
    const current = get(blocks);
    if (is_first_time) {
        old_blocks = JSON.parse(JSON.stringify(current));
        is_first_time = false;
    }
    const _mutation = getMutation(old_blocks, current);
    clearTimeout(nextTick);
    nextTick = setTimeout(async function () {
        if (_mutation) {
            try {
                saving.set(true);
                await mutate(_mutation);
                old_blocks = JSON.parse(JSON.stringify(current));
            } catch (error) {
                console.log(error.message);
            }
            saving.set(false);
        }
    }, 1000);
}
