import * as sql from "./sql.ts";
import { env } from "cloudflare:workers";

export async function getDrawingFor(
	day: number,
): Promise<sql.DbDrawing | null> {
	const bucket = await getPossibilitiesFor(day);
	console.log(bucket.length);
	if (bucket.length === 0) {
		return null;
	}

	const choice = bucket[Math.floor(Math.random() * bucket.length)];
	return await sql.getDrawing(env.beadle, choice ?? 0).first();
}

async function getPossibilitiesFor(day: number) {
	const dbBlacklist: D1Result<sql.DbHistory> = await sql
		.recentHistory(env.beadle, day - 10)
		.run();
	const dbDrawings: D1Result<sql.DbDrawing> = await sql
		.listDrawings(env.beadle)
		.run();

	const drawings: number[] = dbDrawings.results.map((drawing) => {
		return drawing.id;
	});

	const blacklist: number[] = dbBlacklist.results.map((history) => {
		return history.drawingId;
	});

	console.log(drawings.length, blacklist.length);

	return drawings.filter((d) => blacklist.find((b) => d === b) === undefined);
}
