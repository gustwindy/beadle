import type { D1Database } from "@cloudflare/workers-types";
import { IttyRouter, type RouterType } from "itty-router";

import { getDrawingFor } from "./lib/drawings.ts";
import * as sql from "./lib/sql.ts";
import { adminRoutes } from "./routes/admin.ts";
import { routes } from "./routes/bea.ts";
import { env } from "cloudflare:workers";

const _404 = () => new Response(null, { status: 404 });

export interface Env {
	db: D1Database;
	public: {
		fetch(request: Request): Promise<Response>;
	};
	__router?: RouterType;
}
const ONE_DAY = 1000 * 60 * 60 * 23.9;

export default {
	async fetch(
		request: Request,
		appEnv: Env,
		_ctx: ExecutionContext,
	): Promise<Response> {
		if (!appEnv.__router) {
			const router = IttyRouter();

			adminRoutes(router);
			routes(router);

			router.all("*", async (request: Request, env: Env) => {
				const response = await env.public.fetch(request);

				if (response.status !== 404) {
					return response;
				}

				return Response.json(
					{
						status: 404,
						message: "not found",
					},
					{ status: 404 },
				);
			});
			appEnv.__router = router;
		}

		return appEnv.__router.fetch(request, appEnv);
	},

	async scheduled(
		_controller: ScheduledController,
		_appEnv: Env,
		_ctx: ExecutionContext,
	) {
		const last: null | sql.DbHistory = await sql
			.lastHistory(env.beadle)
			.first();
		if (last == null || last.time + ONE_DAY < Math.ceil(Date.now())) {
			const nextDay = (last?.day ?? 0) + 1;
			const drawing = await getDrawingFor(nextDay);

			console.log(drawing?.id);
			if (drawing) {
				await sql
					.addHistory(env.beadle, nextDay, Math.ceil(Date.now()), drawing?.id)
					.run();
			}
		}
		console.log(last?.time);
	},
};
