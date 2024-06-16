import { EnemyType, Tag } from "./Enums.js";
import { Player } from "./GameObjects/Player.js";
import { Canvas, GUI } from "./Context.js";
import { Vector2, RaycastHit, Line, GetIntersectPoint, Lerp, Sprite, LoadImage, Color, Rectangle, Sound, LoadSound, SetImageCount } from "./Utilites.js";
import { GameObject, Interactable } from "./GameObjects/GameObject.js";
import { Wall } from "./GameObjects/Wall.js";
import { Platform } from "./GameObjects/Platform.js";
import { BlinkingRectangle } from "./GameObjects/GUI/BlinkingRectangle.js";
import { GUIRectangle } from "./GameObjects/GUI/GUIRectangle.js";
import { BlinkingLabel } from "./GameObjects/GUI/BlinkingLabel.js";
import { AudioSource } from "./GameObjects/BoomBox.js";
import { Box } from "./Assets/Containers/Box.js";
import { Item } from "./Assets/Items/Item.js";
import { Spikes } from "./GameObjects/Spikes.js";
import { Ladder } from "./GameObjects/Ladder.js";
import { Morshu } from "./GameObjects/QuestGivers/Morshu.js";
import { Backpack } from "./Assets/Containers/Backpack.js";
import { Human } from "./GameObjects/Enemies/Human.js";

export class Scene {
	public static Current: Scene;
	private static readonly _sprites = new Map<string, Sprite | Sprite[]>();
	private static readonly _sounds = new Map<string, Sound>();

	private readonly _gameObjects: GameObject[] = [];
	private readonly _interactableGameObjects: Interactable[] = [];

	private readonly _background: Sprite | null;

	public static Player: Player | null = null;
	public Player: Player | null = null;
	private _levelPosition = 0;
	public Time = 0;

	constructor(background: Sprite | null, objects: GameObject[]) {
		this._background = background;

		Scene.Current = this;

		for (const object of objects) this.Instantiate(object);
	}

	public static async Load() {
		const routers = await fetch("Assets/Routers.json").catch(() => false as const);
		if (routers === false || !routers.ok) return Scene.LoadErrorScene("Не найдено: Assets/Routers.json");

		const parsedRouters = await routers.json();
		if (parsedRouters.Scenes === undefined || parsedRouters.Scenes.length === 0) return Scene.LoadErrorScene("Сцены не найдены в Assets/Routers.json");
		if (parsedRouters.Images === undefined) return Scene.LoadErrorScene("Изображения не найдены в Assets/Routers.json");
		if (parsedRouters.Sounds === undefined) return Scene.LoadErrorScene("Звуки не найдены в Assets/Routers.json");

		let imagesToLoad = 0;
		for (const imageKey in parsedRouters.Images) {
			imagesToLoad++;
			const object = parsedRouters.Images[imageKey];

			if (typeof object === "string") this._sprites.set(imageKey, LoadImage(object as string));
			else if (object instanceof Array)
				this._sprites.set(
					imageKey,
					object.map((x) => LoadImage(x))
				);
			else return Scene.LoadErrorScene(`Недопустимый тип изображения: ${imageKey}`);
		}
		SetImageCount(imagesToLoad);

		for (const soundKey in parsedRouters.Sounds) {
			const object = parsedRouters.Sounds[soundKey];

			if (typeof object === "string") this._sounds.set(soundKey, LoadSound(object as string));
			else return Scene.LoadErrorScene(`Недопустимый тип звука: ${soundKey}`);
		}

		const sceneFile = await fetch(parsedRouters.Scenes[0]);
		if (!sceneFile.ok) return Scene.LoadErrorScene(`Сцена не найдена: ${parsedRouters.Scenes[0]}`);

		const sceneData = await sceneFile.json();
		return new Scene(
			this._sprites.get(sceneData.Background) as Sprite,
			(sceneData.GameObjects as { Type: string; Arguments: unknown[] }[]).map((x) => {
				switch (x.Type) {
					case "Wall":
						return new Wall(...(x.Arguments as [number, number, number, number]));
					case "Platform":
						return new Platform(...(x.Arguments as [number, number, number, number]));
					case "Player":
						return new Player(...(x.Arguments as [number, number]));
					case "Boombox":
						return new AudioSource(...(x.Arguments as [number, number, number]));
					case "Box":
						x.Arguments.slice(2).map((x) => {
							const value = x as { Item: string; Chance: number };

							return { Item: Item.Parse(value.Item), Chance: value.Chance };
						});

						return new Box(...(x.Arguments as [number, number]));
					case "Spikes":
						return new Spikes(...(x.Arguments as [number, number, number, number]));
					case "Ladder":
						return new Ladder(...(x.Arguments as [number, number, number]));
					case "Morshu":
						return new Morshu(...(x.Arguments as [number, number]));
					case "Backpack":
						x.Arguments.slice(2).map((x) => Item.Parse(x as string));

						return new Backpack(...(x.Arguments as [number, number]));
					case "Human":
						x.Arguments[2] = x.Arguments[2] === "Green" ? EnemyType.Green : EnemyType.Rat;

						return new Human(...(x.Arguments as [number, number, EnemyType]));
					default:
						throw new Error("Не удалось распарсить: " + x.Type);
				}
			})
		);
	}

	private static LoadErrorScene(error: string) {
		return new Scene(null, [
			new GUIRectangle(new Rectangle(GUI.Width / 2, GUI.Height / 2, GUI.Width, GUI.Height), Color.Black),
			new BlinkingRectangle(new Rectangle(GUI.Width / 2, GUI.Height / 2, GUI.Width / 2, GUI.Height / 2), new Color(0, 0, 255), new Color(255, 0, 0), 1500),
			new BlinkingLabel(error, GUI.Width / 2, GUI.Height / 2, GUI.Width, GUI.Height, new Color(255, 0, 0), new Color(0, 0, 255), 1500),
		]);
	}

	public static GetSprite(key: string): Sprite | Sprite[] {
		return Scene._sprites.get(key);
	}

	public static GetSound(key: string): Sound {
		return Scene._sounds.get(key);
	}

	public GetLevelPosition() {
		return this._levelPosition;
	}

	public GetCollide(who: GameObject, tag?: Tag) {
		for (const object of this._gameObjects) {
			if (tag !== undefined && (object.Tag & tag) === 0) continue;

			const collide = GameObject.GetCollide(who, object);

			if (collide !== false) return collide;
		}

		return false;
	}

	public GetCollides(who: GameObject, tag?: Tag): RaycastHit[] {
		const result: RaycastHit[] = [];

		if (tag === undefined)
			for (const object of this._gameObjects) {
				const collide = GameObject.GetCollide(who, object);

				if (collide !== false) result.push(collide);
			}
		else
			for (const object of this._gameObjects) {
				if (object.Tag & tag) {
					const collide = GameObject.GetCollide(who, object);

					if (collide !== false) result.push(collide);
				}
			}

		return result;
	}

	public IsCollide(who: GameObject, tag?: Tag) {
		for (const object of this._gameObjects) {
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

		for (const object of this._gameObjects) {
			if (tag !== undefined && (object.Tag & tag) === 0) continue;

			const collider = object.GetCollider();
			if (collider === undefined) continue;

			const pos = object.GetPosition();

			const top = GetIntersectPoint(line, new Line(pos.X, pos.Y + collider.Height, pos.X + collider.Width, pos.Y + collider.Height));
			const right = GetIntersectPoint(line, new Line(pos.X + collider.Width, pos.Y, pos.X + collider.Width, pos.Y + collider.Height));
			const bottom = GetIntersectPoint(line, new Line(pos.X, pos.Y, pos.X + collider.Width, pos.Y));
			const left = GetIntersectPoint(line, new Line(pos.X, pos.Y, pos.X, pos.Y + collider.Height));

			if (top !== undefined) result.push({ position: top, instance: object });
			if (right !== undefined) result.push({ position: right, instance: object });
			if (bottom !== undefined) result.push({ position: bottom, instance: object });
			if (left !== undefined) result.push({ position: left, instance: object });
		}

		return result.sort((a, b) => (a.position.X - from.X) ** 2 + (a.position.Y - from.Y) ** 2 - ((b.position.X - from.X) ** 2 + (b.position.Y - from.Y) ** 2));
	}

	public GetInteractiveAt(x: number, y: number): Interactable | null {
		for (const object of this._interactableGameObjects) {
			const playerCenter = this.Player.GetCenter();
			const position = object.GetRectangle();

			if ((position.X + position.Width / 2 - playerCenter.X) ** 2 + (position.Y + position.Height / 2 - playerCenter.Y) ** 2 > 100 * 100) continue;
			if (x > position.X && x < position.X + position.Width && y > position.Y && y < position.Y + position.Height) return object;
		}

		return null;
	}

	public Update(time: number) {
		if (this.Player !== null && this.Player.CanTarget()) {
			const plrPos = this.Player.GetPosition();
			const plrTargetRaw = this.Player.GetTarget();

			this._levelPosition = Math.round(Lerp(this._levelPosition, Math.clamp(-750 + (plrTargetRaw.X + 50 / 2 - 750), 300 - 1500, -300) + plrPos.X, 0.1));
		}

		for (const object of this._gameObjects) object.Update(time - this.Time);

		this.Time = time;
	}

	public Render() {
		if (this._background !== null) Canvas.DrawBackground(this._background, this._levelPosition);

		for (const object of this._gameObjects) object.Render();
	}

	public RenderOverlay() {
		if (this.Player !== null) {
			Canvas.SwitchLayer(false);

			Canvas.EraseRectangle(0, 0, Canvas.GetSize().X, Canvas.GetSize().Y);
			this.Player.RenderOverlay();
			Canvas.SwitchLayer(true);
		}
	}

	public GetByTag(tag: Tag) {
		return this._gameObjects.filter((x) => x.Tag == tag);
	}

	public GetByType(type: typeof GameObject) {
		return this._gameObjects.filter((x) => x instanceof type);
	}

	public Instantiate(object: GameObject) {
		this._gameObjects.push(object);

		if (object instanceof Player) {
			this.Player = object;
			Scene.Player = object;
		}

		if (object instanceof Interactable) {
			this._interactableGameObjects.push(object);

			object.OnDestroy = () => {
				this._gameObjects.splice(this._gameObjects.indexOf(object), 1);
				this._interactableGameObjects.splice(this._interactableGameObjects.indexOf(object), 1);
			};
		} else object.OnDestroy = () => this._gameObjects.splice(this._gameObjects.indexOf(object), 1);
	}
}
