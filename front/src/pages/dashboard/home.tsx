import { useArtistIds, useUsers } from "../../lib/dashboardUsuals";
import "./home.css";

function InfoBox({
    displayName,
    value,
}: {
    displayName: string;
    value: string;
}) {
    return (
        <span className="boxed">
            <span className="label">{displayName}</span>
            <span className="value">{value}</span>
        </span>
    );
}

export default function Home() {
    const users = useUsers();
    const artists = useArtistIds();

    const data = [
        {
            displayName: "Total Users",
            value: users.length,
        },
        {
            displayName: "Total Artists",
            value: artists.length,
        },
    ];
    return (
        <div>
            <div className="horizontal">
                {data.map((info) => {
                    return (
                        <InfoBox
                            key={info.displayName}
                            displayName={info.displayName}
                            value={info.value.toString()}
                        />
                    );
                })}
            </div>
        </div>
    );
}
