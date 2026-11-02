import "./drawings.css";

import { type CSSProperties, useState } from "react";

import PrettySelect from "../../components/prettySelect";
import { api } from "../../lib/api";
import { type Artist, useArtists } from "../../lib/dashboardUsuals";

function paginate<T>(arr: T[], chunkSize: number) {
    console.log(arr);

    const numChunks = Math.ceil(arr.length / chunkSize);
    return Array.from({ length: numChunks }, (_, i) => {
        const start = i * chunkSize;
        return arr.slice(start, start + chunkSize);
    });
}

function GetDrawings({ artists }: { artists: Artist[] }) {
    const [picked, setter] = useState("");
    const [drawingPages, setDrawings] = useState<{ imageHash: string }[][]>([]);
    const [currentPage, setPage] = useState(-1);
    const [fetchedDrawings, setFetched] = useState<string[]>([]);
    return (
        <div className="gapped">
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

                            setDrawings(
                                paginate(
                                    (await api.drawings.list(chosen.userId))
                                        .content,
                                    5,
                                ),
                            );
                            setPage(-1);
                        }}
                    >
                        Submit
                    </button>
                </div>
            </div>
            <div className="boxed">
                <h1>Results</h1>
                <div className="horizontal">
                    {drawingPages.map((_, idx) => {
                        return (
                            <button
                                type="button"
                                // biome-ignore lint/suspicious/noArrayIndexKey: GRRRRR NOT AGAIN
                                key={idx}
                                onClick={async () => {
                                    setPage(-2);
                                    setFetched(
                                        (
                                            await api.drawings.get(
                                                drawingPages[idx].map(
                                                    (a) => a.imageHash,
                                                ),
                                            )
                                        ).content,
                                    );
                                    console.log(fetchedDrawings);
                                    setPage(idx);
                                }}
                            >
                                {idx * 5}-{idx * 5 + 5}
                            </button>
                        );
                    })}
                </div>
                {currentPage > -1 ? (
                    <div className="horizontal">
                        {fetchedDrawings.map((v, idx) => {
                            const style: CSSProperties = {
                                backgroundImage: `url("${v}")`,
                            };

                            return (
                                <span
                                    key={v}
                                    style={style}
                                    title={`id: ${idx + currentPage * 5}`}
                                    className="drawing boxed"
                                />
                            );
                        })}
                    </div>
                ) : currentPage === -1 ? (
                    <span>Click page buttons above to preview.</span>
                ) : (
                    <span>Please wait...</span>
                )}
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
                <input
                    type="file"
                    onChange={(a) => setFile(a.target.files?.[0])}
                />
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
