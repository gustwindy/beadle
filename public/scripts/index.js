/*

this entire file is like disgusting please remind me to fix it tytytyty
^ like important

do not judge me based on this file
or any of the frontend actually

*/

import * as api from "./api.js";

// we have an entire like mountain here

const beadleDay = document.getElementById("beadleDay");
const drawing = document.getElementById("drawing");
const start = document.getElementById("start");
const copy = document.getElementById("copy");
const input = document.getElementById("input");
const submit = document.getElementById("submit");
const history = document.getElementById("history");
const squares = document.getElementById("squares");
const timestamp = document.getElementById("timestamp");
const guessCount = document.getElementById("guessCount");
const suggestions = document.getElementById("suggestions");
const beadleDayResults = document.getElementById("beadleDayResults");

const guessTemplate = document.querySelector("#template .past-guess");
const commentTemplate = document.querySelector("#template .comment-container");
const guessInput = document.querySelector(".guess-input");

const browserStateTemplate = {
    screen: "welcome",
    streak: 0,
    day: 0,
    startTime: Date.now(),
    endTime: -1,
    guesses: [],
};

let browserState = browserStateTemplate;

try {
    browserState = localStorage.getItem("beadleState")
        ? JSON.parse(localStorage.getItem("beadleState"))
        : browserStateTemplate;
} catch (_) {
    localStorage.removeItem("beadleState");

    alert(
        "you HAD a state stored but it for some reason just doesn't make sense. your progress has been reset. sorry!",
    );

    location.reload();
}

function saveState() {
    localStorage.setItem("beadleState", JSON.stringify(browserState));
}

let waiting = false;

async function makeSuggestions(artists) {
  suggestions.replaceChildren();
  const matches = artists.filter((artist) =>
      artist.commonName
          .toLowerCase()
          .includes(input.value.toLowerCase().toLowerCase()),
  );
  suggestions.classList.toggle("hidden", (matches.length === 0));
  matches.forEach((artist, counter) => {
      if (counter < 5) {
          const newButton = document.createElement("button");
          newButton.textContent = artist.commonName;
          newButton.className = "suggestion";

          newButton.addEventListener("click", () => {
            input.value = newButton.textContent;
            suggestions.classList.toggle("hidden");
            input.focus();
          });
          suggestions.appendChild(newButton);
      }
  });
}

async function addHistory(guess, hint) {
    const el = guessTemplate.cloneNode(true);
    el.querySelector(".guess .value").innerText = guess;
    el.querySelector(".hint .value").innerText = hint;

    browserState.guesses.push({
        type: "hinted",
        value: guess,
    });

    history.appendChild(el);

    return el;
}

async function addComment(comment) {
    const el = commentTemplate.cloneNode(true);
    el.querySelector(".comment").innerText = comment;
    if (!(comment !== "invalid artist")){
      browserState.guesses.push({
        type: "comment",
        value: comment,
    });
  }

    history.appendChild(el);

    return el;
}

function dumbSquare(color, text) {
    const square = document.createElement("span");
    square.classList.add("square");
    square.classList.add(color);

    square.innerHTML = `<span>${text}</span>`;

    return square;
}

function formatTime(msec) {
    const sec = msec / 1000;
    if (sec > 60) {
        const fmt = `${Math.floor(sec % 60)}`;
        return `${Math.floor(sec / 60)}:${fmt.padStart(2, "0")}`;
    }
    return `${Math.floor(sec % 60)}sec`;
}

async function run() {
    const current = (await api.today()).current;
    const artists = (await api.artists()).artists;
    const aliasMap = {};
    const artistNames = artists.map((a) => a.commonName);

    if (current.day > browserState.day) {
        browserState.screen = "welcome";
        browserState.guesses = [];
        browserState.startTime = Date.now();
        browserState.endTime = -1;
        browserState.day = current.day;

        saveState();
        location.reload();
    }

    if (browserState.screen === "game" || browserState.screen === "results") {
        document.querySelector(".active").classList.remove("active");
        document.querySelector(".game").classList.add("active");
    }

    if (browserState.streak > 0 && current.day - browserState.day > 1) {
        browserState.streak = 0;
        alert("ur streak broke btw no popup for this yet");
    }

  if (browserState.screen === "results") {
    // ohh yuck

    if (browserState.endTime === -1) {
      browserState.endTime = Date.now();
      saveState();
    }
    beadleDayResults.innerText = current.day;
    if (browserState.guesses.length == 6){
      guessCount.innerText = "You made Bea sad 💔";
      timestamp.hidden = true;
    }
    else
      guessCount.innerText = `in ${browserState.guesses.length} guesses,`;
        const children = [];

        browserState.guesses.forEach((v) => {
            switch (v.type) {
                case "comment":
                    //children.push(dumbSquare("gray", "?"));
                    break;
                case "hinted":
                    children.push(dumbSquare("yellow", "!"));
                    break;
                case "correct":
                    children.push(dumbSquare("correct", " "));
                    break;

                case "fail":
                    children.push(dumbSquare("fail", "X"));
                    break;
            }
        });

        children.forEach((v) => {
            // okay listen to me. replaceChildren apparently only works on text nodes. i do not know either.
            // once i rewrite this in angular or something i swear it'll look better
            squares.append(v);
        });

        timestamp.innerText = formatTime(
            browserState.endTime - browserState.startTime,
        );

        document.querySelector(".results").classList.add("active");
    }

    copy.addEventListener("click", () => {
        const final = [
            `\`${browserState.streak}🔥\` **Beadle #${browserState.day}**: `,
        ];

        browserState.guesses.forEach((v) => {
            switch (v.type) {
                case "comment":
                    final.push("⬛");
                    break;
                case "hinted":
                    final.push("🟨");
                    break;
                case "correct":
                    final.push("🟪");
                    break;

                case "fail":
                  final.push("💥");
                    break;
            }
        });
        if (browserState.guesses.length == 6)
          final.push(`(X/5`)
        else
          final.push(` (${browserState.guesses.length}/5`);
        final.push(
            ` in ${formatTime(browserState.endTime - browserState.startTime)})`,
        );
        navigator.clipboard.writeText(final.join("") + "\n https://beadle.guhw.dev/");
        alert("copied");
    });

    artists.forEach((a) => {
        a.aliases.forEach((l) => {
            aliasMap[l] = a.commonName;
        });
    });

    beadleDay.innerText = current.day;

    drawing.src = current.drawing;

    input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
            suggestions.classList.toggle("hidden", true);
            submit.click();
        }
    });

  input.addEventListener("focus", () => makeSuggestions(artists));
  input.addEventListener("input", () => makeSuggestions(artists));


    submit.addEventListener("click", async () => {
        const stupidFunctionThatShouldntEvenBeAVariable = () => {
          if (browserState.guesses.length == 5)
              if (browserState.guesses[4].type != "correct"){
                browserState.guesses.push({
                    type: "fail",
                    value: "you failed btw",
                });
                browserState.streak = 0;
                browserState.screen = "results";
                saveState();
                location.reload();
            }
        };
        if (waiting) return;
        const guess = input.value.trim().toLowerCase();
        if (Object.keys(aliasMap).includes(guess)) {
            input.value = aliasMap[guess];
            addComment(
                "You typed an alias of an artist name. Submit again to confirm.",
            );
            stupidFunctionThatShouldntEvenBeAVariable();

            return;
        }
        if (!artistNames.includes(guess)) {
            //input.value = "";
            addComment("Invalid artist!");
            stupidFunctionThatShouldntEvenBeAVariable();

            return;
        }
        waiting = true;
        guessInput.classList.add("waiting");
        input.setAttribute("disabled", true);

        input.value = "";
        const res = await api.guess(guess);

        if (res.correct) {
            // ew yuck
            browserState.guesses.push({
                type: "correct",
                value: guess,
            });
            browserState.streak += 1;
            browserState.screen = "results";
        }

        console.log(res);
        saveState();

        if (!res.correct) {
            addHistory(guess, res.hint);

            guessInput.classList.remove("waiting");
            input.removeAttribute("disabled");
            input.focus();
            waiting = false;
        }

        stupidFunctionThatShouldntEvenBeAVariable();

        if (res.correct) {
            location.reload();
        }
    });

    start.addEventListener("click", () => {
        document.querySelector(".active").classList.remove("active");
        document.querySelector(".game").classList.add("active");

        browserState.screen = "game";
        saveState();
    });

    console.log(artists);
}

run()
    .catch((reason) => {
        console.error(reason);
        alert("error occurred, send console to windy");
    })
    .finally(() => {
        document.body.classList.remove("loading");
    });
