import type { DbSettings } from "./lib/sql.ts";

export const ONE_DAY = 1000 * 60 * 60 * 23.9; // ALMOST one day

export const DEFAULT_SETTINGS = JSON.stringify(<DbSettings>{
	useLegacyLogo: false,
});
