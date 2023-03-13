import { capture } from "./screenshot.js";

let selectedIndex = 0;
const notations = [
    ["cA sA iA", "#1.1", "Aidan"],
    ["cA sB iA", "#1.2", "Casbia"],
    ["cA sC iA", "#1.3", "Cascia"],
    ["cC sA iB", "#1.4", "Scrambled 3"],
    ["cC sB iB", "#1.5", "Wrong One"],
    ["cC sC iB", "#1.6", "Zig Zag"],
    ["cB sA iC", "#1.7", "Chopped up V"],
    ["cB sB iC", "#1.8", "Scrambled V"],
    ["cB sC iC", "#1.9", "Postmen"],
    ["iA cC sA", "#2.1", "Around the World"],
    ["iA cC sB", "#2.2", "Unscrambled LB"],
    ["iA cC sC", "#2.3", "Ivy"],
    ["iB cB sA", "#2.4", "Unscrambled B"],
    ["iB cB sB", "#2.5", "Chopped up B"],
    ["iB cB sC", "#2.6", "Gentle Romble"],
    ["iC cA sA", "#2.7", "Moonwalk"],
    ["iC cA sB", "#2.8", "3 Variation"],
    ["iC cA sC", "#2.9", "Wankle Engine"],
    ["sB iA cB", "#3.1", "Anna-Maria"],
    ["sC iA cB", "#3.2", "Panto"],
    ["sA iA cB", "#3.3", "Buddy Check"],
    ["sB iB cA", "#3.4", "Last One"],
    ["sC iB cA", "#3.5", "WUST"],
    ["sA iB cA", "#3.6", "Saibca"],
    ["sB iC cC", "#3.7", "Toast"],
    ["sC iC cC", "#3.8", "Right One"],
    ["sA iC cC", "#3.9", "Vegemite Toast"],
];

const patternSelect = document.querySelector(".pattern-select");
notations.forEach(([notation, number, name], i) => {
    const option = document.createElement("option");
    option.innerText = `${notation} - ${number} - ${name}`;
    option.value = i;
    patternSelect.appendChild(option);
});

patternSelect.addEventListener("change", () => {
    selectedIndex = parseInt(patternSelect.value);
    applyNotation(selectedIndex);
});
applyNotation(0);

const mainArea = document.querySelector("main");
document.querySelector(".screenshot-button").addEventListener("click", () => {
    capture(mainArea, getPatternName(selectedIndex));
});
document
    .querySelector(".saveall-button")
    .addEventListener("click", async () => {
        for (let i = 0; i < notations.length; i++) {
            applyNotation(i);
            await new Promise(r => setTimeout(r, 100));
            await capture(mainArea, getPatternName(i));
        }
    });

function getPatternName (i) {
    const patternNum = notations[i][1].substr(1);
    return `notation_${patternNum}`;
}

function applyNotation (patternIndex) {
    const [value, number, name] = notations[patternIndex];

    document.querySelector(".pattern-name").innerText = name;
    document.querySelector(".pattern-number").innerText = number;

    // Calculate order of juggler roles.
    const interceptedJuggler = value.match(/i([ABC])/)[1];
    const cycle = "ABC".replace(interceptedJuggler, interceptedJuggler + "M");
    document.querySelector(".cycle").innerText = cycle;

    const notationBeats = value.split(" ");
    const manipCells = document.querySelectorAll(".m-line td");
    for (let i = 0; i < notationBeats.length; i++) {
        const instruction = notationBeats[i][0].toUpperCase();
        const toJuggler = notationBeats[i][1];
        const fromJuggler = getSourceOfThrow(i, toJuggler);
        manipCells[1 + 2 * i].innerHTML =
            `${instruction}&nbsp;<span class="supsub">` +
            `<sup>${fromJuggler}</sup>` +
            `<sub>${toJuggler}</sub>` +
            `</span>`;
    }
}

/**
 * Returns the corresponding source juggler based on a 0-based beat.
 * This is specific to scrambled variations.
 */
function getSourceOfThrow (beatIndex, toJuggler) {
    // Who is the feeder A passing to on this beat?
    const partner = beatIndex == 1 ? "C" : "B";
    if (toJuggler === partner) {
        return "A";
    }
    if (toJuggler === "A") {
        return partner;
    }
    // Self throw
    return toJuggler;
}
