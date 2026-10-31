const BASE_API = "/api/";

function uri(endpoint: string) {
	return new URL(`${BASE_API}${endpoint}`, location.toString()).toString();
}

// biome-ignore lint/suspicious/noExplicitAny: json
async function post(endpoint: string, body: any) {
	const req = await fetch(endpoint, {
		method: "POST",
		body: JSON.stringify(body),
	});

	if (!req.ok) alert(await req.text());

	return req.json();
}

async function get(endpoint: string) {
	const req = await fetch(endpoint);

	if (!req.ok) alert(await req.text());

	return req.json();
}

export const api = {
	users: {
		listIds: async () => {
			return await get(uri("admin/users/list"));
		},
	},
	artist: {
		new: async (userId: string, name: string) => {
			return await post(uri("admin/artist/new"), {
				userId,
				name,
			});
		},
		listIds: async () => {
			return await get(uri("artistList"));
		},
	},
};
