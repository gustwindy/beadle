import type { RouterType } from "itty-router";

import { serverFault, yourFault } from "../lib/errors.ts";
import { genHint } from "../lib/hints.ts";
import { getImage } from "../lib/s3.ts";
import * as sql from "../lib/sql.ts";
import { env } from "cloudflare:workers";

export function routes(app: RouterType) {
	app.get("/api/today/", async (_request) => {
		const last: null | sql.DbHistory = await sql
			.lastHistory(env.beadle)
			.first();
		if (!last) return serverFault("no beadle ?!");

		const drawing: null | sql.DbDrawing = await sql
			.getDrawing(env.beadle, last?.drawingId)
			.first();
		if (!drawing) return serverFault("no drawing ?!");

		return Response.json({
			status: "200",
			current: {
				day: last?.day,
				time: last?.time,
				drawing: `/api/today/image/${drawing.hash}`,
			},
		});
	});

	app.get("/api/today/guess/:guess", async ({ params }) => {
		const last: null | sql.DbHistory = await sql
			.lastHistory(env.beadle)
			.first();
		if (!last) return serverFault("no beadle ?!");

		const drawing: null | sql.DbDrawing = await sql
			.getDrawing(env.beadle, last?.drawingId)
			.first();
		if (!drawing) return serverFault("no drawing ?!");

		const artist: null | sql.DbArtist = await sql
			.getArtist(env.beadle, drawing?.artistId)
			.first();
		if (!artist) return serverFault("no artist ?!");

		if (!params.guess) return yourFault("no guess ?!");
		const correct = params.guess === artist.commonName;

		return Response.json({
			status: "200",
			correct,
			hint: correct
				? "correct"
				: await genHint(artist.commonName, params.guess),
		});
	});

	app.get("/api/today/image/:hash", async (request) => {
		const { params } = request;

		const last: null | sql.DbHistory = await sql
			.lastHistory(env.beadle)
			.first();
		if (!last) return serverFault("no beadle ?!");

		const drawing: null | sql.DbDrawing = await sql
			.getDrawing(env.beadle, last.drawingId)
			.first();
		if (!drawing) return serverFault("no drawing ?!");

		const image: null | sql.DbDrawingImage = await sql
			.getDrawingImage(env.beadle, drawing.hash)
			.first();
		if (!image) return serverFault("no image ?!");

		if (params.hash !== image.hash) {
			return yourFault("no!!");
		}

		const cacheKey = new URL(`/api/today/image/${image.hash}`, request.url);
		const cached = await caches.default.match(cacheKey); // my ide keeps complaining about this
		if (cached) return cached;

		const b64 = await getImage(image.imageKey);
		if (b64 == null) {
			return serverFault("image missing from S3");
		}

		const response = new Response(
			Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)),
			{
				headers: {
					"Content-Type": "image/png",
					"Cache-Control": "public, max-age=300",
				},
			},
		);

		await caches.default.put(cacheKey, response.clone());

		return response;
	});

	app.get("/api/artistList/", async (_request) => {
		const res: D1Result<sql.DbArtist> = await sql.listArtists(env.beadle).run();

		return Response.json({
			status: "200",
			artists: res.results.map((artist) => {
				if (typeof artist.aliases !== "string")
					return {
						id: artist.id,
					};
				return {
					id: artist.id,
					commonName: artist.commonName,
					aliases: JSON.parse(artist.aliases),
				};
			}),
		});
	});
}
