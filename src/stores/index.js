
import { menus } from "./menus";

export function main_menu(e) {
    menus.update(menus => {
        menus.pos = [e.x, e.y];
        if (!menus.shown) menus.shown = "main";
        return menus;
    });
}
