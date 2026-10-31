import type { RouterType } from "itty-router";

import { response, serverFault, yourFault } from "../lib/responses.ts";
import { sql } from "../lib/sql.ts";
import { env } from "cloudflare:workers";

async function checkCode(baseUrl: string, code: string) {
	const resp = await fetch("https://discord.com/api/v10/oauth2/token", {
		method: "POST",
		body: new URLSearchParams({
			// biome-ignore lint/style/useNamingConvention: so look arouuuuuuuuuuoouuuuuuuuuuuuoooouuuoouuuuuuuuuuuuuuuuuooooooooooooound
			grant_type: "authorization_code",
			code: code,
			// biome-ignore lint/style/useNamingConvention: and just like that the world will end
			redirect_uri:
				new URL("/auth", baseUrl).toString() ??
				"it matters not to me, nor to anyone else", // ????

			// biome-ignore lint/style/useNamingConvention: in time !! ur guess is as good as mine !!
			client_id: env.DISCORD_APP_ID,
			// biome-ignore lint/style/useNamingConvention: so what will u do
			client_secret: env.DISCORD_OAUTH_SECRET,
		}),
	});
	if (!resp.ok) return;
	const data: {
		scope: string;
		// biome-ignore lint/style/useNamingConvention: when the fake moon falls
		access_token: string;
	} = await resp.json();
	const scopes = data.scope.split(" ");
	const token = data.access_token;

	return { scopes, token };
}

async function shouldAllow(token: string) {
	const resp = await fetch("https://discord.com/api/v10/users/@me/guilds", {
		headers: {
			// biome-ignore lint/style/useNamingConvention: ill staaaaaaaaay awaaaaaaaake
			Authorization: `Bearer ${token}`,
		},
	});

	if (!resp.ok) return;
	const servers: {
		id: string;
		name: string;
	}[] = await resp.json();
	const whitelist = env.DISCORD_GUILD_IDS.split(" ");

	const valid = servers.filter((server) => {
		return whitelist.includes(server.id.toString());
	});

	valid.sort((a, b) => Number(a.id) - Number(b.id));
	if (valid.length < 1) return false;

	return valid[0]?.id;
}

async function getUser(token: string) {
	const resp = await fetch("https://discord.com/api/v10/users/@me", {
		headers: {
			// biome-ignore lint/style/useNamingConvention: till the daaay comes when iii will suffooooocaaaate onnn mmyyyy ownnn I FORGOT THE LAST WORD
			Authorization: `Bearer ${token}`,
		},
	});

	if (!resp.ok) return;
	const user: {
		id: string;
		username: string;
		avatar?: string;
		// biome-ignore lint/style/useNamingConvention: forgot the next lyric
		global_name?: string;
	} = await resp.json();

	return user;
}

async function getServerJoinDate(token: string, serverId: string) {
	const resp = await fetch(
		`https://discord.com/api/v10/users/@me/guilds/${serverId}/member`,
		{
			headers: {
				// biome-ignore lint/style/useNamingConvention: the weight of the world
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!resp.ok) return;
	const user: {
		// biome-ignore lint/style/useNamingConvention: sigh
		joined_at: string;
	} = await resp.json();

	return Date.parse(user.joined_at);
}

export function authRoutes(app: RouterType) {
	app.get("/auth/", async (request) => {
		const code = request.query.code;
		if (!code) {
			return env.public.fetch(new URL("/other/redirect.html", request.url));
		}

		const codeResult = await checkCode(request.url, code.toString());

		if (!codeResult)
			return serverFault(
				"ughh dont ping windy. discord just didnt accept it, so do it again",
			);
		const { scopes, token } = codeResult;

		if (!scopes.includes("guilds"))
			return yourFault("why'd you do that??? do it again (missing guilds)");
		if (!scopes.includes("identify"))
			return yourFault("why'd you do that??? do it again (missing identify)");
		if (!scopes.includes("guilds.members.read"))
			return yourFault(
				"why'd you do that??? do it again (missing guilds members wtv js do it again u know what u did)",
			);

		const discordUser = await getUser(token);
		if (discordUser === undefined)
			return serverFault(
				"wait a little and try again. discord doesn't want me to know ur user id",
			);

		let user = await sql.users.get(env.beadle, discordUser?.id);

		if (!user) {
			const allowedId = await shouldAllow(token);
			if (allowedId === undefined)
				return serverFault(
					"wait a little and try again. couldnt figure out if ur in vallycord or not. (OR you removed the guild scope. u evil thing)",
				);

			if (allowedId === false) {
				return yourFault(
					"you are NOT in vallycord. beadle was only meant for vallylings, sorry !!",
				);
			}

			const joinDate = await getServerJoinDate(token, allowedId);
			if (!joinDate)
				return serverFault("couldn't get ur vallycord join date??");

			console.log("new user", joinDate);
			await sql.users.new(
				env.beadle,
				discordUser.id,
				joinDate,
				discordUser.username,
				discordUser.global_name ?? discordUser.username,
				discordUser.avatar ?? "undefined", // erm
			);

			user = await sql.users.get(env.beadle, discordUser.id);
		}
		if (!user)
			return serverFault(
				"account couldn't be created for some whatever reason",
			);

		const cookie = await sql.sessions.new(env.beadle, user.id);

		await sql.codeCollection.put(env.beadle, code.toString(), cookie);

		return env.public.fetch(new URL("/other/auth.html", request.url));
	});
	app.get("/auth/collect", async (request) => {
		const { code } = request.query;
		if (!code) return yourFault("what are we even doing");
		const key = await sql.codeCollection.get(env.beadle, code.toString());
		if (!key) return serverFault("ayayay");
		return response(key);
	});
}
