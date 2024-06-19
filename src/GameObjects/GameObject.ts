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

	public static GetCollide(who: GameObject, other: GameObject): RaycastHit | false {
		if (this.IsCollide(who, other) === false) return false;

		const xstart = who._x + who.Width - other._x;
		const xend = other._x + other.Width - who._x;
		const ystart = other._y + other.Height - who._y;
		// const yend = who._y + who.Height - other._y;
		const yend = other._y - (who._y + who.Height);
		let xOffset = 0;
		let yOffset = 0;

		// if (xstart > 0 && xend > 0 && xend < other.Width && xstart < other.Width) xOffset = 0;
		// else if (xstart > 0 && (xend < 0 || xstart < xend)) xOffset = xstart;
		// else if (xend > 0) xOffset = -xend;

		// if (ystart > 0 && yend > 0 && yend < other.Height && ystart < other.Height) yOffset = 0;
		// else if (ystart > 0 && (yend < 0 || ystart < yend)) yOffset = ystart;
		// else if (yend > 0) yOffset = -yend;

		// if (xOffset == 0 && yOffset == 0) return false;

		return {
			instance: other,
			position: new Vector2(xOffset, yOffset),
			Normal: new Vector2(Math.sign(xOffset), Math.sign(yOffset)),
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
