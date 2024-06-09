import { Canvas } from "./context.js";
import { Tag } from "./Enums.js";
import { Player } from "./Player.js";

export function Lerp(start: number, end: number, t: number) {
	return start * (1 - t) + end * t;
}

export class Color {
	public readonly R: number;
	public readonly G: number;
	public readonly B: number;
	public readonly A: number;

	public static readonly White = new Color(255, 255, 255, 255);
	public static readonly Black = new Color(0, 0, 0, 255);
	public static readonly Red = new Color(255, 0, 0, 255);
	public static readonly Transparent = new Color(0, 0, 0, 0);

	constructor(r: number, g: number, b: number, a = 255) {
		this.R = r;
		this.G = g;
		this.B = b;
		this.A = a;
	}

	toString() {
		return this.A === 255
			? `rgb(${this.R}, ${this.G}, ${this.B})`
			: `rgba(${this.R}, ${this.G}, ${this.B}, ${this.A / 255})`;
	}
}

export class Rectangle {
	public readonly X: number;
	public readonly Y: number;
	public readonly Width: number;
	public readonly Height: number;

	constructor(x: number, y: number, width: number, height: number) {
		this.X = x;
		this.Y = y;
		this.Width = width;
		this.Height = height;
	}
}

export class Line {
	public readonly X0: number;
	public readonly Y0: number;
	public readonly X1: number;
	public readonly Y1: number;

	constructor(x0: number, y0: number, x1: number, y1: number) {
		this.X0 = x0;
		this.Y0 = y0;
		this.X1 = x1;
		this.Y1 = y1;
	}
}

export function UnorderedRemove<T>(array: Array<T>, index: number) {
	const element = array[index];
	array[index] = array.pop();
	return element;
}

declare global {
	interface Array<T> {
		minBy(by: (element: T) => number): T;
	}

	interface Math {
		clamp(n: number, min: number, max: number): number;
	}
}

Array.prototype.minBy = function <T>(this: T[], by: (element: T) => number): T {
	let min = this[0];

	for (const element of this) if (by(element) < by(min)) min = element;

	return min;
};

Math.clamp = function (n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max);
};

export function GetIntersectPoint(
	line0: Line,
	line1: Line
): Vector2 | undefined {
	const v = line0.X1 - line0.X0;
	const w = line0.Y1 - line0.Y0;
	const v2 = line1.X1 - line1.X0;
	const w2 = line1.Y1 - line1.Y0;

	const t2 =
		(-w * line1.X0 + w * line0.X0 + v * line1.Y0 - v * line0.Y0) /
		(w * v2 - v * w2);
	const t = (line1.X0 - line0.X0 + v2 * t2) / v;

	if (
		t < 0 ||
		t > 1 ||
		t2 < 0 ||
		t2 > 1 ||
		Number.isNaN(t2) ||
		Number.isNaN(t)
	)
		return undefined;
	else return new Vector2(line1.X0 + v2 * t2, line1.Y0 + w2 * t2);
}

export function SquareMagnitude(
	x0: number,
	y0: number,
	x1: number,
	y1: number
): number {
	return (x0 - x1) ** 2 + (y0 - y1) ** 2;
}

export class GameObject {
	protected _x = 0;
	protected _y = 0;
	protected _width: number;
	protected _height: number;
	protected _collider?: Rectangle;
	public OnDestroy?: () => void;
	public Tag?: Tag;

	constructor(width: number, height: number) {
		this._width = width;
		this._height = height;
	}

	public Destroy() {
		if (this.OnDestroy !== undefined) this.OnDestroy();
	}

	public GetPosition() {
		return new Vector2(this._x, this._y);
	}

	public Update(dt: number) {}

	public Render() {}

	public GetCollider(): Rectangle | undefined {
		return this._collider;
	}

	public static IsCollide(who: GameObject, other: GameObject): boolean {
		const colliderWho = who.GetCollider();
		const colliderOther = other.GetCollider();

		return (
			colliderWho !== undefined &&
			colliderOther !== undefined &&
			who._x + colliderWho.Width > other._x &&
			who._x < other._x + colliderOther.Width &&
			who._y + colliderWho.Height > other._y &&
			who._y < other._y + colliderOther.Height
		);
	}

	public static GetCollide(
		who: GameObject,
		other: GameObject
	): Vector2 | false {
		if (this.IsCollide(who, other) === false) return false;

		const xstart = who._x + who._width - other._x;
		const xend = other._x + other._width - who._x;
		const ystart = other._y + other._height - who._y;
		const yend = who._y + who._height - other._y;
		let xOffset = 0;
		let yOffset = 0;

		if (
			xstart > 0 &&
			xend > 0 &&
			xend < other._width &&
			xstart < other._width
		)
			xOffset = 0;
		else if (xstart > 0 && (xend < 0 || xstart < xend)) xOffset = xstart;
		else if (xend > 0) xOffset = -xend;

		if (
			ystart > 0 &&
			yend > 0 &&
			yend < other._height &&
			ystart < other._height
		)
			yOffset = 0;
		else if (ystart > 0 && (yend < 0 || ystart < yend)) yOffset = ystart;
		else if (yend > 0) yOffset = -yend;

		if (xOffset == 0 && yOffset == 0) return false;

		return new Vector2(xOffset, yOffset);
	}
}

export class Entity extends GameObject {
	protected readonly _maxHealth: number;
	protected _speed: number;
	protected _direction: -1 | 1 = 1;
	protected _health: number;
	protected _movingLeft = false;
	protected _movingRight = false;
	protected _verticalAcceleration = 0;
	protected _grounded = true;
	protected _jumpForce = 25;
	protected _xTarget = 0;
	protected _yTarget = 0;

	constructor(
		width: number,
		height: number,
		speed: number,
		maxHealth: number
	) {
		super(width, height);

		this._speed = Math.clamp(speed, 0, Number.MAX_VALUE);
		this._health = Math.clamp(maxHealth, 1, Number.MAX_VALUE);
		this._maxHealth = this._health;

		this._collider = new Rectangle(
			this._x,
			this._y,
			this._width,
			this._height
		);
	}

	public override Update(dt: number) {
		this.ApplyVForce();

		if (this._movingLeft) this.MoveLeft();
		else if (this._movingRight) this.MoveRight();
		this._direction = this._xTarget > this._x + this._width / 2 ? 1 : -1;
	}

	public MoveRight() {
		this._x += this._speed;

		const collideOffsets = Scene.Current.GetCollide(this, Tag.Platform);
		if (collideOffsets !== false && collideOffsets.X != 0)
			this._x -= collideOffsets.X;
	}

	public MoveLeft() {
		this._x -= this._speed;

		const collideOffsets = Scene.Current.GetCollide(this, Tag.Platform);
		if (collideOffsets !== false && collideOffsets.X != 0)
			this._x -= collideOffsets.X;
	}

	public Jump() {
		if (!this._grounded) return;

		this._verticalAcceleration = this._jumpForce;
	}

	private ApplyVForce() {
		this._verticalAcceleration -= this._verticalAcceleration > 0 ? 2 : 3;
		this._y += this._verticalAcceleration;

		if (this._verticalAcceleration <= 0) {
			const offsets = Scene.Current.GetCollide(this, Tag.Platform);

			if (offsets !== false && offsets.Y !== 0) {
				this._verticalAcceleration = 0;

				this._grounded = true;
				this._y += offsets.Y;
			}
		} else if (this._verticalAcceleration > 0) {
			this._grounded = false;
			const offsets = Scene.Current.GetCollide(this, Tag.Platform);

			if (offsets !== false) {
				this._verticalAcceleration = 0;

				this._y += offsets.Y;

				return;
			}
		}
	}

	public TakeDamage(damage: number) {
		this._health -= damage;
	}
}

export class Platform extends GameObject {
	constructor(x: number, y: number, width: number, height: number) {
		super(width, height);

		this.Tag = Tag.Platform;
		this._x = x;
		this._y = y;

		this._collider = new Rectangle(0, 0, width, height);
	}

	override Render(): void {
		Canvas.SetFillColor(Color.Black);
		Canvas.DrawRectangle(this._x, this._y, this._width, this._height);
	}
}

export class Vector2 {
	public readonly X: number;
	public readonly Y: number;

	constructor(X: number, Y: number) {
		this.X = X;
		this.Y = Y;
	}

	public Normalize(): Vector2 {
		const length = this.GetLength();

		return new Vector2(this.X / length, this.Y / length);
	}

	public GetLength(): number {
		return Math.sqrt(this.X ** 2 + this.Y ** 2);
	}
}

export type RaycastHit = {
	instance: GameObject;
	position: Vector2;
};

export class Scene {
	public static Current: Scene;

	private readonly _gameObjects: GameObject[];
	public readonly Player: Player;
	public readonly Length: number;
	private _levelPosition = 0;

	constructor(player: Player, Length: number) {
		this.Length = Length;
		this.Player = player;

		Scene.Current = this;

		this._gameObjects = [
			player,
			new Platform(0, -100, Length, 100),
			new Platform(-100, 0, 100, 1000),
		];
	}

	public GetLevelPosition() {
		return this._levelPosition;
	}

	public GetCollide(who: GameObject, tag?: Tag) {
		for (const object of this._gameObjects) {
			if (tag !== undefined && object.Tag !== tag) continue;

			const collide = GameObject.GetCollide(who, object);

			if (collide !== false) return collide;
		}

		return false;
	}

	public IsCollide(who: GameObject, tag?: Tag) {
		for (const object of this._gameObjects) {
			if (tag !== undefined && object.Tag !== tag) continue;

			const collide = GameObject.IsCollide(who, object);

			if (collide !== false) return collide;
		}

		return false;
	}

	public Raycast(
		from: Vector2,
		direction: Vector2,
		distance: number,
		tag?: Tag
	): RaycastHit[] | undefined {
		const result: RaycastHit[] = [];

		const normalized = direction.Normalize();
		const line = new Line(
			from.X,
			from.Y,
			from.X + normalized.X * distance,
			from.Y + normalized.Y * distance
		);

		for (const object of this._gameObjects) {
			if (tag !== undefined && (object.Tag & tag) === 0) continue;

			const collider = object.GetCollider();
			if (collider === undefined) continue;

			const pos = object.GetPosition();

			const top = GetIntersectPoint(
				line,
				new Line(
					pos.X,
					pos.Y + collider.Height,
					pos.X + collider.Width,
					pos.Y + collider.Height
				)
			);
			const right = GetIntersectPoint(
				line,
				new Line(
					pos.X + collider.Width,
					pos.Y,
					pos.X + collider.Width,
					pos.Y + collider.Height
				)
			);
			const bottom = GetIntersectPoint(
				line,
				new Line(pos.X, pos.Y, pos.X + collider.Width, pos.Y)
			);
			const left = GetIntersectPoint(
				line,
				new Line(pos.X, pos.Y, pos.X, pos.Y + collider.Height)
			);

			if (top !== undefined)
				result.push({ position: top, instance: object });
			if (right !== undefined)
				result.push({ position: right, instance: object });
			if (bottom !== undefined)
				result.push({ position: bottom, instance: object });
			if (left !== undefined)
				result.push({ position: left, instance: object });
		}

		return result.length === 0
			? undefined
			: result.sort(
					(a, b) =>
						(a.position.X - from.X) ** 2 +
						(a.position.Y - from.Y) ** 2 -
						((b.position.X - from.X) ** 2 +
							(b.position.Y - from.Y) ** 2)
			  );
	}

	public Update(dt: number) {
		const plr = this.Player.GetCollider();
		this._levelPosition = Lerp(
			this._levelPosition,
			Math.clamp(plr.X - 1500 / 2 - plr.Width / 2, 0, this.Length - 1500),
			dt
		);

		for (const object of this._gameObjects) object.Update(dt);
	}

	public Render() {
		Canvas.SetFillColor(new Color(50, 50, 50));
		Canvas.DrawRectangleFixed(0, 0, this.Length, 750);

		for (const object of this._gameObjects) object.Render();
	}

	public Instantiate(object: GameObject) {
		const index = this._gameObjects.push(object) - 1;

		object.OnDestroy = () => this._gameObjects.splice(index);
	}
}

export class Bullet extends GameObject {
	private static readonly _bulletColor0 = new Color(255, 255, 255, 5);
	private static readonly _bulletColor1 = new Color(255, 255, 255, 50);
	private static readonly _maxLifetime = 200;

	private readonly _length: number;
	private readonly _angle: number;
	private _lifetime = 0;

	constructor(x: number, y: number, length: number, angle: number) {
		super(length, 2);

		this._x = x;
		this._y = y;
		this._length = length;
		this._angle = angle;
	}

	override Update(dt: number) {
		this._lifetime += dt;

		if (this._lifetime >= Bullet._maxLifetime) this.Destroy();
	}

	override Render(): void {
		Canvas.DrawRectangleWithGradientAndAngle(
			new Rectangle(this._x, this._y, this._length, 2),
			[this._lifetime / Bullet._maxLifetime, Bullet._bulletColor0],
			[1, Bullet._bulletColor1],
			this._angle,
			0,
			1
		);
	}
}
