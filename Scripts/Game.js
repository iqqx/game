import { GUI } from "./Context.js";
import { Scene } from "./Scene.js";
import { Color, Rectangle, Vector2 } from "./Utilites.js";
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
            s.currentTime = 0;
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
    GUI.SetFillColor(Color.Black);
    GUI.DrawRectangle(0, 0, GUI.Width, GUI.Height);
    GUI.SetFont(48);
    const ratio = imagesLoaded.length / imagesToLoad;
    const rad = 25 - Math.clamp(400 - 400 * ratio + 5, 0, 25);
    GUI.ClearStroke();
    GUI.SetFillColor(new Color(70, 70, 70));
    GUI.DrawRoundedRectangle(GUI.Width / 2 - 200, GUI.Height / 2 - 25, 400, 50, 25);
    GUI.SetFillColor(new Color(155, 155, 155));
    GUI.DrawRoundedRectangle(GUI.Width / 2 - 200, GUI.Height / 2 - 25, 400 * ratio, 50, [25, rad, rad, 25]);
    GUI.SetFillColor(Color.White);
    GUI.DrawTextCenter(`${Math.round(ratio * 100)}%`, GUI.Width / 2 - 200, GUI.Height / 2 - 25 - 2, 400, 50);
    GUI.SetStroke(new Color(155, 155, 155), 2);
    GUI.SetFillColor(Color.Transparent);
    GUI.DrawRoundedRectangle(GUI.Width / 2 - 200, GUI.Height / 2 - 25, 400, 50, 25);
    if (imagesLoaded.length < imagesToLoad)
        return;
    window.cancelAnimationFrame(n);
    Scene.LoadFromFile("Assets/Scenes/Main.json").then((x) => {
        scene = x;
        gameLoop(0);
    });
}
loadLoop();
//# sourceMappingURL=Game.js.map