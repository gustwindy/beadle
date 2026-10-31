import React from "react";
import "./sidebar.css";

function SidebarButton({
    active,
    data,
}: {
    active: boolean;
    data: { id: string; name: string };
}) {
    return (
        <a href={`#${data.id}`} className={active ? "active" : ""}>
            {data.name}
        </a>
    );
}

export default function Sidebar({
    subpages,
    hash,
}: {
    subpages: { id: string; name: string }[];
    hash: string;
}) {
    return (
        <div className="sidebar">
            <h1>beadle</h1>
            {subpages.map((sub) => {
                return (
                    <SidebarButton
                        key={sub.id}
                        data={sub}
                        active={hash === `#${sub.id}`}
                    />
                );
            })}
        </div>
    );
}
