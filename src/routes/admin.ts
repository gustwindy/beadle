import type { IRequest, RouterType } from "itty-router";

import { notFound, serverFault, yourFault } from "../lib/errors.ts";
import { getImage } from "../lib/s3.ts";
import * as sql from "../lib/sql.ts";
import { env } from "cloudflare:workers";

const withRequireAdmin = async (request: IRequest) => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: we dont know
		const content: Record<string, any> = await request.json();
		if (content.secret !== env.ADMIN_SECRET) {
			return notFound("no");
		}

		request.content = content;
	} catch (_err) {
		return notFound("no");
	}
};

export function adminRoutes(app: RouterType) {
	if (!app.post) return;

	app.post(
		"/api/admin/drawings/new/",
		withRequireAdmin,
		async ({ content }) => {
			if (!(content.artistId && content.encodedImage))
				return yourFault(
					"artistId: int\nencodedImage: str // base64 encoded image",
				);

			try {
				console.log(content.artistId);
				const currentId = await sql.lazyAddDrawing(
					env.beadle,
					content.artistId,
					content.encodedImage,
				);
				if (currentId === -1) {
					return yourFault("not an artist");
				}
				return Response.json({
					status: "200",
					id: currentId,
				});
			} catch (err) {
				console.log(err);
				if (err instanceof Error && err.message.includes("CONSTRAINT")) {
					return yourFault(
						"its either the artist doesn't exist or the drawing was already submitted",
					);
				}
			}
		},
	);

	app.post(
		"/api/admin/drawings/delete/",
		withRequireAdmin,
		async ({ content }) => {
			if (!content.id) return yourFault("id: int");
			await sql.removeDrawing(env.beadle, content.id).run();

			return Response.json({
				status: "200",
			});
		},
	);

	app.post(
		"/api/admin/drawings/list/",
		withRequireAdmin,
		async ({ _content }) => {
			const res: D1Result<sql.DbDrawing> = await sql
				.listDrawings(env.beadle)
				.run();

			return Response.json({
				status: "200",
				drawings: res.results.map((drawing) => {
					return {
						id: drawing.id,
						artist: drawing.artistId,
						hash: drawing.hash,
					};
				}),
			});
		},
	);

	app.post(
		"/api/admin/drawings/view/",
		withRequireAdmin,
		async ({ content }) => {
			if (!content.id) return yourFault("id: int");
			const drawing: null | sql.DbDrawing = await sql
				.getDrawing(env.beadle, content.id)
				.first();
			if (drawing == null) return notFound("drawing not found");

			const image: null | sql.DbDrawingImage = await sql
				.getDrawingImage(env.beadle, drawing.hash)
				.first();
			if (image == null)
				return serverFault("drawing WAS found but the image wasn't");

			const b64 = await getImage(image.imageKey);
			if (b64 == null)
				return serverFault(
					"drawing WAS found, image WAS found, but it was not in the cdn server???",
				);

			return new Response(
				Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)),
				{
					headers: {
						"Content-Type": "image/png",
					},
				},
			);
		},
	);

	app.post("/api/admin/artist/new/", withRequireAdmin, async ({ content }) => {
		if (
			!(content.commonName && content.aliases) ||
			typeof content.aliases !== "object"
		)
			return yourFault("commonName: str\naliases: str[]");

		try {
			await sql
				.addArtist(env.beadle, content.commonName, content.aliases)
				.run();
		} catch (err) {
			if (err instanceof Error && err.message.includes("UNIQUE")) {
				return yourFault("commonName: str\naliases: str[]");
			}
		}
		return Response.json({
			status: "200",
		});
	});

	app.post(
		"/api/admin/artist/editAliases/",
		withRequireAdmin,
		async ({ content }) => {
			if (!(content.id && (content.aliases || content.delAliases)))
				return yourFault("id: int\naliases: str[]");

			const res: null | sql.DbArtist = await sql
				.getArtist(env.beadle, content.id)
				.first();
			if (res == null) return notFound("artist id not found");

			let aliases: string[] = JSON.parse(res.aliases);

			content.aliases?.forEach((v: string) => {
				aliases.push(v);
			});

			if (content.delAliases) {
				aliases = aliases.filter(
					(a) => content.delAliases.find((d: string) => a === d) === undefined,
				);
			}

			await sql.updateArtistAlias(env.beadle, aliases, content.id).run();

			return Response.json({
				status: "200",
				aliases: aliases,
			});
		},
	);
}
