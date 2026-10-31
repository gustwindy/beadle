import type { IRequest } from "itty-router";

import { notFound, serverFault, yourFault } from "./responses.ts";
import { type DbUser, sql } from "./sql.ts";
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
		if (!session)
			return env.public.fetch(new URL("/other/redirect.html", request.url));

		request.user = await sql.users.fromSession(env.beadle, session);
		if (!request.user)
			return env.public.fetch(new URL("/other/redirect.html", request.url));
	} catch (_err) {
		return notFound("no");
	}
};

export const withRequireAdmin = async (request: IRequest) => {
	// should be used in conjunction in withRequireAccount or else you will EXPLODE

	try {
		if (!request.user)
			return serverFault("can someone tell windy she forgot her self reminder");
		const user: DbUser = request.user;

		if (!user.isAdmin)
			return notFound("this should actually be a 401 but like");
	} catch (_err) {
		return notFound("eh idk what happened");
	}
};

export const withJson = async (request: IRequest) => {
	// should be used in conjunction in withRequireAccount or else you will EXPLODE

	try {
		request.content = await request.json();
		if (!request.content) return yourFault("json");
	} catch (_err) {
		return yourFault("json");
	}
};

const DISCORD_START_DATE = 1420070400000n;

export function discordIdToTimestamp(snowflake: string): number {
	const num = BigInt(snowflake);

	return Number((num >> 22n) + DISCORD_START_DATE);
}
