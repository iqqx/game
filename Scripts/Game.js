import { Scene } from "./Scene.js";
import { GetLoadedImagesCount, LoadImage, LoadSound } from "./Utilites.js";
const sprites = new Map();
const sounds = new Map();
let imagesToLoad = 99997;
await (async () => {
    const routers = await fetch("Assets/Routers.json");
    if (!routers.ok)
        return Scene.GetErrorScene("Не найдено: Assets/Routers.json");
    const parsedRouters = await routers.json();
    if (parsedRouters.Scenes === undefined || parsedRouters.Scenes.length === 0)
        return Scene.GetErrorScene("Сцены не найдены в Assets/Routers.json");
    if (parsedRouters.Images === undefined)
        return Scene.GetErrorScene("Изображения не найдены в Assets/Routers.json");
    if (parsedRouters.Sounds === undefined)
        return Scene.GetErrorScene("Звуки не найдены в Assets/Routers.json");
    for (const imageKey in parsedRouters.Images) {
        imagesToLoad++;
        const object = parsedRouters.Images[imageKey];
        if (typeof object === "string")
            sprites.set(imageKey, LoadImage(object));
        else if (object instanceof Array)
            sprites.set(imageKey, object.map((x) => LoadImage(x)));
        else
            return Scene.GetErrorScene(`Недопустимый тип изображения: ${imageKey}`);
    }
    for (const soundKey in parsedRouters.Sounds) {
        const object = parsedRouters.Sounds[soundKey];
        if (typeof object === "string")
            sounds.set(soundKey, LoadSound(object));
        else
            return Scene.GetErrorScene(`Недопустимый тип звука: ${soundKey}`);
    }
    Scene.LoadFromFile(parsedRouters.Scenes[0]);
})();
export function GetSprite(key) {
    return sprites.get(key);
}
export function GetSound(key) {
    return sounds.get(key);
}
function gameLoop(timeStamp) {
    window.requestAnimationFrame(gameLoop);
    if (Scene.Current === undefined)
        return;
    Scene.Current.Update(timeStamp);
    Scene.Current.Render();
    Scene.Current.RenderOverlay();
}
function loadLoop() {
    const n = window.requestAnimationFrame(loadLoop);
    if (GetLoadedImagesCount() >= imagesToLoad)
        return;
    window.cancelAnimationFrame(n);
    gameLoop(0);
}
loadLoop();
