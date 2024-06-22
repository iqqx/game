import { Tag } from "../Enums.js";
import { Rectangle, Vector2, RaycastHit } from "../Utilites.js";

export class GameObject {
	protected _x = 0;
	protected _y = 0;
	public Width: number;
	public Height: number;
	protected _collider?: Rectangle;
	public OnDestroy?: () => void;
	public Tag?: Tag;

	constructor(width: number, height: number) {
		this.Width = width;
		this.Height = height;
	}

	public Destroy() {
		if (this.OnDestroy !== undefined) this.OnDestroy();
	}

	public GetRectangle() {
		return new Rectangle(this._x, this._y, this.Width, this.Height);
	}

	public GetPosition() {
		return new Vector2(this._x, this._y);
	}

	public GetSize() {
		return new Vector2(this.Width, this.Height);
	}

	public GetCenter() {
		return new Vector2(this._x + this.Width / 2, this._y + this.Height / 2);
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

	public static IsCollideByRect(who: Rectangle, other: GameObject): boolean {
		const colliderOther = other.GetCollider();

		return (
			colliderOther !== undefined && who.X + who.Width > other._x && who.X < other._x + colliderOther.Width && who.Y + who.Height > other._y && who.Y < other._y + colliderOther.Height
		);
	}

	public static GetCollide(who: GameObject, other: GameObject): RaycastHit | false {
		if (this.IsCollide(who, other) === false) return false;

		const xstart = who._x + who.Width - other._x;
		const xend = other._x + other.Width - who._x;
		const ystart = other._y + other.Height - who._y;
		const yend = other._y - (who._y + who.Height);

		return {
			instance: other,
			position: new Vector2(0, 0),
			Normal: new Vector2(Math.sign(xstart), Math.sign(ystart)),
			start: new Vector2(xstart, ystart),
			end: new Vector2(xend, yend),
		};
	}

	public static GetCollideByRect(who: Rectangle, other: GameObject): RaycastHit | false {
		if (this.IsCollideByRect(who, other) === false) return false;

		const xstart = who.X + who.Width - other._x;
		const ystart = other._y + other.Height - who.Y;
		const xend = other._x + other.Width - who.X;
		const yend = other._y - (who.Y + who.Height);

		return {
			instance: other,
			position: new Vector2(0, 0),
			Normal: new Vector2(Math.sign(xstart), Math.sign(ystart)),
			start: new Vector2(xstart, ystart),
			end: new Vector2(xend, yend),
		};
	}
}

export abstract class Interactable extends GameObject {
	abstract GetInteractives(): string[];
	abstract OnInteractSelected(id: number): void;
}

export interface IPickapable {
	readonly OnPickup?: () => void;
}
