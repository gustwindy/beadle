import type { D1Database } from "@cloudflare/workers-types";
import { createHash } from "crypto";
import { uploadImage } from "./s3.ts";

export function addArtist(
	db: D1Database,
	commonName: string,
	aliases: string[],
) {
	return db
		.prepare("INSERT INTO artists (commonName,aliases) VALUES (?,?)")
		.bind(
			commonName.toLowerCase(),
			JSON.stringify(aliases.map((a) => a.toLowerCase())),
		);
}

export function addDrawing(db: D1Database, artistId: number, hash: string) {
	return db
		.prepare("INSERT INTO drawings (artistId,hash) VALUES (?,?)")
		.bind(artistId, hash);
}

export function addDrawingImage(
	db: D1Database,
	hash: string,
	imageKey: string,
) {
	return db
		.prepare("INSERT INTO images (hash,imageKey) VALUES (?,?)")
		.bind(hash, imageKey);
}

export async function lazyAddDrawing(
	db: D1Database,
	artistId: number,
	image: string,
) {
	const hash: string = createHash("md5").update(image).digest("hex");
	const imageKey = await uploadImage(image);

	const artist: null | DbArtist = await getArtist(db, artistId).first();
	if (!artist) return -1;

	await addDrawingImage(db, hash, imageKey).run();
	const res = await addDrawing(db, artist.id, hash).run();

	return res.meta.last_row_id;
}

export function addHistory(
	db: D1Database,
	day: number,
	time: number,
	drawingId: number,
) {
	return db
		.prepare("INSERT INTO history (day,time,drawingId) VALUES (?,?,?)")
		.bind(day, time, drawingId);
}

export function removeDrawing(db: D1Database, id: number) {
	return db.prepare("DELETE FROM drawings WHERE id = ?").bind(id);
}

export function listArtists(db: D1Database) {
	return db.prepare("SELECT * FROM artists");
}

export function listDrawings(db: D1Database) {
	return db.prepare("SELECT * FROM drawings");
}

export function listHistory(db: D1Database) {
	return db.prepare("SELECT * FROM history");
}

export function recentHistory(db: D1Database, today: number) {
	return db.prepare("SELECT * FROM history WHERE day > ?").bind(today - 10);
}

export function lastHistory(db: D1Database) {
	return db.prepare("SELECT * FROM history ORDER BY day DESC LIMIT 1");
}

export function getDrawing(db: D1Database, id: number) {
	return db.prepare("SELECT * FROM drawings WHERE id = ?").bind(id);
}

export function getDrawingImage(db: D1Database, hash: string) {
	return db.prepare("SELECT * FROM images WHERE hash = ?").bind(hash);
}

export function getArtist(db: D1Database, id: number) {
	return db.prepare("SELECT * FROM artists WHERE id = ?").bind(id);
}

export function updateArtistAlias(
	db: D1Database,
	aliases: string[],
	id: number,
) {
	return db
		.prepare("UPDATE artists SET aliases = ? WHERE id = ?")
		.bind(JSON.stringify(aliases), id);
}

export type DbArtist = {
	id: number;
	commonName: string;
	aliases: string;
};

export type DbDrawingImage = {
	hash: string;
	imageKey: string;
};

export type DbDrawing = {
	id: number;
	hash: string;
	artistId: number;
};

export type DbHistory = {
	day: number;
	time: number;
	drawingId: number;
};
