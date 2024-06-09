import { Tag } from "./Enums.js";

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
