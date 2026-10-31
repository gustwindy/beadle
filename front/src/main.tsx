import React from "react";
import ReactDom from "react-dom/client";

import App from "./app";
import "./styles.css";

const root = document.getElementById("root");
if (root)
    ReactDom.createRoot(root).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
