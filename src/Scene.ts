import { Tag } from "./Enums.js";
import { Player } from "./GameObjects/Player.js";
import { Wall } from "./GameObjects/Wall.js";
import { Canvas } from "./Context.js";
import { GameObject, Vector2, RaycastHit, Line, GetIntersectPoint, Lerp, Sprite, Color } from "./Utilites.js";

export class Scene {
	public static Current: Scene;

	private readonly _gameObjects: GameObject[];
	public readonly Player: Player;
	public readonly Length: number;
	private readonly _background: Sprite;

	private _levelPosition = 0;
	public Time = 0;

	constructor(player: Player, background: Sprite) {
		this.Length = background.Image.naturalWidth * (Canvas.GetSize().Y / background.Image.naturalHeight);
		this.Player = player;
		this._background = background;

		Scene.Current = this;

		this._gameObjects = [player, new Wall(0, 750, this.Length, 100), new Wall(this.Length, 0, 100, 1000), new Wall(0, -100, this.Length, 100), new Wall(-100, 0, 100, 1000)];
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

	public Update(time: number) {
		const plrPos = this.Player.GetPosition();
		const plrTargetRaw = this.Player.GetTarget();

		this._levelPosition = Lerp(this._levelPosition, Math.clamp(-750 + (plrTargetRaw.X + 50 / 2 - 750), 300 - 1500, -300) + plrPos.X, 0.1);

		for (const object of this._gameObjects) object.Update(time - this.Time);

		this.Time = time;
	}

	public Render() {
		Canvas.DrawBackground(this._background);

		for (const object of this._gameObjects) object.Render();
	}

	public RenderOverlay() {
		this.Player.RenderOverlay();
	}

	public GetByTag(tag: Tag) {
		return this._gameObjects.filter((x) => x.Tag == tag);
	}

	public Instantiate(object: GameObject) {
		this._gameObjects.push(object);

		object.OnDestroy = () => this._gameObjects.splice(this._gameObjects.indexOf(object), 1);
	}
}
