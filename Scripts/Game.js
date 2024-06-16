import { Backpack } from "./Assets/Containers/Backpack.js";
import { Box } from "./Assets/Containers/Box.js";
import { Item } from "./Assets/Items/Item.js";
import { EnemyType } from "./Enums.js";
import { AudioSource } from "./GameObjects/BoomBox.js";
import { Human } from "./GameObjects/Enemies/Human.js";
import { Ladder } from "./GameObjects/Ladder.js";
import { Platform } from "./GameObjects/Platform.js";
import { Player } from "./GameObjects/Player.js";
import { Morshu } from "./GameObjects/QuestGivers/Morshu.js";
import { Spikes } from "./GameObjects/Spikes.js";
import { Wall } from "./GameObjects/Wall.js";
import { Scene } from "./Scene.js";
import { GetLoadedImagesCount, LoadImage, LoadSound } from "./Utilites.js";
export const sprites = new Map();
export const sounds = new Map();
let imagesToLoad = 99997;
const scene = await (async () => {
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
    const sceneFile = await fetch(parsedRouters.Scenes[0]);
    if (!sceneFile.ok)
        return Scene.GetErrorScene(`Сцена не найдена: ${parsedRouters.Scenes[0]}`);
    const sceneData = await sceneFile.json();
    return new Scene(sprites.get(sceneData.Background), sceneData.GameObjects.map((x) => {
        switch (x.Type) {
            case "Wall":
                return new Wall(...x.Arguments);
            case "Platform":
                return new Platform(...x.Arguments);
            case "Player":
                return new Player(...x.Arguments);
            case "Boombox":
                return new AudioSource(...x.Arguments);
            case "Box":
                x.Arguments.splice(2, x.Arguments.length - 2, ...x.Arguments.slice(2).map((x) => {
                    const value = x;
                    return { Item: Item.Parse(value.Item), Chance: value.Chance };
                }));
                return new Box(...x.Arguments);
            case "Spikes":
                return new Spikes(...x.Arguments);
            case "Ladder":
                return new Ladder(...x.Arguments);
            case "Morshu":
                return new Morshu(...x.Arguments);
            case "Backpack":
                x.Arguments.splice(2, x.Arguments.length - 2, ...x.Arguments.slice(2).map((x) => {
                    return Item.Parse(x);
                }));
                return new Backpack(...x.Arguments);
            case "Human":
                x.Arguments[2] = x.Arguments[2] === "Green" ? EnemyType.Green : EnemyType.Rat;
                return new Human(...x.Arguments);
            default:
                throw new Error("Не удалось распарсить: " + x.Type);
        }
    }));
})();
export function GetSprite(key) {
    return sprites.get(key);
}
export function GetSound(key) {
    return sounds.get(key);
}
function gameLoop(timeStamp) {
    window.requestAnimationFrame(gameLoop);
    scene.Update(timeStamp);
    scene.Render();
    scene.RenderOverlay();
}
function loadLoop() {
    const n = window.requestAnimationFrame(loadLoop);
    if (GetLoadedImagesCount() >= imagesToLoad)
        return;
    window.cancelAnimationFrame(n);
    gameLoop(0);
}
loadLoop();
