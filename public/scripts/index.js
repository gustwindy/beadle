import * as api from "./api.js";

const beadleDay = document.getElementById("beadleDay");

async function start() {
    const current = (await api.today()).current;
    beadleDay.innerText = current.day;
}

start().finally(() => {
    document.body.classList.remove("loading");
});
