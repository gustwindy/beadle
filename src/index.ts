import { IttyRouter, type RouterType } from "itty-router";

import { notFound } from "./lib/responses.ts";
import { adminRoutes } from "./routes/admin.ts";
import { authRoutes } from "./routes/auth.ts";
import { routes } from "./routes/bea.ts";

export interface Env {
	public: {
		fetch(request: Request): Promise<Response>;
	};
	__router?: RouterType;
}

export default {
	async fetch(
		request: Request,
		appEnv: Env,
		_ctx: ExecutionContext,
	): Promise<Response> {
		if (!appEnv.__router) {
			const router = IttyRouter();

			adminRoutes(router);
			authRoutes(router);
			routes(router);

			router.all("*", async (request: Request, env: Env) => {
				const response = await env.public.fetch(request);

				if (response.status !== 404) {
					return response;
				}

				return notFound();
			});
			appEnv.__router = router;
		}

		return appEnv.__router.fetch(request, appEnv);
	},
};
