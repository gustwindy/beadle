import type { IRequest, RouterType } from "itty-router";

import { notFound, response } from "../lib/responses.ts";
import { type DbUser, sql } from "../lib/sql.ts";
import {
	discordIdToTimestamp,
	getCookie,
	withRequireAccount,
} from "../lib/utils.ts";
import { env } from "cloudflare:workers";

export function routes(app: RouterType) {
	app.get("/api/today/", withRequireAccount, async (request) => {
		const { user }: { user: DbUser } = request;

		return response([user, discordIdToTimestamp(user.id)]);
	});
}
