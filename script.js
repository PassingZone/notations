import { saveAs } from "./FileSaver.js";

let stream = null;
async function initCapture () {
    const mainContentArea = document.querySelector("main");
    const cropTarget = await CropTarget.fromElement(mainContentArea);

    stream = await navigator.mediaDevices.getDisplayMedia({
        preferCurrentTab: true,
    });
    const [track] = stream.getVideoTracks();

    await track.cropTo(cropTarget);
}

async function capture (notationIndex) {
    if (!stream) {
        await initCapture();
    }

    const canvas = await drawToCanvas(stream);
    const num = notations[notationIndex][1].substr(1);
    canvas.toBlob(blob => {
        saveAs(blob, `notation_${num}.png`);
    });
    // const frame = canvas.toDataURL("image/png");
    // const out = document.createElement("img");
    // out.src = frame;
    // out.style.border = "1px solid white";
    // document.body.appendChild(out);
}

async function captureAll () {
    for (let i = 0; i < notations.length; i++) {
        console.log("Let's go:", notations[i]);
        applyNotation(i);
        await new Promise(r => setTimeout(r, 100));
        await capture(i);
    }
}

/* Utils */
async function drawToCanvas (stream) {
    const canvas = document.createElement("canvas");
    const video = document.createElement("video");
    video.srcObject = stream;

    // Play it.
    await video.play();

    // Draw one video frame to canvas.
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    return canvas;
}

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
document.querySelector(".screenshot-button").addEventListener("click", () => {
    capture(selectedIndex);
});
document.querySelector(".saveall-button").addEventListener("click", captureAll);

// setInterval(() => {
// 	selectedIndex = (selectedIndex + 1) % 27;
// 	applyNotation(...notations[selectedIndex]);
// }, 100);

function applyNotation (notationIndex) {
    const [value, number, name] = notations[notationIndex];

    document.querySelector(".pattern-name").innerText = name;
    document.querySelector(".pattern-number").innerText = number;
    const notationBeats = value.split(" ");
    const interceptedJuggler = value.match(/i([ABC])/)[1];
    const mantra = "ABC".replace(interceptedJuggler, interceptedJuggler + "M");
    document.querySelector(".mantra").innerText = mantra;
    const manipCells = document.querySelectorAll(".m-line td");
    for (let i = 0; i < notationBeats.length; i++) {
        const instruction = notationBeats[i][0].toUpperCase();
        const toJuggler = notationBeats[i][1];
        const partner = i == 1 ? "C" : "B";
        const fromJuggler =
            toJuggler === partner
                ? "A"
                : toJuggler === "A"
                ? partner
                : toJuggler;
        manipCells[
            1 + 2 * i
        ].innerHTML = `${instruction}&nbsp;<span class="supsub"><sup>${fromJuggler}</sup><sub>${toJuggler}</sub>`;
    }
}
