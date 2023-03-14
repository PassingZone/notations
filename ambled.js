import { capture } from "./screenshot.js";

let selectedIndex = 0;
let allTempElements = [];

const notations = [
    ["cC-B,sB-A,,,iB-B,,,", "#1.1", "No Name"],
    ["cC-B,,sA-B,,iB-B,,,", "#1.2", "Ambled Back to the Future"],
    ["cC-B,,sC-C,,iB-B,,,", "#1.3", "Ambled Wust"],
    ["cC-B,,,sB-A,iB-B,,,", "#1.4", "Ambled Saibca"],
    [",cB-A,sA-B,,,iC-A,,", "#2.1", "No Name"],
    [",cB-A,sC-C,,,iC-A,,", "#2.2", "No Name"],
    [",cB-A,,sB-A,,iC-A,,", "#2.3", "Ambled Choptopus"],
    [",cB-A,,,sB-B,iC-A,,", "#2.4", "No Name"],
    [",cB-A,,,sA-C,iC-A,,", "#2.5", "No Name"],
    [",,cA-B,sB-A,,,iC-C,", "#3.1", "No Name"],
    [",,cA-B,,sB-B,,iC-C,", "#3.2", "Ambled V"],
    [",,cA-B,,sA-C,,iC-C,", "#3.3", "Ambled Postmen"],
    [",,cA-B,,,sC-A,iC-C,", "#3.4", "Ambled Chopped V"],
    [",,cC-C,sB-A,,,iA-B,", "#4.1", "No Name"],
    [",,cC-C,,sB-B,,iA-B,", "#4.2", "Ambled Wrong One"],
    [",,cC-C,,sA-C,,iA-B,", "#4.3", "No Name"],
    [",,cC-C,,,sC-A,iA-B,", "#4.4", "Ambled 3"],
    ["iC-B,,,cB-A,sB-B,,,", "#5.1", "Ambled Casbia"],
    ["iC-B,,,cB-A,sA-C,,,", "#5.2", "Ambled Cascia"],
    ["iC-B,,,cB-A,,sC-A,,", "#5.3", "Ambled Aidan"],
    ["iC-B,,,cB-A,,,sA-B,", "#5.4", "No Name"],
    ["iC-B,,,cB-A,,,sC-C,", "#5.5", "No Name"],
    [",,iA-B,,cB-B,sC-A,,", "#6.1", "No Name"],
    [",,iA-B,,cB-B,,sA-B,", "#6.2", "No Name"],
    [",,iA-B,,cB-B,,sC-C,", "#6.3", "Ambled Gentle Romble"],
    ["sC-B,,iA-B,,cB-B,,,", "#6.4", "Ambled B"],
    [",sB-A,iA-B,,cB-B,,,", "#6.5", "No Name"],
    [",sC-C,iA-B,,cB-B,,,", "#6.6", "No Name"],
    [",iB-A,,,cA-C,sC-A,,", "#7.1", "No Name"],
    [",iB-A,,,cA-C,,sA-B,", "#7.2", "Ambled LB"],
    [",iB-A,,,cA-C,,sC-C,", "#7.3", "Ambled Ivy"],
    ["sC-B,iB-A,,,cA-C,,,", "#7.4", "Around the Ambled World"],
    [",,iC-C,,,cC-A,sA-B,", "#8.1", "Ambled 3 Variation"],
    [",,iC-C,,,cC-A,sC-C,", "#8.2", "Ambled Wankle Engine"],
    ["sC-B,,iC-C,,,cC-A,,", "#8.3", "Ambled Moonwalk"],
    [",sB-A,iC-C,,,cC-A,,", "#8.4", "TODO"],
    ["sC-B,,,iB-A,,,cA-B,", "#9.1", "No Name"],
    [",sB-A,,iB-A,,,cA-B,", "#9.2", "No Name"],
    [",sC-C,,iB-A,,,cA-B,", "#9.3", "Ambled Panto"],
    [",,sA-B,iB-A,,,cA-B,", "#9.4", "Ambled Anna-Maria"],
    ["sC-B,,,,iA-C,,cC-C,", "#10.1", "No Name"],
    [",sB-A,,,iA-C,,cC-C,", "#10.2", "Ambled Vegemite Toast"],
    [",sC-C,,,iA-C,,cC-C,", "#10.3", "Ambled Right One"],
    [",,sA-B,,iA-C,,cC-C,", "#10.4", "Ambled Toast"],
    [",,,sB-A,iA-C,,cC-C,", "#10.5", "No Name"],
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

    const notationBeats = value.split(",").map(x => x.trim());
    const manipCells = document.querySelectorAll(".m-line td");

    const tableContainer = document.querySelector(".table-container");
    allTempElements.forEach(arrow => arrow.remove());
    allTempElements = [];

    for (let i = 0; i < notationBeats.length; i++) {
        const beat = i + 1;
        const cell = manipCells[beat];

        cell.innerHTML = "";
        if (notationBeats[i] === "") {
            continue;
        }

        const instruction = notationBeats[i][0].toUpperCase();
        const toJuggler = notationBeats[i][3];
        const fromJuggler = notationBeats[i][1];
        cell.innerHTML =
            `${instruction}&nbsp;<span class="supsub">` +
            `<sup>${fromJuggler}</sup>` +
            `<sub>${toJuggler}</sub>` +
            `</span>`;
        cell.setAttribute("data-from", fromJuggler);
        cell.classList.add("fancy-hover");

        const fromCell = document.querySelector(
            `table tr[data-juggler="${fromJuggler}"] td[data-beat="${beat}"]`,
        );
        const toCell = document.querySelector(
            `table tr[data-juggler="${toJuggler}"] td[data-beat="${beat + 1}"]`,
        );

        const svg = getOrCreateSVG(tableContainer, fromJuggler, beat);
        const arrow = arrowLine(
            getCenterPoint(fromCell, 0.2, tableContainer.clientWidth),
            getCenterPoint(toCell, -0.2, tableContainer.clientWidth),
            {
                curvature: 0,
                color: "orange",
                thickness: 1.5 / tableContainer.clientWidth,
                svgParentSelector: `svg.${Array.from(svg.classList).join(".")}`,
            },
        );
        allTempElements.push(arrow);
    }
}

function getOrCreateSVG (tableContainer, fromJuggler, beat) {
    const existing = tableContainer.querySelector(
        `[data-juggler="${fromJuggler}"] svg[data-beat="${beat}"]`,
    );
    if (existing) {
        return existing;
    }

    // Wrapper only needed for fancy-hover selector compatibility.
    const svgWrapper = document.createElement("div");
    svgWrapper.setAttribute("data-juggler", fromJuggler);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const svgClass = `${fromJuggler}${beat}`;
    svg.setAttribute("viewBox", "0 0 1 1"); // uniform coords for scaling
    svg.setAttribute("preserveAspectRatio", "xMinYMin slice");
    svg.classList.add("svg-arrows");
    svg.classList.add(svgClass);
    svg.setAttribute("data-beat", beat);

    svgWrapper.appendChild(svg);
    tableContainer.appendChild(svgWrapper);
    return svg;
}

function getCenterPoint (elem, bias, scale) {
    return {
        x: (elem.offsetLeft + elem.offsetWidth * (0.5 + bias)) / scale,
        y: (elem.offsetTop + elem.offsetHeight / 2) / scale,
    };
}

applyNotation(0);
