import type { IRequest, RouterType } from "itty-router";

import { notFound, response } from "../lib/responses.ts";
import { sql } from "../lib/sql.ts";
import { getCookie } from "../lib/utils.ts";
import { env } from "cloudflare:workers";

const withRequireAccount = async (request: IRequest) => {
	try {
		const session = getCookie(request.headers.get("cookie"));
		if (!session) return notFound("no");

		request.user = await sql.users.fromSession(env.beadle, session);
	} catch (_err) {
		return notFound("no");
	}
};

export function routes(app: RouterType) {
	app.get("/api/today/", withRequireAccount, async (request) => {
		return response(request.user);
	});
}
