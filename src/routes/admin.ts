import type { RouterType } from "itty-router";

import { withRequireAccount, withRequireAdmin } from "../lib/utils.ts";
import { env } from "cloudflare:workers";

export function adminRoutes(app: RouterType) {
	app.get("/admin/", withRequireAccount, withRequireAdmin, async (request) => {
		return env.public.fetch(request);
	});
}
