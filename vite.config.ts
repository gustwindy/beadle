import { resolve } from "node:path";
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
		rollupOptions: {
			input: {
				main: resolve(import.meta.dirname, "front/index.html"),
				admin: resolve(import.meta.dirname, "front/admin.html"),
			},
		},
	},
});
