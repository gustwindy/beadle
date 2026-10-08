import type { D1Database } from "@cloudflare/workers-types";
import { IttyRouter, type RouterType } from "itty-router";
import { adminRoutes } from "./routes/admin.ts";
import * as sql from "./lib/sql.ts";
import { env } from "cloudflare:workers";
import { routes } from "./routes/bea.ts";
import { getDrawingFor } from "./lib/drawings.ts";

const _404 = () => new Response(null, { status: 404 });

export interface Env {
	db: D1Database;
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

			router.all("*", () => {
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

		return appEnv.__router.fetch(request);
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
