import { GUI } from "./Context.js";
import { Scene } from "./Scene.js";
import { SceneEditor } from "./SceneEditor.js";
import { Color, Rectangle, Sound, Sprite, Vector2 } from "./Utilites.js";

const sprites = new Map<string, Sprite | Sprite[]>();
const sounds = new Map<string, Sound>();
let imagesToLoad = 0;

fetch("Assets/Routers.json")
	.then((routers) => {
		if (!routers.ok) {
			if (routers.status === 404) return Promise.reject("Не найдено.");
			else return Promise.reject(`Неизвестная ошибка. Код: ${routers.status}`);
		}

		return routers.json();
	})
	.then((parsedRouters) => {
		if (parsedRouters.Images === undefined)
			return Promise.reject(`Изображения не найдены.\nМаксимально похожий ключ на 'Images': '${GetMaxIdentityString("Images", Object.keys(parsedRouters))}'`);
		if (parsedRouters.Sounds === undefined)
			return Promise.reject(`Звуки не найдены.\nМаксимально похожий ключ на 'Sounds': '${GetMaxIdentityString("Sounds", Object.keys(parsedRouters))}'`);

		for (const imageKey in parsedRouters.Images) {
			const object = parsedRouters.Images[imageKey];

			if (typeof object === "string") {
				imagesToLoad++;
				sprites.set(imageKey, LoadImage(object as string));
			} else if (object instanceof Array) {
				imagesToLoad += object.length;

				sprites.set(
					imageKey,
					object.map((x) => LoadImage(x))
				);
			} else return Promise.reject(`Недопустимый тип изображения: ${imageKey}.`);
		}

		for (const soundKey in parsedRouters.Sounds) {
			const object = parsedRouters.Sounds[soundKey];

			if (typeof object === "string") sounds.set(soundKey, LoadSound(object as string));
			else return Promise.reject(`Недопустимый тип звука: ${soundKey}.`);
		}

		loadLoop();
	})
	.catch((res) => {
		scene = Scene.GetErrorScene(`${res}\nat [Assets/Routers.json]`);
		gameLoop(0);
	});

export function GetSprite<T extends Sprite | Sprite[]>(key: string): T {
	if (!sprites.has(key)) console.error("Sprite key dont found: " + key);

	return sprites.get(key) as T;
}

export function GetSound(key: string): Sound {
	return sounds.get(key);
}

function CompareStrings(a: string, b: string): number {
	let result = -5 * Math.abs(a.length - b.length);

	const m = a.length > b.length ? b : a;

	for (let i = 0; i < m.length; i++) {
		if (a[i] === b[i]) result += 10;
		else if (a[i].toLowerCase() === b[i].toLowerCase()) result += 5;
	}

	return result;
}

function GetMaxIdentityString(text: string, variants: string[]) {
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

const imagesLoaded: string[] = [];
function LoadImage(source: string, boundingBox?: Rectangle, scale?: number): Sprite {
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

function LoadSound(source: string): Sound {
	const s = new Audio(source);
	s.volume = 1;

	const newSound = {
		Speed: 1,
		Volume: 1,
		Length: 1,
		Play: function (volume?: number, speed?: number) {
			if (volume === undefined && speed === undefined) (s.cloneNode() as HTMLAudioElement).play();
			else {
				const c = s.cloneNode() as HTMLAudioElement;
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

let scene: SceneEditor | Scene = undefined;

function gameLoop(timeStamp: number) {
	window.requestAnimationFrame(gameLoop);

	scene.Update(timeStamp);
	scene.Render();
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

	if (imagesLoaded.length < imagesToLoad) return;

	window.cancelAnimationFrame(n);
		Scene.LoadFromFile("Assets/Scenes/Menu.json").then((x) => {
		scene = x;

		gameLoop(0);
	});
}
