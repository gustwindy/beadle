import type { IRequest } from "itty-router";

import { notFound } from "./responses.ts";
import { sql } from "./sql.ts";
import { env } from "cloudflare:workers";

export function getCookie(key: string, cookieString?: string | null) {
	const cookies = cookieString?.split(";").map((a) => a.trim().split("="));
	const f = cookies?.find((a) => a[0] === key);

	if (!f) return;
	return f.length === 2 ? f[1] : undefined;
}

export const withRequireAccount = async (request: IRequest) => {
	try {
		const session = getCookie("session", request.headers.get("cookie"));
		if (!session) return notFound("no");

		request.user = await sql.users.fromSession(env.beadle, session);
		if (!request.user) return notFound("no");
	} catch (_err) {
		return notFound("no");
	}
};

const DISCORD_START_DATE = 1420070400000n;

export function discordIdToTimestamp(snowflake: string): number {
	const num = BigInt(snowflake);

	return Number((num >> 22n) + DISCORD_START_DATE);
}
