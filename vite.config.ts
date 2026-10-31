import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	root: "front",
	appType: "custom",
	publicDir: "assets",
	build: {
		outDir: "../public",
		emptyOutDir: true,
	},
});
