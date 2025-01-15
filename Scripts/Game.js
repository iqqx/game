import { Weapon } from "./Assets/Weapons/Weapon.js";
import { GUI } from "./Context.js";
import { Scene } from "./Scene.js";
import { Color, Rectangle, Vector2 } from "./Utilites.js";
const sprites = new Map();
const sounds = new Map();
let imagesToLoad = 0;
let parsedRouters;
fetch("Assets/Routers.json")
    .then((routers) => {
    if (!routers.ok) {
        if (routers.status === 404)
            return Promise.reject("Не найдено.");
        else
            return Promise.reject(`Неизвестная ошибка. Код: ${routers.status}`);
    }
    return routers.json();
})
    .then((ps) => {
    parsedRouters = ps;
    if (parsedRouters.Images === undefined)
        return Promise.reject(`Изображения не найдены.\nМаксимально похожий ключ на 'Images': '${GetMaxIdentityString("Images", Object.keys(parsedRouters))}'`);
    if (parsedRouters.Sounds === undefined)
        return Promise.reject(`Звуки не найдены.\nМаксимально похожий ключ на 'Sounds': '${GetMaxIdentityString("Sounds", Object.keys(parsedRouters))}'`);
    if (parsedRouters.Weapons === undefined)
        return Promise.reject(`Оружия не найдены.\nМаксимально похожий ключ на 'Weapons': '${GetMaxIdentityString("Weapons", Object.keys(parsedRouters))}'`);
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
        else if (typeof object === "object") {
            imagesToLoad++;
            if (object.Image === undefined)
                return Promise.reject(`Недопустимое изображение: ${imageKey}.`);
            sprites.set(imageKey, LoadImage(object.Image, undefined, object.Scale));
        }
        else
            return Promise.reject(`Недопустимый тип изображения: ${imageKey}.`);
    }
    for (const soundKey in parsedRouters.Sounds) {
        const object = parsedRouters.Sounds[soundKey];
        if (typeof object === "string")
            sounds.set(soundKey, LoadSound(object));
        else
            return Promise.reject(`Недопустимый тип звука: ${soundKey}.`);
    }
})
    .then(() => {
    loadLoop();
})
    .catch((res) => {
    scene = Scene.GetErrorScene(`${res.stack}\nat [Assets/Routers.json]`);
    gameLoop(0);
});
export function GetSprite(key) {
    if (!sprites.has(key))
        console.error("Sprite key dont found: " + key);
    return sprites.get(key);
}
export function GetSound(key) {
    return sounds.get(key);
}
function CompareStrings(a, b) {
    let result = -5 * Math.abs(a.length - b.length);
    const m = a.length > b.length ? b : a;
    for (let i = 0; i < m.length; i++) {
        if (a[i] === b[i])
            result += 10;
        else if (a[i].toLowerCase() === b[i].toLowerCase())
            result += 5;
    }
    return result;
}
function GetMaxIdentityString(text, variants) {
    let result = variants[0];
    let last = 0;
    for (const variant of variants) {
        const c = CompareStrings(text, variant);
        if (c > last) {
            last = c;
            result = variant;
        }
    }
    return result;
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
    const newSound = {
        Speed: 1,
        Volume: 1,
        Length: 1,
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
    s.onloadedmetadata = () => {
        newSound.Length = s.duration;
    };
    return newSound;
}
let scene = undefined;
function gameLoop(timeStamp) {
    window.requestAnimationFrame(gameLoop);
    scene.Update(timeStamp);
    scene.Render();
    scene.RenderOverlay();
}
function loadLoop() {
    const n = window.requestAnimationFrame(loadLoop);
    GUI.SetFillColor(Color.Black);
    GUI.ClearStroke();
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
    Promise.all(Object.keys(parsedRouters.Weapons).map((weaponKey) => {
        const object = parsedRouters.Weapons[weaponKey];
        if (typeof object === "string") {
            return fetch("Assets/" + object)
                .then((x) => {
                if (!x.ok) {
                    if (x.status === 404)
                        return Promise.reject(`Не найдено.\nat [${object}]`);
                    else
                        return Promise.reject(`Неизвестная ошибка. Код: ${x.status}`);
                }
                return x.json();
            })
                .then((x) => {
                x.Id = weaponKey;
                Weapon.Register(x);
            });
        }
        else {
            return Promise.reject("Недопустимый тип пути оружия: ${weaponKey}\nat [Routers.json/Weapons]");
        }
    }))
        .then(() => {
        // SceneWeaponEditor.LoadFromFile(Weapon.GetById("AK12")).then((x) => {
        Scene.LoadFromFile("Assets/Scenes/Main.json").then((x) => {
            scene = x;
            gameLoop(0);
        });
    })
        .catch((err) => {
        scene = Scene.GetErrorScene(`${err.stack}\nat [Routers.json/Weapons]`);
        gameLoop(0);
    });
}
//# sourceMappingURL=Game.js.map