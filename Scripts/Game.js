import { Scene } from "./Scene.js";
import { Rectangle, Vector2 } from "./Utilites.js";
const sprites = new Map();
const sounds = new Map();
let imagesToLoad = 0;
await (async () => {
    const routers = await fetch("Assets/Routers.json");
    if (!routers.ok)
        return Scene.GetErrorScene("Не найдено: Assets/Routers.json");
    const parsedRouters = await routers.json();
    if (parsedRouters.Images === undefined)
        return Scene.GetErrorScene("Изображения не найдены в Assets/Routers.json");
    if (parsedRouters.Sounds === undefined)
        return Scene.GetErrorScene("Звуки не найдены в Assets/Routers.json");
    for (const imageKey in parsedRouters.Images) {
        const object = parsedRouters.Images[imageKey];
        if (typeof object === "string") {
            imagesToLoad++;
            sprites.set(imageKey, LoadImage(object));
        }
        else if (object instanceof Array) {
            imagesToLoad += object.length;
            sprites.set(imageKey, object.map((x) => LoadImage(x)));
        }
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
})();
export function GetSprite(key) {
    if (!sprites.has(key))
        console.error("Sprite key dont found: " + key);
    return sprites.get(key);
}
export function GetSound(key) {
    return sounds.get(key);
}
const imagesLoaded = [];
function LoadImage(source, boundingBox, scale) {
    const img = new Image();
    const cte = {
        Image: img,
        BoundingBox: boundingBox,
        Scale: scale,
        ScaledSize: new Vector2(0, 0),
    };
    img.onload = () => {
        cte.Scale = scale ?? 1;
        cte.BoundingBox = boundingBox ?? new Rectangle(0, 0, img.naturalWidth, img.naturalHeight);
        cte.ScaledSize = new Vector2(cte.BoundingBox.Width * scale, cte.BoundingBox.Height * scale);
        imagesLoaded.push(source);
    };
    img.src = source;
    return cte;
}
function LoadSound(source) {
    const s = new Audio(source);
    s.volume = 1;
    return {
        Speed: 1,
        Volume: 1,
        Play: function (volume, speed) {
            if (volume === undefined && speed === undefined)
                s.cloneNode().play();
            else {
                const c = s.cloneNode();
                c.volume = volume ?? this.Volume;
                c.playbackRate = speed ?? this.Speed;
                c.play();
            }
        },
        Apply: function () {
            s.volume = this.Volume;
            s.playbackRate = this.Speed;
        },
        PlayOriginal: function () {
            s.play();
        },
        IsPlayingOriginal: function () {
            return !s.paused;
        },
        StopOriginal: function () {
            s.pause();
        },
    };
}
let scene = undefined;
function gameLoop(timeStamp) {
    window.requestAnimationFrame(gameLoop);
    scene.Update(timeStamp);
    scene.Render();
}
function loadLoop() {
    const n = window.requestAnimationFrame(loadLoop);
    if (imagesLoaded.length < imagesToLoad)
        return;
    window.cancelAnimationFrame(n);
    Scene.LoadFromFile("Assets/Scenes/Menu.json").then((x) => {
        scene = x;
        gameLoop(0);
    });
}
loadLoop();
//# sourceMappingURL=Game.js.map