/*

this entire file is like disgusting please remind me to fix it tytytyty

*/

import * as api from "./api.js";

const beadleDay = document.getElementById("beadleDay");
const drawing = document.getElementById("drawing");
const start = document.getElementById("start");
const input = document.getElementById("input");
const submit = document.getElementById("submit");
const history = document.getElementById("history");
const guessOptionsList = document.getElementById("guesses")

const guessTemplate = document.querySelector("#template .past-guess");
const commentTemplate = document.querySelector("#template .comment-container");
const guessInput = document.querySelector(".guess-input");


let waiting = false;

async function addHistory(guess, hint) {
    const el = guessTemplate.cloneNode(true);
    el.querySelector(".guess .value").innerText = guess;
    el.querySelector(".hint .value").innerText = hint;

    history.appendChild(el);

    return el;
}

async function addComment(comment) {
    const el = commentTemplate.cloneNode(true);
    el.querySelector(".comment").innerText = comment;

    history.appendChild(el);

    return el;
}

async function run() {
    const current = (await api.today()).current;
    const artists = (await api.artists()).artists;
    const aliasMap = {};
    const artistNames = artists.map((a) => a.commonName);

    artists.forEach((a) => {
        a.aliases.forEach((l) => {
            aliasMap[l] = a.commonName;
        });
    });

    beadleDay.innerText = current.day;

    drawing.src = current.drawing;

  input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
            submit.click();
        }
    });

  input.addEventListener("input", () => {
    guessOptionsList.replaceChildren();
    artists.forEach((a) => {
      if (a.commonName.includes(input.value.toLowerCase())) {
        const option = document.createElement("option");
        option.value = a.commonName;
        guessOptionsList.appendChild(option);
      }
    });
  })

  submit.addEventListener("click", async () => {
        if (waiting) return;
        const guess = input.value.trim().toLowerCase();
        if (Object.keys(aliasMap).includes(guess)) {
            input.value = aliasMap[guess];
            addComment(
                "You typed an alias of an artist name. Submit again to confirm.",
            );

            return;
        }
        if (!artistNames.includes(guess)) {
            //input.value = "";
            addComment("Invalid artist!");

            return;
        }
        waiting = true;
        guessInput.classList.add("waiting");
        input.setAttribute("disabled", true);

        input.value = "";
        const res = await api.guess(guess);

        console.log(res);
        addHistory(guess, res.hint);

        guessInput.classList.remove("waiting");
        input.removeAttribute("disabled");
        input.focus();
        waiting = false;
    });

    start.addEventListener("click", () => {
        document.querySelector(".active").classList.remove("active");
        document.querySelector(".game").classList.add("active");
    });

    console.log(artists);
}

run()
    .catch(() => {
        alert("error occurred, send console to windy");
    })
    .finally(() => {
        document.body.classList.remove("loading");
    });
