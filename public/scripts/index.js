import * as api from "./api.js";

async function start() {
	console.log(await api.today());
}

start().finally(() => {
	console.log("hi");
});
