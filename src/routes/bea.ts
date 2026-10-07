import { type RouterType, type IRequest } from 'itty-router';
import { env } from "cloudflare:workers";
import * as sql from '../lib/sql.ts';

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

    })

    app.get("/api/artistList/", async (_request) => {
        const res: D1Result<sql.DbArtist> = await env.beadle.prepare(sql.listArtists).run();

        return Response.json({
            "status": "200",
            "artists": res.results.map((artist) => {
                if (typeof artist.aliases !== "string") return {
                    "id": artist.id
                };
                return {
                    "id": artist.id,
                    "commonName": artist.commonName,
                    "aliases": JSON.parse(artist.aliases),
                }
            })
        })
    })
}
