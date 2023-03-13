import { saveAs } from "./FileSaver.js";

// Very hacky way of saving screenshots that only works in Chrome
// due to the CropTarget API.
// The screen capture is never stopped, which could be improved.

let stream = null;
async function initCapture (contentArea) {
    if (typeof CropTarget === "undefined") {
        alert("Screenshots only work in Chromium browsers, sorry!");
        return;
    }
    const cropTarget = await CropTarget.fromElement(contentArea);

    stream = await navigator.mediaDevices.getDisplayMedia({
        preferCurrentTab: true,
    });
    const [track] = stream.getVideoTracks();

    await track.cropTo(cropTarget);
}

export async function capture (contentArea, patternName) {
    if (!stream) {
        await initCapture(contentArea);
    }

    const canvas = await drawToCanvas(stream);
    canvas.toBlob(blob => {
        saveAs(blob, `${patternName}.png`);
    });
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
