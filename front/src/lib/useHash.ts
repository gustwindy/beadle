import { useEffect, useState } from "react";

// shout out for teaching me everything react (and this helper below): nyarw

// nyarw, if you're one day reading this, why have you gone?
// why'd you delete the server? i wasn't active
// i noticed the server was gone, then you blocked me

// what happened?

export function useHash() {
	const [hash, setHash] = useState("");

	useEffect(() => {
		setHash(window.location.hash);
		const update = () => setHash(window.location.hash);

		window.addEventListener("hashchange", update);
		window.addEventListener("popstate", update);
		window.addEventListener("locationchange", update);

		return () => {
			window.removeEventListener("hashchange", update);
			window.removeEventListener("popstate", update);
			window.removeEventListener("locationchange", update);
		};
	});

	return hash;
}
