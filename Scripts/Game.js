import { Scene } from "./Scene.js";
import { IsImagesLoaded } from "./Utilites.js";
const scene = await Scene.Load();
function gameLoop(timeStamp) {
    window.requestAnimationFrame(gameLoop);
    scene.Update(timeStamp);
    scene.Render();
    scene.RenderOverlay();
}
function loadLoop() {
    const n = window.requestAnimationFrame(loadLoop);
    if (!IsImagesLoaded())
        return;
    window.cancelAnimationFrame(n);
    gameLoop(0);
}
loadLoop();
