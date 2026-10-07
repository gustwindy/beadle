import type { D1Database } from '@cloudflare/workers-types';
import { IttyRouter, type RouterType } from 'itty-router';
import { adminRoutes } from './routes/admin.ts';
import * as sql from './lib/sql.ts';
import { env } from "cloudflare:workers";
import { routes } from './routes/bea.ts';
import { getDrawingFor } from './lib/drawings.ts';

const _404 = () => new Response(null, { status: 404 });

export interface Env {
	db: D1Database;
    __router?: RouterType;
}
const ONE_DAY = 1000 * 60 * 60 * 23.9

export default {
    async fetch(request: Request, appEnv: Env, ctx: ExecutionContext): Promise<Response> {
        if (!appEnv.__router) {
            const router = IttyRouter();

            adminRoutes(router);
            routes(router);

            router.all("*", () => {
                return Response.json({
                    status: 404
                })
            })
            appEnv.__router = router;
        };

        return appEnv.__router.fetch(request);
    },

    async scheduled(controller: ScheduledController, appEnv: Env, ctx: ExecutionContext) {
        const last: null | sql.DbHistory = await env.beadle.prepare(sql.lastHistory).first();
        if (last == null || last.time + ONE_DAY < Math.ceil(Date.now())) {
            const drawing = await getDrawingFor((last?.day ?? 0) + 1);

            console.log(drawing);
            if (drawing) {
                env.beadle.prepare(sql.addHistory).bind(Math.ceil(Date.now()), drawing?.id)
            }
        }
        console.log(last?.time);
	}
}
