export function getCookie(cookieString?: string | null) {
	const cookies = cookieString?.split(";").map((a) => a.trim().split("="));
	const f = cookies?.find((a) => a[0] === "session");

	if (!f) return;
	return f.length === 2 ? f[1] : undefined;
}
