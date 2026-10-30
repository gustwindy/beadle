// biome-ignore lint/suspicious/noExplicitAny: well its json
export function response(content: any, status: number = 200) {
	return Response.json(
		{
			status,
			content,
		},
		{ status },
	);
}

export function serverFault(comment?: string) {
	return response(`ping windy if persists !! ${comment}`, 500);
}

export function notFound(comment?: string) {
	return response(`not found !! ${comment}`, 404);
}

export function yourFault(comment?: string) {
	return response(`i hope u understand: ${comment}`, 400);
}
