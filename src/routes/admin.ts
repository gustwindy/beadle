import { type RouterType, type IRequest } from 'itty-router';
import { env } from "cloudflare:workers";
import * as sql from '../lib/sql.ts';

const withRequireAdmin = async (request: IRequest) => {
    console.log(env)
    try {
        const content: Record<string, any> = await request.json();
        if (content.secret !== env.ADMIN_SECRET) {
            return Response.json({
                "status": "404",
                "message": "no"
            },{status: 404})
        }

        request.content = content;
    } catch (err) {
        return Response.json({
            "status": "500",
            "message": "no"
        },{status: 500})
    }
}

export function adminRoutes(app: RouterType) {
    if (!app.post) return;

    app.post("/api/admin/drawings/new/", withRequireAdmin, async ({ content }) => {
        if (!(content.artistId && content.encodedImage)) {
            return Response.json({
                "status": "400",
                "message": "artistId: int\nencodedImage: str // base64 encoded image"
            },{status: 400})
        }
        await env.beadle.prepare(sql.addDrawing).bind(content.artistId, content.encodedImage).run()

        return Response.json({
            "status": "200"
        })
    });

    app.post("/api/admin/drawings/delete/", withRequireAdmin, async ({ content }) => {
        if (!(content.id)) {
            return Response.json({
                "status": "400",
                "message": "id: int"
            },{status: 400})
        }
        await env.beadle.prepare(sql.removeDrawing).bind(content.id).run()

        return Response.json({
            "status": "200"
        })
    });

    app.post("/api/admin/drawings/list/", withRequireAdmin, async ({ content }) => {
        const res: D1Result<sql.DbDrawing> = await env.beadle.prepare(sql.listDrawings).run()

        return Response.json({
            "status": "200",
            "drawings": res.results.map((drawing) => {
                console.log(drawing)
                return {
                    "id": drawing.id,
                    "artist": drawing.artistId
                }
            })
        })
    });

    app.post("/api/admin/drawings/view/", withRequireAdmin, async ({ content }) => {
        if (!(content.id)) {
            return Response.json({
                "status": "400",
                "message": "id: int"
            },{status: 400})
        }
        const res: null | sql.DbDrawing = await env.beadle.prepare(sql.getDrawing).bind(content.id).first()
        if (res == null) {
            return Response.json({
                "status": "404",
                "message": "drawing id not found"
            },{status: 404})
        }

        return new Response(Uint8Array.from(atob(res.image), c => c.charCodeAt(0)), {
            headers: {
                "Content-Type": "image/png"
            }
        })
    });

    app.post("/api/admin/artist/new/", withRequireAdmin, async ({ content }) => {
        if (!(content.commonName && content.aliases)||typeof content.aliases !== "object") {
            return Response.json({
                "status": "400",
                "message": "commonName: str\naliases: str[]"
            },{status: 400})
        }

        try {
            await env.beadle.prepare(sql.addArtist).bind(content.commonName, JSON.stringify(content.aliases)).run()
        } catch (err) {
            if (err instanceof Error && err.message.includes("UNIQUE")) {
                return Response.json({
                    "status": "400",
                    "message": "commonName: str\naliases: str[]"
                },{status: 400})
            }
        }
        return Response.json({
            "status": "200"
        })
    });

    app.post("/api/admin/artist/editAliases/", withRequireAdmin, async ({ content }) => {
        if (!(content.id && (content.aliases||content.delAliases))) {
            return Response.json({
                "status": "400",
                "message": "id: int\naliases: str[]"
            },{status: 400})
        }

        const res: null | sql.DbArtist = await env.beadle.prepare(sql.getArtist).bind(content.id).first()
        if (res == null) {
            return Response.json({
                "status": "404",
                "message": "artist id not found"
            },{status: 404})
        }

        let aliases: string[] = content.aliases;

        content.aliases?.forEach((v: string) => {
            aliases.push(v)
        })

        if (content.delAliases) {
            aliases = aliases.filter((a) => content.delAliases.find((d: string) => a === d) === undefined)
        }

        await env.beadle.prepare(sql.updateArtistAlias).bind(JSON.stringify(aliases), content.id).run()

        return Response.json({
            "status": "200",
            "aliases": aliases
        })
    });
}
