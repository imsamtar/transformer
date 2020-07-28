import page from "page";
import { get, writable } from "svelte/store";
import { query } from "hasurafire";
import { schemaReply } from "./hasura";
import blocks, { project_id } from "./blocks";

import Dashboard from "../Dashboard.svelte";
import Query from "../pages/Query.svelte";
import TriggerTable from "../pages/TriggerTable.svelte";
import TriggerQuery from "../pages/TriggerQuery.svelte";
import TriggerCron from "../pages/TriggerCron.svelte";
import Component from "../pages/Component.svelte";
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
        "/:schema_id(\\d+)/*": {
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

        "/:schema_id(\\d+)/:focus_type(code|pseudo)/query/:block_id?": Query,
        "/:schema_id(\\d+)/schema/:table_id?": Main,
        "/:schema_id(\\d+)/:focus_type(code|pseudo)/trigger/table/:block_id?": TriggerTable,
        "/:schema_id(\\d+)/:focus_type(code|pseudo)/trigger/query/:block_id?": TriggerQuery,
        "/:schema_id(\\d+)/:focus_type(code|pseudo)/trigger/cron/:block_id?": TriggerCron,
        "/:schema_id(\\d+)/:focus_type(code|pseudo)/component/:block_id?": Component,

        "/:schema_id(\\d+)/": {
            handler(ctx) {
                goto(`/${ctx.params.schema_id}/pseudo/query/`);
            }
        },

        "/": Dashboard,
        "*": {
            handler() {
                goto('/');
            }
        }
    };

    for (const route of Object.entries(routes)) {
        const [path, value] = route;
        page(path, function (ctx, next) {
            if (typeof value === "object") {
                if (value.handler) {
                    value.handler(ctx, next);
                }
            } else if (typeof value === "function") {
                parameters.set(ctx.params);
                activeComponent.set(value);
            }
        });
    }
}