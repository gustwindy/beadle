import { useEffect, useState } from "react";

import { api } from "./api";

export type Artist = {
	userId: string;
	name: string;
	imageUrl: string;
};

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

export function useArtistIds() {
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

export function useArtists() {
	const [ids, setList] = useState([] as Artist[]);
	const [fetched, setFetched] = useState(false);

	useEffect(() => {
		if (!fetched) {
			setFetched(true);
			api.artist.list().then((list) => {
				setList(list.content);
			});
		}
	});

	return ids;
}
