import React from "react";
import ReactDom from "react-dom/client";

import "./global.css";
import Dashboard from "./pages/dashboard";

const root = document.getElementById("root");
if (root)
    ReactDom.createRoot(root).render(
        <React.StrictMode>
            <Dashboard />
        </React.StrictMode>,
    );
