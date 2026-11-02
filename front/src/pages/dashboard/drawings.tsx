import { useState } from "react";

import PrettySelect from "../../components/prettySelect";
import { api } from "../../lib/api";
import { type Artist, useArtists } from "../../lib/dashboardUsuals";

function GetDrawings({ artists }: { artists: Artist[] }) {
	const [picked, setter] = useState("");
	return (
		<div className="boxed">
			<h1>Get Drawings</h1>
			<div className="horizontal">
				<PrettySelect
					hint="Pick Artist"
					options={artists.map((a) => a.name)}
					setter={setter}
				/>
				<button
					type="button"
					onClick={async () => {
						const chosen = artists.find((v) => {
							return picked === v.name;
						});
						if (!chosen) return alert("error");

						console.log(await api.drawings.list(chosen.userId));
					}}
				>
					Submit
				</button>
			</div>
		</div>
	);
}

function UploadDrawing({ artists }: { artists: Artist[] }) {
	const [picked, setter] = useState("");
	const [file, setFile] = useState<File | null | undefined>(null);
	return (
		<div className="boxed">
			<h1>Upload Drawing</h1>
			<PrettySelect
				hint="Pick Artist"
				options={artists.map((a) => a.name)}
				setter={setter}
			/>
			<div className="horizontal">
				<input type="file" onChange={(a) => setFile(a.target.files?.[0])} />
				<button
					type="button"
					onClick={async () => {
						const chosen = artists.find((v) => {
							return picked === v.name;
						});
						if (!file) return alert("no file");
						if (!chosen) return alert("error");

						await api.drawings.new(chosen.userId, file);
						alert("done");
					}}
				>
					Upload Drawing
				</button>
			</div>
		</div>
	);
}

export default function Drawings() {
	const artists = useArtists();

	return (
		<div>
			<UploadDrawing artists={artists} />
			<GetDrawings artists={artists} />
		</div>
	);
}
