import "./home.css";

function InfoBox({
    displayName,
    value,
}: {
    displayName: string;
    value: string;
}) {
    return (
        <span className="infoBox">
            <span className="label">{displayName}</span>
            <span className="value">{value}</span>
        </span>
    );
}

export default function Home() {
    const aaa = [
        {
            displayName: "Total Drawings",
            value: 123,
        },
    ];
    return (
        <div>
            <div className="showoff">
                {aaa.map((info) => {
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
