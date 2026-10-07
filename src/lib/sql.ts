export const addArtist = `INSERT INTO artists (commonName,aliases) VALUES (?,?)`;
export const addDrawing = `INSERT INTO drawings (artistId,image) VALUES (?,?)`;
export const addHistory = `INSERT INTO history (time,drawingId) VALUES (?,?)`;

export const removeDrawing = `DELETE FROM drawings WHERE id = ?`;

export const listArtists = `SELECT * FROM artists`;
export const listDrawings = `SELECT * FROM drawings`;
export const listHistory = `SELECT * FROM history`;

export const recentHistory = `SELECT * FROM history WHERE day > ?`;
export const lastHistory = `SELECT * FROM history ORDER BY day DESC LIMIT 1`;

export const getDrawing = `SELECT * FROM drawings WHERE id = ?`;
export const getArtist = `SELECT * FROM artists WHERE id = ?`;

export const updateArtistAlias = `UPDATE artists SET aliases = ? WHERE id = ?`;

export type DbArtist = {
    id: number,
    commonName: string,
    aliases: string,
}

export type DbDrawing = {
    id: number,
    image: string,
    artistId: number,
}

export type DbHistory = {
    day: number,
    time: number,
    drawingId: number,
}
