export const baseApi = "/api/";

async function api(endpoint, init) {
    const url = baseApi + endpoint;

    try {
        return await (await fetch(url, init)).json();
    } catch (e) {
        alert("please scream at windy. something went wrong (check devtools)");
        console.error(e);
    }
}

export async function today() {
    return await api("today");
}

export async function guess(answer) {
    return await api(`today/guess/${answer}`);
}

export async function artists() {
    return await api("artistList");
}
