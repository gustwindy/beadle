import { useEffect } from "react";

import Sidebar from "../components/dashboard/sidebar";
import { useHash } from "../lib/useHash";

import "./dashboard.css";
import Home from "./dashboard/home";
import Artists from "./dashboard/artists";
import Drawings from "./dashboard/drawings";

export default function Dashboard() {
    const hash = useHash();

    const subpages = [
        {
            id: "home",
            name: "Home",
            element: <Home />,
        },
        {
            id: "artists",
            name: "Artists",
            element: <Artists />,
        },
        {
            id: "drawings",
            name: "Drawings",
            element: <Drawings />,
        },
        {
            id: "users",
            name: "Users",
            element: <Home />,
        },
        {
            id: "history",
            name: "Past Beadles",
            element: <Home />,
        },
    ];

    useEffect(() => {
        if (!window.location.hash)
            window.location.replace(`${window.location}#home`); // ??
    });

    return (
        <main>
            <Sidebar subpages={subpages} hash={hash} />
            <div id="content">
                {subpages.find((a) => `#${a.id}` === hash)?.element}
            </div>
        </main>
    );
}
