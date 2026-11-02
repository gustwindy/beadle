import { useState } from "react";

import PrettySelect from "../../components/prettySelect";
import { useArtists } from "../../lib/dashboardUsuals";

export default function Drawings() {
    const artists = useArtists();
    const [a, setter] = useState("");

    console.log(artists);

    return (
        <div>
            <div className="boxed">
                <h1>Get Drawings</h1>
                <div className="horizontal">
                    <PrettySelect
                        hint="Pick Artist"
                        options={artists.map((a) => a.name)}
                        setter={setter}
                    />
                    <button type="button" onClick={async () => {}}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
