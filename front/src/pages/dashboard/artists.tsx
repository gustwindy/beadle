import { useState } from "react";

import HintedInput from "../../components/hintedInput";
import "./artists.css";
import { api } from "../../lib/api";
import { useArtistIds, useUsers } from "../../lib/dashboardUsuals";

export default function Artists() {
    const [userId, setUserId] = useState("");
    const [name, setName] = useState("");
    const [thingThatCountsUp, set] = useState(0);
    const users = useUsers();
    const artists = useArtistIds();

    return (
        <div>
            <div className="boxed">
                <h1>New artist</h1>
                <div className="horizontal" key={thingThatCountsUp}>
                    <HintedInput hint="Common Name" setter={setName} />
                    <HintedInput hint="Discord User ID" setter={setUserId} />
                    <button
                        type="button"
                        onClick={async () => {
                            const result = await api.artist.new(userId, name);

                            set(thingThatCountsUp + 1);
                            if (result.status === 200) alert("done!");
                        }}
                    >
                        Submit
                    </button>
                </div>
                <span>
                    {Number(userId)
                        ? artists.includes(userId)
                            ? "id is already an artist!"
                            : users.includes(userId)
                              ? "id has an account made in beadle!"
                              : "id does not have an account in beadle, but you can still add it."
                        : "that is not a number"}
                </span>
            </div>
        </div>
    );
}
