import { Scene } from "./Scene.js";
import { GetLoadedImagesCount, LoadImage, LoadSound, Sound, Sprite } from "./Utilites.js";

const sprites = new Map<string, Sprite | Sprite[]>();
const sounds = new Map<string, Sound>();
let imagesToLoad = 0;

await (async () => {
	const routers = await fetch("Assets/Routers.json");
	if (!routers.ok) return Scene.GetErrorScene("Не найдено: Assets/Routers.json");

	const parsedRouters = await routers.json();
	if (parsedRouters.Scenes === undefined || parsedRouters.Scenes.length === 0) return Scene.GetErrorScene("Сцены не найдены в Assets/Routers.json");
	if (parsedRouters.Images === undefined) return Scene.GetErrorScene("Изображения не найдены в Assets/Routers.json");
	if (parsedRouters.Sounds === undefined) return Scene.GetErrorScene("Звуки не найдены в Assets/Routers.json");

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
		} else return Scene.GetErrorScene(`Недопустимый тип изображения: ${imageKey}`);
	}

	for (const soundKey in parsedRouters.Sounds) {
		const object = parsedRouters.Sounds[soundKey];

		if (typeof object === "string") sounds.set(soundKey, LoadSound(object as string));
		else return Scene.GetErrorScene(`Недопустимый тип звука: ${soundKey}`);
	}

	Scene.LoadFromFile(parsedRouters.Scenes[0]);
})();

export function GetSprite<T extends Sprite | Sprite[]>(key: string): T {
	return sprites.get(key) as T;
}

export function GetSound(key: string): Sound {
	return sounds.get(key);
}

function gameLoop(timeStamp: number) {
	window.requestAnimationFrame(gameLoop);

	if (Scene.Current === undefined) return;

	Scene.Current.Update(timeStamp);
	Scene.Current.Render();
	Scene.Current.RenderOverlay();
}

function loadLoop() {
	const n = window.requestAnimationFrame(loadLoop);

	if (GetLoadedImagesCount() < imagesToLoad) return;

	window.cancelAnimationFrame(n);
	gameLoop(0);
}

loadLoop();
