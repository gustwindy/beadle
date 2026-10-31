import { useEffect, useState } from "react";

import { api } from "./api";

export function useUsers() {
	const [ids, setList] = useState([] as string[]);
	const [fetched, setFetched] = useState(false);

	useEffect(() => {
		if (!fetched) {
			setFetched(true);
			api.users.listIds().then((list) => {
				setList(list.content);
			});
		}
	});

	return ids;
}

export function useArtists() {
	const [ids, setList] = useState([] as string[]);
	const [fetched, setFetched] = useState(false);

	useEffect(() => {
		if (!fetched) {
			setFetched(true);
			api.artist.listIds().then((list) => {
				setList(list.content);
			});
		}
	});

	return ids;
}
