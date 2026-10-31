import type { RouterType } from "itty-router";

import { response, yourFault } from "../lib/responses.ts";
import { sql } from "../lib/sql.ts";
import {
	withJson,
	withRequireAccount,
	withRequireAdmin,
} from "../lib/utils.ts";
import { env } from "cloudflare:workers";

export function adminRoutes(app: RouterType) {
	app.get("/admin/", withRequireAccount, withRequireAdmin, async (request) => {
		return env.public.fetch(request);
	});

	app.post(
		"/api/admin/artist/new",
		withRequireAccount,
		withRequireAdmin,
		withJson,
		async (request) => {
			const {
				userId,
				name,
			}: {
				userId?: string;
				name?: string;
			} = request.content;

			if (!userId || userId?.match(/\D/)) return yourFault("malformed user id");
			if (!name || name?.match(/[^\-\w.]/))
				return yourFault("invalid name! A-Za-z, 0-9, and dots only");

			await sql.artist.new(env.beadle, userId, name);

			return response("ok");
		},
	);

	app.get(
		"/api/admin/users/list",
		withRequireAccount,
		withRequireAdmin,
		async (_request) => {
			return response(await sql.users.listIds(env.beadle));
		},
	);
}
