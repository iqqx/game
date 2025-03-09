import { Weapon } from "./Assets/Weapons/Weapon.js";
import { Throwable } from "./Assets/Throwable.js";
import { GUI } from "./Context.js";
import { Scene } from "./Scene.js";
import { SceneEditor } from "./SceneEditor.js";
import { SceneWeaponEditor } from "./SceneWeaponEditor.js";
import { Color } from "./Utilites.js";
import { GetImageLoadingProgress, GetLoadings, IsParsed, Parse } from "./AssetsLoader.js";
import { ItemRegistry } from "./Assets/Items/ItemRegistry.js";

let parsedRouters: any;

Parse()
	.then((x) => (parsedRouters = x))
	.catch((res) => {
		scene = Scene.GetErrorScene(`${res ?? res.stack}\nat [Assets/Routers.json]`);
		gameLoop(0);
	});

let scene: SceneEditor | Scene | SceneWeaponEditor = undefined;
// let unfocusTime: number | null = null;

// document.getElementById("main-canvas").addEventListener("focusin", () => {
// 	if (scene !== undefined && unfocusTime !== null) gameLoop(unfocusTime);

// 	unfocusTime = null;
// });

function gameLoop(timeStamp: number) {
	// if (document.activeElement.tagName !== "CANVAS") {
	//     GUI.DrawUnfocusScreen();

	// 	unfocusTime = timeStamp;

	// 	return;
	// }
	// слишком много проблем, фиксить их сложнее чем несколько редких багов со звуком...

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

	GUI.ClearStroke();
	GUI.SetFillColor(new Color(70, 70, 70));
	GUI.DrawRoundedRectangle(GUI.Width / 2 - 200, GUI.Height / 2 - 25, 400, 50, 25);

	GUI.SetStroke(new Color(155, 155, 155), 2);
	GUI.SetFillColor(Color.Transparent);
	GUI.DrawRoundedRectangle(GUI.Width / 2 - 200, GUI.Height / 2 - 25, 400, 50, 25);

	if (IsParsed()) {
		const ratio = GetImageLoadingProgress();

		GUI.SetFillColor(new Color(155, 155, 155));
		GUI.DrawRoundedRectangle(GUI.Width / 2 - 200 * ratio, GUI.Height / 2 - 25, 400 * ratio, 50, 25);

		GUI.SetFillColor(Color.White);
		GUI.SetFont(48);
		GUI.DrawTextCenter(`${Math.round(ratio * 100)}%`, GUI.Width / 2 - 200, GUI.Height / 2 - 25 - 2, 400, 50);

		GUI.SetFont(16);
		GUI.DrawTextCenterLineBreaked(GUI.Width / 2, GUI.Height / 2 + 50, GetLoadings());

		if (ratio < 1) return;
	} else {
		GUI.SetFillColor(Color.White);
		GUI.SetFont(48);
		GUI.DrawTextCenter("ПРЕД ЗАГРУЗКА", GUI.Width / 2 - 200, GUI.Height / 2 - 25 - 2, 400, 50);

		return;
	}

	window.cancelAnimationFrame(n);

	Promise.all(
		Object.keys(parsedRouters.Items).map((itemKey) => {
			const object = parsedRouters.Items[itemKey];

			if (typeof object === "string") {
				return fetch("Assets/" + object)
					.then((x) => {
						if (!x.ok) {
							if (x.status === 404) return Promise.reject(`Не найдено.\nat [${object}]`);
							else return Promise.reject(`Неизвестная ошибка. Код: ${x.status}`);
						}

						return x.json();
					})
					.then((x) => {
						x.Id = itemKey;
						ItemRegistry.Register(x);
					});
			} else {
				return Promise.reject(`Недопустимый тип пути предмета: ${itemKey}\nat [Routers.json/Items]`);
			}
		})
	)
		.then(() =>
			Promise.all(
				Object.keys(parsedRouters.Weapons).map((weaponKey) => {
					const object = parsedRouters.Weapons[weaponKey];

					if (typeof object === "string") {
						return fetch("Assets/" + object)
							.then((x) => {
								if (!x.ok) {
									if (x.status === 404) return Promise.reject(`Не найдено.\nat [${object}]`);
									else return Promise.reject(`Неизвестная ошибка. Код: ${x.status}`);
								}

								return x.json();
							})
							.then((x) => {
								x.Id = weaponKey;
								Weapon.Register(x);
							});
					} else {
						return Promise.reject(`Недопустимый тип пути оружия: ${weaponKey}\nat [Routers.json/Weapons]`);
					}
				})
			)
		)
		.then(() =>
			Promise.all(
				Object.keys(parsedRouters.Throwables).map((throwableKey) => {
					const object = parsedRouters.Throwables[throwableKey];

					if (typeof object === "string") {
						return fetch("Assets/" + object)
							.then((x) => {
								if (!x.ok) {
									if (x.status === 404) return Promise.reject(`Не найдено.\nat [${object}]`);
									else return Promise.reject(`Неизвестная ошибка. Код: ${x.status}`);
								}

								return x.json();
							})
							.then((x) => {
								x.Id = throwableKey;
								Throwable.Register(x);
							});
					} else {
						return Promise.reject(`Недопустимый тип пути метательного: ${throwableKey}\nat [Routers.json/Weapons]`);
					}
				})
			)
		)
		.then(() =>
			/// DEBUG
			Scene.LoadFromFile("Assets/Scenes/Menu.json")
		)
		.then((x) => (scene = x))
		.catch((err) => {
			scene = Scene.GetErrorScene(err.stack ?? err);
		})
		.finally(() => gameLoop(0));
}

loadLoop();
