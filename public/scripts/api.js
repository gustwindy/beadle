export const baseApi = "/api/";

function api(endpoint) {
	return baseApi + endpoint;
}

export async function today() {
	const res = await fetch(api("bea"), {
		next: { revalidate: 300 },
	});
	return await res.json();
}
