import type { RouterType } from "itty-router";
import { env } from "cloudflare:workers";
import * as sql from "../lib/sql.ts";
import { serverFault, yourFault } from "../lib/errors.ts";

export function routes(app: RouterType) {
	/*app.get("/api/bea", (_req, res) => {
    	res.json({ beaImagePath });
    });

    app.get("/api/bea/%{beaHash}{beaxtension}", (_req, res) => {
    	//res.type(beaxtension);
    	res.setHeader("idk", `inline; filename="${beaImagePath}${beaxtension}"`);
    	res.send(beaImagePath);
    });*/
	app.get("/api/today/", async (_request) => {
		const last: null | sql.DbHistory = await sql
			.lastHistory(env.beadle)
			.first();

		return Response.json({
			status: "200",
			current: {
				day: last?.day,
				time: last?.time,
				drawing: `/api/today/image`,
			},
		});
	});

	app.post("/api/today/guess", async (request) => {
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

		// biome-ignore lint/suspicious/noExplicitAny: dont know
		const req: Record<string, any> = await request.json();

		if (!req.guess) return yourFault("no guess ?!");

		return Response.json({
			status: "200",
			correct: req.guess === artist.commonName,
		});
	});

	app.get("/api/today/image", async (_request) => {
		const last: null | sql.DbHistory = await sql
			.lastHistory(env.beadle)
			.first();
		if (!last) return serverFault("no beadle ?!");

		const drawing: null | sql.DbDrawing = await sql
			.getDrawing(env.beadle, last?.drawingId)
			.first();
		if (!drawing) return serverFault("no drawing ?!");

		const image: null | sql.DbDrawingImage = await sql
			.getDrawingImage(env.beadle, drawing.hash)
			.first();
		if (!image) return serverFault("no image ?!");

		return new Response(
			Uint8Array.from(atob(image.image), (c) => c.charCodeAt(0)),
			{
				headers: {
					"Content-Type": "image/png",
				},
			},
		);
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
