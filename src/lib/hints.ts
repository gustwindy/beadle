import * as sql from "./sql.ts";
import { env } from "cloudflare:workers";

type HintType = {
	onFalse?: string;
	onTrue?: string;
	check?: (correct: string, guess: string) => boolean | null;
	special?: (correct: string, guess: string) => string | null;
};

const hintTypes: HintType[] = [
	{
		onTrue: "Artist's name is longer.",
		onFalse: "Artist's name is shorter.",
		check: (correct, guess) => {
			if (correct.length === guess.length) return null;
			return correct.length > guess.length;
		},
	},
	{
		onTrue: "Artist's name starts with the same letter.",
		check: (correct, guess) => {
			return correct.charAt(0) === guess.charAt(0);
		},
	},
	{
		onTrue: "Artist's name is the same length.",
		check: (correct, guess) => {
			return correct.length === guess.length;
		},
	},
];

function checkFor(
	hintType: HintType,
	artists: string[],
	correct: string,
	guess: string,
) {
	if (!hintType.check) return 0;
	const val = hintType.check(correct, guess);
	console.log(correct, guess, val);

	if (
		val === null ||
		(val === true && hintType.onTrue === undefined) ||
		(val === false && hintType.onFalse === undefined)
	) {
		return 0;
	}

	let count = 0;

	artists.forEach((artist) => {
		if (!hintType.check) return; // i JUST checked for this btw
		if (hintType.check(artist, guess) === val) {
			console.log(artist, guess);
			count++;
		}
	});

	return count;
}

export async function genHint(correct: string, guess: string) {
	const res: D1Result<sql.DbArtist> = await sql.listArtists(env.beadle).run();
	const artists: string[] = res.results.map((a) => a.commonName);

	// i come from lua this is how i do my comparisons
	let highestCount = 0;
	let hint: string = "No hint";

	hintTypes.forEach((hintType) => {
		const count = checkFor(hintType, artists, correct, guess);
		console.log(count);
		if (count > highestCount) {
			highestCount = count;
			if (!hintType.check) return; // THIS IS THE 2nd + O(n)TH TIME IVE CHECKED
			hint =
				(hintType.check(correct, guess) ? hintType.onTrue : hintType.onFalse) ??
				"No hint";
		}
	});

	return hint;
}
