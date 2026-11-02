import type { RouterType } from "itty-router";

import { ONE_DAY } from "../constants.ts";
import { response, yourFault } from "../lib/responses.ts";
import { signImage } from "../lib/s3.ts";
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
		"/api/admin/artist/list/ids",
		withRequireAccount,
		withRequireAdmin,
		async (_request) => {
			return response(await sql.artist.list(env.beadle));
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

	app.post(
		"/api/admin/drawings/new",
		withRequireAccount,
		withRequireAdmin,
		async (request) => {
			const form = await request.formData();

			const image = <File>form.get("image");
			const artistId = <string>form.get("artistId");
			if (!(image && Number(artistId))) {
				return yourFault("image/artistId not json");
			}

			await sql.drawings.upload(env.beadle, artistId, image);

			return response("ok");
		},
	);
	app.post(
		"/api/admin/drawings/list",
		withRequireAccount,
		withRequireAdmin,
		withJson,
		async (request) => {
			const drawings = await sql.drawings.list(
				env.beadle,
				request.content.artistId,
			);
			if (!drawings) return yourFault("none or error");

			return response(drawings);
		},
	);
	app.post(
		"/api/admin/drawings/get",
		withRequireAccount,
		withRequireAdmin,
		withJson,
		async (request) => {
			const { hashes } = request.content;

			if (!hashes) return;

			return response(
				Promise.all(
					hashes.map(async (hash: string) => {
						const drawing = await sql.drawings.get(env.beadle, hash);

						if (!drawing) return "invalid drawing";

						return signImage(drawing.imageHash, ONE_DAY * 0.25);
					}),
				),
			);
		},
	);
}
