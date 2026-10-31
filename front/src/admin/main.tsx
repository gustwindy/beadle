import React from "react";
import ReactDom from "react-dom/client";

import "./../global.css";

const root = document.getElementById("root");
if (root)
    ReactDom.createRoot(root).render(
        <React.StrictMode>
            <h1>whtever</h1>
        </React.StrictMode>,
    );
