import { Rectangle, Sprite, Vector2, Sound, GetMaxIdentityString } from "./Utilites.js";

const sprites = new Map<string, Sprite | Sprite[]>();
const sounds = new Map<string, Sound>();
const assetsToLoad: string[] = [];
let assetsParsedCount = 0;
let parsed = false;
let longLoad = false;

const errorImage = (() => {
	const c = document.createElement("canvas");
	const co = c.getContext("2d");
	c.width = 64;
	c.height = 64;
	for (let y = 0; y < 4; ++y)
		for (let x = 0; x < 4; ++x) {
			if ((x + y) % 2 === 0) co.fillStyle = "#FF00FF";
			else co.fillStyle = "#000000";

			co.fillRect(x * 16, y * 16, 16, 16);
		}

	return c.toDataURL();
})();

export function LoadImage(source: string, boundingBox?: Rectangle, scale?: number): Sprite {
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

		if (longLoad)
			setTimeout(() => {
				assetsToLoad.splice(
					assetsToLoad.findIndex((x) => x === source),
					1
				);
			}, Math.random() * 20000);
		else
			assetsToLoad.splice(
				assetsToLoad.findIndex((x) => x === source),
				1
			);
	};
	img.onerror = () => {
		img.src = errorImage;
		cte.Scale = 1;
		cte.BoundingBox = new Rectangle(0, 0, 64, 64);
		cte.ScaledSize = new Vector2(cte.BoundingBox.Width * cte.Scale, cte.BoundingBox.Height * cte.Scale);

		assetsToLoad.splice(
			assetsToLoad.findIndex((x) => x === source),
			1
		);
	};
	img.src = source;

	return cte;
}

export function LoadSound(source: string): Sound {
	assetsToLoad.push(source);
	const s = new Audio();
	s.volume = 1;

	const newSound = {
		Speed: 1,
		Volume: 1,
		Length: 1,
		Play: function (volume?: number, speed?: number, looped = false) {
			if (volume !== undefined || speed !== undefined || looped !== false) {
				const c = s.cloneNode() as HTMLAudioElement;
				c.volume = volume ?? this.Volume;
				c.playbackRate = speed ?? this.Speed;
				c.loop = looped;
				c.play();
			} else (s.cloneNode() as HTMLAudioElement).play();
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

		if (longLoad)
			setTimeout(() => {
				assetsToLoad.splice(
					assetsToLoad.findIndex((x) => x === source),
					1
				);
			}, Math.random() * 20000);
		else
			assetsToLoad.splice(
				assetsToLoad.findIndex((x) => x === source),
				1
			);
	};
	s.onerror = () => {
		assetsToLoad.splice(
			assetsToLoad.findIndex((x) => x === source),
			1
		);
	};

	s.preload = "auto";
	s.src = source;
	s.load();

	return newSound;
}

export function GetSprite<T extends Sprite | Sprite[]>(key: string): T {
	if (!sprites.has(key)) console.error("Sprite key dont found: " + key);

	return sprites.get(key) as T;
}

export function GetSound(key: string): Sound {
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
				if (routers.status === 404) return Promise.reject("Не найдено.");
				else return Promise.reject(`Неизвестная ошибка. Код: ${routers.status}`);
			}

			return routers.json();
		})
		.then((ps) => {
			const db = indexedDB.open("game_options");

			return new Promise(function (res, rej) {
				db.onupgradeneeded = () => {
					db.result.createObjectStore("table");
				};
				db.onsuccess = res;
			})
				.then(() => {
					const tx = db.result.transaction("table", "readonly");
					const table = tx.objectStore("table");
					const get = table.get("long_load");

					return new Promise(function (res, rej) {
						get.onsuccess = res;
					}).then(() => {
						longLoad = get.result;
					});
				})
				.then(() => {
					return ps;
				});
		})
		.then((ps) => {
			if (ps.Images === undefined) return Promise.reject(`Изображения не найдены.\nМаксимально похожий ключ на 'Images': '${GetMaxIdentityString("Images", Object.keys(ps))}'`);
			if (ps.Sounds === undefined) return Promise.reject(`Звуки не найдены.\nМаксимально похожий ключ на 'Sounds': '${GetMaxIdentityString("Sounds", Object.keys(ps))}'`);
			if (ps.Weapons === undefined) return Promise.reject(`Оружия не найдены.\nМаксимально похожий ключ на 'Weapons': '${GetMaxIdentityString("Weapons", Object.keys(ps))}'`);
			if (ps.Throwables === undefined)
				return Promise.reject(`Метательное не найдено.\nМаксимально похожий ключ на 'Throwables': '${GetMaxIdentityString("Throwables", Object.keys(ps))}'`);
			if (ps.Items === undefined) return Promise.reject(`Предметы не найдены.\nМаксимально похожий ключ на 'Items': '${GetMaxIdentityString("Items", Object.keys(ps))}'`);

			for (const imageKey in ps.Images) {
				const object = ps.Images[imageKey];

				if (typeof object === "string") {
					assetsParsedCount++;
					sprites.set(imageKey, LoadImage(object as string));
				} else if (object instanceof Array) {
					assetsParsedCount += object.length;

					sprites.set(
						imageKey,
						object.map((x) => LoadImage(x))
					);
				} else if (typeof object === "object") {
					if (object.Images !== undefined) {
						assetsParsedCount += object.Images.length;

						sprites.set(
							imageKey,
							object.Images.map((x: string) => LoadImage(x, undefined, object.Scale))
						);
					} else if (object.Image !== undefined) {
						assetsParsedCount++;

						if (object.Image === undefined) return Promise.reject(`Недопустимое изображение: ${imageKey}.`);

						sprites.set(imageKey, LoadImage(object.Image, undefined, object.Scale));
					} else return Promise.reject(`Недопустимое изображение: ${imageKey}.`);
				} else return Promise.reject(`Недопустимый тип изображения: ${imageKey}.`);
			}

			for (const soundKey in ps.Sounds) {
				const object = ps.Sounds[soundKey];

				if (typeof object === "string") {
					assetsParsedCount++;
					sounds.set(soundKey, LoadSound(object as string));
				} else return Promise.reject(`Недопустимый тип звука: ${soundKey}.`);
			}

			parsed = true;

			return Promise.resolve({ Weapons: ps.Weapons, Throwables: ps.Throwables, Items: ps.Items });
		});
}
