import type { RouterType } from "itty-router";

import { response } from "../lib/responses.ts";
import { discordIdToTimestamp, withRequireAccount } from "../lib/utils.ts";

export function routes(app: RouterType) {
	app.get("/api/today/", withRequireAccount, async ({ user }) => {
		return response([user, discordIdToTimestamp(user.id)]);
	});
}
