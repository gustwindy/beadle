import type { RouterType } from "itty-router";

import { response } from "../lib/responses.ts";
import { sql } from "../lib/sql.ts";
import { discordIdToTimestamp, withRequireAccount } from "../lib/utils.ts";
import { env } from "cloudflare:workers";

export function routes(app: RouterType) {
	app.get("/api/today/", withRequireAccount, async ({ user }) => {
		return response([user, discordIdToTimestamp(user.id)]);
	});

	app.get("/api/artistList", withRequireAccount, async (_request) => {
		return response(await sql.artist.listIds(env.beadle));
	});
}
