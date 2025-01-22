import { EnemyType, Tag } from "./Enums.js";
import { Player } from "./GameObjects/Player.js";
import { Canvas, GUI } from "./Context.js";
import { Vector2, RaycastHit, Line, GetIntersectPoint, Lerp, Sprite, Color, Rectangle } from "./Utilites.js";
import { GameObject, Interactable } from "./GameObjects/GameObject.js";
import { BlinkingRectangle } from "./GameObjects/GUI/BlinkingRectangle.js";
import { GUIRectangle } from "./GameObjects/GUI/GUIRectangle.js";
import { BlinkingLabel } from "./GameObjects/GUI/BlinkingLabel.js";
import { GUIBase } from "./GameObjects/GUI/GUIBase.js";
import { Cursor } from "./GameObjects/GUI/Cursor.js";
import { TextButton } from "./GameObjects/GUI/TextButton.js";
import { Backpack } from "./Assets/Containers/Backpack.js";
import { Box } from "./Assets/Containers/Box.js";
import { AudioSource } from "./GameObjects/BoomBox.js";
import { Human } from "./GameObjects/Enemies/Human.js";
import { Rat } from "./GameObjects/Enemies/Rat.js";
import { Ladder } from "./GameObjects/Ladder.js";
import { Platform } from "./GameObjects/Platform.js";
import { Spikes } from "./GameObjects/Spikes.js";
import { Wall } from "./GameObjects/Wall.js";
import { Image } from "./GameObjects/GUI/Image.js";
import { LoadingIcon } from "./GameObjects/GUI/LoadingIcon.js";
import { Label } from "./GameObjects/GUI/Label.js";
import { IntroCutscene } from "./GameObjects/IntroCutscene.js";
import { HintLabel } from "./GameObjects/GUI/HintLabel.js";
import { GUISpotLight } from "./GameObjects/GUI/GUISpotLight.js";
import { PressedIndicator } from "./GameObjects/GUI/PressedIndicator.js";
import { Titles } from "./GameObjects/GUI/Titles.js";
import { Artem } from "./GameObjects/QuestGivers/Artem.js";
import { Elder } from "./GameObjects/QuestGivers/Elder.js";
import { Trader } from "./GameObjects/QuestGivers/Trader.js";
import { Corpse } from "./GameObjects/Corpse.js";
import { SceneEditor } from "./SceneEditor.js";
import { FPSCounter } from "./GameObjects/GUI/FPSCounter.js";
import { Weapon } from "./Assets/Weapons/Weapon.js";
import { Throwable } from "./Assets/Throwable.js";
import { GetSprite } from "./AssetsLoader.js";
import { Bread, Vodka, Sausage, AidKit, Radio, DogTag, RatTail, Adrenalin, PistolBullet, RifleBullet } from "./Assets/Items/Items.js";
import { Monster } from "./GameObjects/Enemies/Monster.js";

export class Scene {
	public static Current: Scene;

	private readonly _gameObjects: GameObject[] = [];
	private readonly _interactableGameObjects: Interactable[] = [];
	private readonly _GUIElements: GUIBase[] = [];
	private readonly _background: Sprite | null;
	private readonly _keyDownEvents: [string, () => void][] = [];

	private _touch: Vector2 | null = null;
	private _levelPosition = 3899;
	private _mouseX = 0;
	private _mouseY = 0;
	private _lmb = false;
	private _rmb = false;

	public static Player: Player | null = null;
	public Player: Player | null = null;
	public static Time = 0;

	constructor(background: Sprite | null, objects: (GameObject | GUIBase)[]) {
		this._background = background;

		if (Scene.Current !== undefined) Scene.Current.Unload();
		Scene.Current = this;

		for (const object of objects)
			if (object instanceof GameObject) this.Instantiate(object);
			else this.AddGUI(object);

		addEventListener("mousemove", (e) => {
			if ((e.target as HTMLElement).tagName !== "CANVAS") return;

			Scene.Current._mouseX = Math.round(e.offsetX * Canvas.GetAspectRatio());
			Scene.Current._mouseY = Math.round(Canvas.GetSize().Y - e.offsetY * Canvas.GetAspectRatio());
		});

		addEventListener("mousedown", (e) => {
			if ((e.target as HTMLElement).tagName !== "CANVAS") return;

			Scene.Current._mouseX = Math.round(e.offsetX * Canvas.GetAspectRatio());
			Scene.Current._mouseY = Math.round(Canvas.GetSize().Y - e.offsetY * Canvas.GetAspectRatio());

			if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Mobile|Silk|Opera Mini/i.test(navigator.userAgent)) {
				this._touch = new Vector2(Scene.Current._mouseX, Scene.Current._mouseY);
			} else {
				if (e.button === 0) this._lmb = true;
				if (e.button === 2) this._rmb = true;
			}

			for (const event of this._keyDownEvents) if (event[0] === "any") event[1]();
		});

		addEventListener("mouseup", (e) => {
			if ((e.target as HTMLElement).tagName !== "CANVAS") return;

			if (e.button === 0) this._lmb = false;
			if (e.button === 2) this._rmb = false;
		});

		addEventListener("keydown", (e) => {
			for (const event of this._keyDownEvents) if (event[0] === "any" || event[0] === e.code) event[1]();
		});
	}

	public Unload() {
		this._gameObjects.clear();
		this._interactableGameObjects.clear();
		this._GUIElements.clear();
		this._keyDownEvents.clear();
		this.Player = undefined;
	}

	public static async LoadFromFile(src: string) {
		const scene = await fetch(src);
		if (!scene.ok) return Scene.GetErrorScene("Сцена не найдена: " + src);

		const sceneData = await scene.json();

		return new Scene(
			sceneData.Background === undefined ? null : (GetSprite(sceneData.Background) as Sprite),
			sceneData.GameObjects.map((x: unknown) => this.ParseObject(x))
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static ParseObject(x: any) {
		switch (x.Type) {
			case "PressedIndicator":
				return new PressedIndicator(...(x.Arguments as [number, number, string, number]));
			case "Titles":
				return new Titles();
			case "SpotLightSpawner":
				return new GUISpotLight();
			case "HintLabel":
				return new HintLabel(...(x.Arguments as [string, number, number]));
			case "IntroCutscene":
				return new IntroCutscene(x.Arguments[0]);
			case "Label":
				return new Label(...(x.Arguments as [string, number, number, number, number]));
			case "Image":
				x.Arguments[4] = GetSprite(x.Arguments[4] as string) as Sprite;
				return new Image(...(x.Arguments as [number, number, number, number, Sprite]));
			case "LoadingIcon": {
				const actions: (() => void)[] = x.Actions.map((x) => this.ParseAction(x));

				return new LoadingIcon(...(x.Arguments as [number, number, number]), () => {
					for (const action of actions) action();
				});
			}
			case "Cursor":
				return new Cursor();
			case "TextButton": {
				const button = new TextButton(...(x.Arguments as [number, number, number, number, string, number]));
				if (x.Action !== undefined) button.SetOnClicked(this.ParseAction(x.Action));

				return button;
			}
			case "Wall":
				return new Wall(...(x.Arguments as [number, number, number, number]));
			case "FPSCounter":
				return new FPSCounter();
			case "Platform":
				return new Platform(...(x.Arguments as [number, number, number]));
			case "Player":
				return new Player(...(x.Arguments as [number, number]));
			case "Boombox":
				return new AudioSource(...(x.Arguments as [number, number, number]));
			case "Box":
				x.Arguments.splice(
					2,
					x.Arguments.length - 2,
					...x.Arguments.slice(2).map((x) => {
						const value = x as { Item: string; Chance: number };

						return { Item: Scene.ParseItem(value.Item), Chance: value.Chance };
					})
				);

				return new Box(...(x.Arguments as [number, number]));
			case "Spikes":
				return new Spikes(...(x.Arguments as [number, number, number, number]));
			case "Ladder":
				return new Ladder(...(x.Arguments as [number, number, number]));
			case "Artem":
				return new Artem(...(x.Arguments as [number, number]));
			case "Elder":
				return new Elder(...(x.Arguments as [number, number]));
			case "Trader":
				return new Trader(...(x.Arguments as [number, number]));
			case "Backpack":
				x.Arguments.splice(
					2,
					x.Arguments.length - 2,
					...x.Arguments.slice(2).map((x) => {
						return Scene.ParseItem(x as string);
					})
				);

				return new Backpack(...(x.Arguments as [number, number]));
			case "HumanCorpse":
				x.Arguments.splice(
					2,
					x.Arguments.length - 2,
					...x.Arguments.slice(2).map((x) => {
						return Scene.ParseItem(x as string);
					})
				);

				return new Corpse(...(x.Arguments as [number, number]));
			case "Human":
				x.Arguments[2] = x.Arguments[2] === "Green" ? EnemyType.Green : EnemyType.Red;
				x.Arguments[4] = x.Arguments[4] === undefined ? undefined : this.ParseItem(x.Arguments[4]);

				return new Human(...(x.Arguments as [number, number, EnemyType.Red | EnemyType.Green]));
			case "Rat":
				return new Rat(...(x.Arguments as [number, number]));
			case "Monster":
				return new Monster(...(x.Arguments as [number, number]));
			default:
				throw new Error("Не удалось распарсить: " + x.Type);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static ParseAction(x: any) {
		switch (x.Type) {
			case "LoadScene":
				return () => Scene.LoadFromFile(x.Source);
			case "GotoUrl":
				return () => (window.location.href = x.Source);
			case "LoadSceneEditor":
				return () => SceneEditor.LoadFromFile(x.Source);
			case "Replace":
				return function () {
					Scene.Current.Destroy(this);
					Scene.Current.AddGUI(Scene.ParseObject(x.With) as GUIBase);
				};
			case "RegisterEvent":
				switch (x.On) {
					case "AnyKeyDown":
						return () => Scene.Current.RegisterKeyDown(this.ParseAction(x.Action));
				}
		}
	}

	public RegisterKeyDown(action: () => void, key = "any") {
		this._keyDownEvents.push([key, action]);
	}

	public static GetErrorScene(error: string) {
		GUI.SetFont(32); // for blinking text
		const textSize = GUI.GetTextSize("КРИТИЧЕСКАЯ ОШИБКА", true);

		return new Scene(null, [
			new GUIRectangle(new Rectangle(GUI.Width / 2, GUI.Height / 2, GUI.Width, GUI.Height), Color.Black),
			new BlinkingRectangle(new Rectangle(GUI.Width / 2, GUI.Height / 2 - (textSize.Y + 100), textSize.X + 50, textSize.Y + 20), new Color(0, 0, 255), new Color(255, 0, 0), 1500),
			new BlinkingLabel("КРИТИЧЕСКАЯ ОШИБКА", GUI.Width / 2, GUI.Height / 2 - (textSize.Y + 100), GUI.Width, GUI.Height, new Color(255, 0, 0), new Color(0, 0, 255), 1500),
			new Label(error, GUI.Width / 2, GUI.Height / 2, GUI.Width, GUI.Height, 24, Color.Red),
		]);
	}

	public GetLevelPosition() {
		return Math.round(Scene.Current._levelPosition);
	}

	public GetMousePosition() {
		return new Vector2(Scene.Current._mouseX, Scene.Current._mouseY);
	}

	public GetMouseButtons() {
		return {
			Left: this._lmb,
			Right: this._rmb,
		};
	}

	public GetCollide(who: GameObject, tag?: Tag) {
		for (const object of Scene.Current._gameObjects) {
			if (tag !== undefined && (object.Tag & tag) === 0) continue;

			const collide = GameObject.GetCollide(who, object);

			if (collide !== false) return collide;
		}

		return false;
	}

	public GetCollides(who: GameObject, tag?: Tag): RaycastHit[] {
		const result: RaycastHit[] = [];

		if (tag === undefined)
			for (const object of Scene.Current._gameObjects) {
				const collide = GameObject.GetCollide(who, object);

				if (collide !== false) result.push(collide);
			}
		else
			for (const object of Scene.Current._gameObjects) {
				if (object.Tag & tag) {
					const collide = GameObject.GetCollide(who, object);

					if (collide !== false) result.push(collide);
				}
			}

		return result;
	}

	public GetCollidesByRect(who: Rectangle, tag?: Tag): RaycastHit[] {
		const result: RaycastHit[] = [];

		if (tag === undefined)
			for (const object of Scene.Current._gameObjects) {
				const collide = GameObject.GetCollideByRect(who, object);

				if (collide !== false) result.push(collide);
			}
		else
			for (const object of Scene.Current._gameObjects) {
				if ((object.Tag & tag) > 0) {
					const collide = GameObject.GetCollideByRect(who, object);

					if (collide !== false) result.push(collide);
				}
			}

		return result;
	}

	public IsCollide(who: GameObject, tag?: Tag) {
		for (const object of Scene.Current._gameObjects) {
			if (tag !== undefined && (object.Tag & tag) === 0) continue;

			const collide = GameObject.IsCollide(who, object);

			if (collide !== false) return collide;
		}

		return false;
	}

	public Raycast(from: Vector2, direction: Vector2, distance: number, tag?: Tag): RaycastHit[] {
		const result: RaycastHit[] = [];

		const normalized = direction.Normalize();
		const line = new Line(from.X, from.Y, from.X + normalized.X * distance, from.Y + normalized.Y * distance);

		for (const object of Scene.Current._gameObjects) {
			if (tag !== undefined && (object.Tag & tag) === 0) continue;

			const collider = object.GetCollider();
			if (collider === undefined) continue;

			const pos = object.GetPosition();

			const top = GetIntersectPoint(line, new Line(pos.X, pos.Y + collider.Height, pos.X + collider.Width, pos.Y + collider.Height));
			const right = GetIntersectPoint(line, new Line(pos.X + collider.Width, pos.Y, pos.X + collider.Width, pos.Y + collider.Height));
			const bottom = GetIntersectPoint(line, new Line(pos.X, pos.Y, pos.X + collider.Width, pos.Y));
			const left = GetIntersectPoint(line, new Line(pos.X, pos.Y, pos.X, pos.Y + collider.Height));

			if (top !== undefined) result.push({ position: top, instance: object, Normal: new Vector2(0, 1) });
			if (right !== undefined) result.push({ position: right, instance: object, Normal: new Vector2(1, 0) });
			if (bottom !== undefined) result.push({ position: bottom, instance: object, Normal: new Vector2(0, -1) });
			if (left !== undefined) result.push({ position: left, instance: object, Normal: new Vector2(-1, 0) });
		}

		return result.sort((a, b) => (a.position.X - from.X) ** 2 + (a.position.Y - from.Y) ** 2 - ((b.position.X - from.X) ** 2 + (b.position.Y - from.Y) ** 2));
	}

	public GetInteractiveAt(x: number, y: number): Interactable | null {
		for (let i = Scene.Current._interactableGameObjects.length - 1; i >= 0; i--) {
			const playerCenter = Scene.Current.Player.GetCenter();
			const position = Scene.Current._interactableGameObjects[i].GetRectangle();

			if ((position.X + position.Width / 2 - playerCenter.X) ** 2 + (position.Y + position.Height / 2 - playerCenter.Y) ** 2 > 100 * 100) continue;
			if (x > position.X && x < position.X + position.Width && y > position.Y && y < position.Y + position.Height) return Scene.Current._interactableGameObjects[i];
		}

		return null;
	}

	public Update(time: number) {
		const dt = Math.min(200, time - Scene.Time);

		if (Scene.Current.Player !== null && Scene.Current.Player.CanTarget()) {
			const plrPos = Scene.Current.Player.GetPosition();
			const plrTargetRaw = Scene.Current.Player.GetTarget();

			const offset = Math.clamp(plrTargetRaw.X + 50 / 2 - 1500, 300 - 1500, -300) + plrPos.X - Scene.Current._levelPosition;

			Scene.Current._levelPosition += dt * 0.005 * offset;
		}

		for (const object of Scene.Current._gameObjects) object.Update(dt);
		for (const element of Scene.Current._GUIElements) element.Update(dt, time);

		Scene.Time = time;
		this._touch = null;
	}

	public Render() {
		if (Scene.Current._background == null) {
			Canvas.ClearStroke();
			Canvas.SetFillColor(Color.Black);
			Canvas.DrawRectangle(0, 0, GUI.Width, GUI.Height);
		} else Canvas.DrawBackground(Scene.Current._background, Scene.Current._levelPosition);

		for (const object of Scene.Current._gameObjects) object.Render();
	}

	public RenderOverlay() {
		if (Scene.Current.Player !== null) Scene.Current.Player.RenderOverlay();

		for (const element of Scene.Current._GUIElements) element.Render();
	}

	public GetTouch() {
		return this._touch;
	}

	public GetByTag(tag: Tag) {
		return Scene.Current._gameObjects.filter((x) => (x.Tag & tag) > 0);
	}

	public GetByType(type: typeof GameObject) {
		return Scene.Current._gameObjects.filter((x) => x instanceof type);
	}

	public Instantiate(object: GameObject) {
		Scene.Current._gameObjects.push(object);

		if (object instanceof Player) {
			Scene.Current.Player = object;
			Scene.Player = object;
		}

		if (object instanceof Interactable) {
			Scene.Current._interactableGameObjects.push(object);

			object.OnDestroy = () => {
				Scene.Current._gameObjects.splice(Scene.Current._gameObjects.indexOf(object), 1);
				Scene.Current._interactableGameObjects.splice(Scene.Current._interactableGameObjects.indexOf(object), 1);
			};
		} else object.OnDestroy = () => Scene.Current._gameObjects.splice(Scene.Current._gameObjects.indexOf(object), 1);
	}

	public AddGUI(element: GUIBase) {
		Scene.Current._GUIElements.push(element);
	}

	public Destroy(element: GUIBase) {
		Scene.Current._GUIElements.splice(Scene.Current._GUIElements.indexOf(element), 1);
	}

	public DestroyGameObject(element: GameObject) {
		Scene.Current._gameObjects.splice(Scene.Current._gameObjects.indexOf(element), 1);

		if (element instanceof Interactable) Scene.Current._interactableGameObjects.splice(Scene.Current._interactableGameObjects.indexOf(element), 1);
	}

	private static ParseItem(raw: string) {
		switch (raw) {
			case "Bread":
				return new Bread();
			case "Vodka":
				return new Vodka();
			case "Sausage":
				return new Sausage();
			case "AidKit":
				return new AidKit();
			case "Radio":
				return new Radio();
			case "DogTag":
				return new DogTag();
			case "RatTail":
				return new RatTail();
			case "Adrenalin":
				return new Adrenalin();
			case "PistolBullet":
				return new PistolBullet();
			case "RifleBullet":
				return new RifleBullet();
			default:
				const weapon = Weapon.GetById(raw);
				if (weapon !== undefined) return weapon;
				const throwable = Throwable.GetById(raw);
				if (throwable !== undefined) return throwable;

				throw new Error("Предмет не удалось распарсить: " + raw);
		}
	}
}
