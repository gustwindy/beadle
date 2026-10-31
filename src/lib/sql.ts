import { DEFAULT_SETTINGS, ONE_DAY } from "../constants.ts";

export const sql = {
	users: {
		new: async (
			db: D1Database,
			id: string,
			serverJoinDate: number,
			username: string,
			displayName: string,
			avatarHash: string,
		) => {
			return await db
				.prepare(
					"INSERT INTO users (id, serverJoinDate, username, displayName, avatarHash) VALUES (?,?,?,?,?)",
				)
				.bind(id, serverJoinDate, username, displayName, avatarHash)
				.run();
		},

		get: async (db: D1Database, id: string): Promise<DbUser | undefined> => {
			const user: {
				id: string;
				username: string;
				displayName: string;
				serverJoinDate: number;
				avatarHash: string;

				isAdmin: boolean;

				streak: number;
				lastPlaySession: string;
				settings: string;
			} | null = await db
				.prepare("SELECT * FROM users WHERE id = ?")
				.bind(id)
				.first();

			if (!user) return;

			return {
				id: user.id,
				username: user.username,
				displayName: user.displayName,
				serverJoinDate: user.serverJoinDate,

				avatarHash: user.avatarHash,
				isAdmin: user.isAdmin,

				streak: user.streak,
				// erm what the frick
				lastPlaySession:
					user.lastPlaySession.length > 2
						? JSON.parse(user.lastPlaySession)
						: null,
				settings:
					user.settings.length > 2
						? JSON.parse(user.settings)
						: JSON.parse(DEFAULT_SETTINGS),
			};
		},

		fromSession: async (
			db: D1Database,
			sessionKey: string,
		): Promise<DbUser | undefined> => {
			const session = await sql.sessions.get(db, sessionKey);
			if (!session) return;

			const user = await sql.users.get(db, session.userId);
			if (!user) return;

			return user;
		},
	},
	sessions: {
		new: async (db: D1Database, userId: string) => {
			const key = crypto.randomUUID();
			await db
				.prepare(
					"INSERT INTO sessions (sessionKey, expiresAt, userId) VALUES (?,?,?)",
				)
				.bind(key, Date.now() + ONE_DAY * 3, userId)
				.run();
			return key;
		},
		get: async (
			db: D1Database,
			sessionKey: string,
		): Promise<DbSession | undefined> => {
			const session: DbSession | null = await db
				.prepare("SELECT * FROM sessions WHERE sessionKey = ?")
				.bind(sessionKey)
				.first();

			if (!session || Date.now() > session.expiresAt) return;

			await sql.sessions.lengthen(db, session.sessionKey);

			return session;
		},
		lengthen: async (db: D1Database, sessionKey: string) => {
			return await db
				.prepare("UPDATE sessions SET expiresAt = ? WHERE sessionKey = ?")
				.bind(Date.now() + ONE_DAY * 3, sessionKey)
				.run();
		},
	},
	codeCollection: {
		put: async (db: D1Database, code: string, sessionKey: string) => {
			await db
				.prepare(
					"INSERT INTO codeCollection (code, sessionKey, expiresAt) VALUES (?,?,?)",
				)
				.bind(code, sessionKey, Date.now() + ONE_DAY)
				.run();
		},
		get: async (db: D1Database, code: string): Promise<string | undefined> => {
			const collect: {
				code: string;
				sessionKey: string;
				expiresAt: number;
			} | null = await db
				.prepare("SELECT * FROM codeCollection WHERE code = ?")
				.bind(code)
				.first();
			if (!collect) return;

			await db
				.prepare("DELETE FROM codeCollection WHERE code = ?")
				.bind(code)
				.run();

			if (Date.now() > collect.expiresAt) {
				return;
			}

			return collect.sessionKey;
		},
	},
};

export type DbSettings = {
	useLegacyLogo: boolean;
};

export type DbUser = {
	id: string;
	serverJoinDate: number;

	username: string;
	displayName: string;

	isAdmin: boolean;
	avatarHash: string;

	streak: number;
	settings: DbSettings;
	lastPlaySession?: {
		day: number;
		guessArtistIds: number[];
		startTime: number;
		endTime: number;
	};
};

export type DbSession = {
	sessionKey: string;
	expiresAt: number;
	userId: string;
};
