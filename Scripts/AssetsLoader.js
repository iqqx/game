import { Rectangle, Vector2, GetMaxIdentityString } from "./Utilites.js";
const sprites = new Map();
const sounds = new Map();
const assetsToLoad = [];
let assetsParsedCount = 0;
let parsed = false;
export function LoadImage(source, boundingBox, scale) {
    assetsToLoad.push(source);
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
        cte.ScaledSize = new Vector2(cte.BoundingBox.Width * cte.Scale, cte.BoundingBox.Height * cte.Scale);
        // setTimeout(() => {
        assetsToLoad.splice(assetsToLoad.findIndex((x) => x === source), 1);
        // }, Math.random() * 20000);
    };
    img.src = source;
    return cte;
}
export function LoadSound(source) {
    assetsToLoad.push(source);
    const s = new Audio();
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
        // setTimeout(() => {
        assetsToLoad.splice(assetsToLoad.findIndex((x) => x === source), 1);
        // }, Math.random() * 20000);
    };
    s.preload = "auto";
    s.src = source;
    s.load();
    return newSound;
}
export function GetSprite(key) {
    if (!sprites.has(key))
        console.error("Sprite key dont found: " + key);
    return sprites.get(key);
}
export function GetSound(key) {
    return sounds.get(key);
}
export function GetImageLoadingProgress() {
    return (assetsParsedCount - assetsToLoad.length) / assetsParsedCount;
}
export function IsParsed() {
    return parsed;
}
export function GetLoadingImage() {
    return assetsToLoad.length > 0 ? assetsToLoad[assetsToLoad.length - 1] : "DONE";
}
export function GetLoadings() {
    return assetsToLoad;
}
export async function Parse() {
    return fetch("Assets/Routers.json")
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
        if (ps.Images === undefined)
            return Promise.reject(`Изображения не найдены.\nМаксимально похожий ключ на 'Images': '${GetMaxIdentityString("Images", Object.keys(ps))}'`);
        if (ps.Sounds === undefined)
            return Promise.reject(`Звуки не найдены.\nМаксимально похожий ключ на 'Sounds': '${GetMaxIdentityString("Sounds", Object.keys(ps))}'`);
        if (ps.Weapons === undefined)
            return Promise.reject(`Оружия не найдены.\nМаксимально похожий ключ на 'Weapons': '${GetMaxIdentityString("Weapons", Object.keys(ps))}'`);
        if (ps.Throwables === undefined)
            return Promise.reject(`Метательное не найдено.\nМаксимально похожий ключ на 'Throwables': '${GetMaxIdentityString("Throwables", Object.keys(ps))}'`);
        if (ps.Items === undefined)
            return Promise.reject(`Предметы не найдены.\nМаксимально похожий ключ на 'Items': '${GetMaxIdentityString("Items", Object.keys(ps))}'`);
        for (const imageKey in ps.Images) {
            const object = ps.Images[imageKey];
            if (typeof object === "string") {
                assetsParsedCount++;
                sprites.set(imageKey, LoadImage(object));
            }
            else if (object instanceof Array) {
                assetsParsedCount += object.length;
                sprites.set(imageKey, object.map((x) => LoadImage(x)));
            }
            else if (typeof object === "object") {
                if (object.Images !== undefined) {
                    assetsParsedCount += object.Images.length;
                    sprites.set(imageKey, object.Images.map((x) => LoadImage(x, undefined, object.Scale)));
                }
                else if (object.Image !== undefined) {
                    assetsParsedCount++;
                    if (object.Image === undefined)
                        return Promise.reject(`Недопустимое изображение: ${imageKey}.`);
                    sprites.set(imageKey, LoadImage(object.Image, undefined, object.Scale));
                }
                else
                    return Promise.reject(`Недопустимое изображение: ${imageKey}.`);
            }
            else
                return Promise.reject(`Недопустимый тип изображения: ${imageKey}.`);
        }
        for (const soundKey in ps.Sounds) {
            const object = ps.Sounds[soundKey];
            if (typeof object === "string") {
                assetsParsedCount++;
                sounds.set(soundKey, LoadSound(object));
            }
            else
                return Promise.reject(`Недопустимый тип звука: ${soundKey}.`);
        }
        parsed = true;
        return Promise.resolve({ Weapons: ps.Weapons, Throwables: ps.Throwables, Items: ps.Items });
    });
}
//# sourceMappingURL=AssetsLoader.js.map