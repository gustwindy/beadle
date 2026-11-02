import React from "react";
import ReactDom from "react-dom/client";

import "./global.css";
import Beadle from "./pages/app";

const root = document.getElementById("root");
if (root)
	ReactDom.createRoot(root).render(
		<React.StrictMode>
			<Beadle />
		</React.StrictMode>,
	);
