import * as sql from './sql.ts';
import { env } from "cloudflare:workers";

export async function getDrawingFor(day: number): Promise<sql.DbDrawing | null> {
    const bucket = await getPossibilitiesFor(day);
    console.log(bucket)
    if (bucket.length === 0) {
        return null;
    }

    return await env.beadle.prepare(sql.getDrawing).bind(bucket[Math.floor(Math.random()*bucket.length)]).first();
}

async function getPossibilitiesFor(day: number) {
    const dbBlacklist: D1Result<sql.DbHistory> = await env.beadle.prepare(sql.recentHistory).bind(day - 10).run();
    const dbDrawings: D1Result<sql.DbDrawing> = await env.beadle.prepare(sql.listDrawings).run();

    const drawings: number[] = dbDrawings.results.map((drawing) => {
        return drawing.id
    })

    const blacklist: number[] = dbBlacklist.results.map((history) => {
        return history.drawingId
    })

    return drawings.filter((d) => blacklist.find((b) => d === b) !== undefined)
}
