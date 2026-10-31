CREATE TABLE IF NOT EXISTS sessions (
	sessionKey TEXT PRIMARY KEY,
	expiresAt INTEGER NOT NULL,
	userId TEXT NOT NULL,

	FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS users (
	id TEXT PRIMARY KEY,
	username TEXT NOT NULL,
	displayName TEXT NOT NULL,

	serverJoinDate INTEGER NOT NULL,
	avatarHash TEXT NOT NULL,

	streak INTEGER NOT NULL DEFAULT 0,

	lastPlaySession TEXT NOT NULL DEFAULT "{}",
	settings TEXT NOT NULL DEFAULT "{}"
);

CREATE TABLE IF NOT EXISTS codeCollection (
	code TEXT PRIMARY KEY,
	sessionKey TEXT NOT NULL,
	expiresAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS artist (
    userId TEXT PRIMARY KEY NOT NULL,
    displayNameOverride TEXT
);
