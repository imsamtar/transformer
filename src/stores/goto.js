import page from "page";
import { get, writable } from "svelte/store";
import { query } from "hasurafire";
import { schemaReply } from "./hasura";
import blocks, { project_id } from "./blocks";

import Dashboard from "../Dashboard.svelte";
import QueryPseudo from "../pages/QueryPseudo.svelte";
import QueryCode from "../pages/QueryCode.svelte";
import TriggerTablePseudo from "../pages/TriggerTablePseudo.svelte";
import TriggerTableCode from "../pages/TriggerTableCode.svelte";
import TriggerQueryPseudo from "../pages/TriggerQueryPseudo.svelte";
import TriggerQueryCode from "../pages/TriggerQueryCode.svelte";
import TriggerCronPseudo from "../pages/TriggerCronPseudo.svelte";
import TriggerCronCode from "../pages/TriggerCronCode.svelte";
import ComponentPseudo from "../pages/ComponentPseudo.svelte";
import ComponentCode from "../pages/ComponentCode.svelte";
import Main from "../Main.svelte";

export const parameters = writable({});
export const activeComponent = writable(null);
export default page;

export function goto(path, replace = false) {
    if (replace) return page.replace(path);
    else return page.redirect(path);
}

if (!window.goto) {
    window.goto = goto;
    page.start();

    const routes = {
        "/:schema_id/*": {
            async handler(ctx, next) {
                if (!get(schemaReply) || get(schemaReply).schema_id !== ctx.params.schema_id) {
                    let res = await query("getASchema", { id: ctx.params.schema_id });
                    if (res.data && res.data.transformer_schema_by_pk) {
                        blocks.set(res.data.transformer_schema_by_pk.project.pseudo_blocks);
                        schemaReply.set(res.data.transformer_schema_by_pk);
                        project_id.set(res.data.transformer_schema_by_pk.project_id);
                        next();
                    }
                    else goto("/");
                }
            }
        },

        // "/:schema_id/query/pseudo/:block_id?": QueryPseudo,
        // "/:schema_id/query/code/:block_id?": QueryCode,
        // "/:schema_id/schema/:table_id?": Main,
        // "/:schema_id/trigger/table/pseudo/:block_id?": TriggerTablePseudo,
        // "/:schema_id/trigger/table/code/:block_id?": TriggerTableCode,
        // "/:schema_id/trigger/query/pseudo/:block_id?": TriggerQueryPseudo,
        // "/:schema_id/trigger/query/code/:block_id?": TriggerQueryCode,
        // "/:schema_id/trigger/cron/pseudo/:block_id?": TriggerCronPseudo,
        // "/:schema_id/trigger/cron/code/:block_id?": TriggerCronCode,
        // "/:schema_id/component/pseudo/:block_id?": ComponentPseudo,
        // "/:schema_id/component/code/:block_id?": ComponentCode,

        "/:schema_id/pseudo/query/:block_id?": QueryPseudo,
        "/:schema_id/code/query/:block_id?": QueryCode,
        "/:schema_id/schema/:table_id?": Main,
        "/:schema_id/pseudo/trigger/table/:block_id?": TriggerTablePseudo,
        "/:schema_id/code/trigger/table/:block_id?": TriggerTableCode,
        "/:schema_id/pseudo/trigger/query/:block_id?": TriggerQueryPseudo,
        "/:schema_id/code/trigger/query/:block_id?": TriggerQueryCode,
        "/:schema_id/pseudo/trigger/cron/:block_id?": TriggerCronPseudo,
        "/:schema_id/code/trigger/cron/:block_id?": TriggerCronCode,
        "/:schema_id/pseudo/component/:block_id?": ComponentPseudo,
        "/:schema_id/code/component/:block_id?": ComponentCode,

        "/:schema_id/": {
            handler(ctx) {
                goto(`/${ctx.params.schema_id}/pseudo/query`);
            }
        },

        "/": Dashboard,
        "*": Dashboard
    };

    for (const route of Object.entries(routes)) {
        page(route[0], function (ctx, next) {
            if (typeof route[1] === "object") {
                if (route[1].handler) {
                    route[1].handler(ctx, next);
                }
            } else if (typeof route[1] === "function") {
                parameters.set(ctx.params);
                activeComponent.set(route[1]);
            }
        });
    }
}