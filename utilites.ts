export function Clamp(n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max);
}

export function Lerp(start: number, end: number, t: number) {
	return start * (1 - t) + end * t;
}

export class Color {
	private readonly _r: number;
	private readonly _g: number;
	private readonly _b: number;
	private readonly _a: number;

	public static readonly White = new Color(255, 255, 255, 255);
	public static readonly Black = new Color(0, 0, 0, 255);
	public static readonly Transparent = new Color(0, 0, 0, 0);

	constructor(r: number, g: number, b: number, a = 255) {
		this._r = r;
		this._g = g;
		this._b = b;
		this._a = a;
	}

	toString() {
		return this._a === 255
			? `rgb(${this._r}, ${this._g}, ${this._b})`
			: `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a / 255})`;
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
}

Array.prototype.minBy = function <T>(this: T[], by: (element: T) => number): T {
	let min = this[0];

	for (const element of this) if (by(element) < by(min)) min = element;

	return min;
};

export function GetIntersectPoint(
	line0: Line,
	line1: Line
): { x: number; y: number } | undefined {
	const v = line0.X1 - line0.X0;
	const w = line0.Y1 - line0.Y0;
	const v2 = line1.X1 - line1.X0;
	const w2 = line1.Y1 - line1.Y0;

	const t2 =
		(-w * line1.X0 + w * line0.X0 + v * line1.Y0 - v * line0.Y0) /
		(w * v2 - v * w2);
	const t = (line1.X0 - line0.X0 + v2 * t2) / v;

	if (t < 0 || t > 1 || t2 < 0 || t2 > 1) return undefined;
	else return { x: line1.X0 + v2 * t2, y: line1.Y0 + w2 * t2 };
}

export function GetIntersectPointWithRectangle(
	line: Line,
	rectangle: Rectangle
): { x: number; y: number } | undefined {
	const result: { x: number; y: number }[] = [];

	const top = GetIntersectPoint(
		line,
		new Line(
			rectangle.X,
			rectangle.Y + rectangle.Height,
			rectangle.X + rectangle.Width,
			rectangle.Y + rectangle.Height
		)
	);
	const right = GetIntersectPoint(
		line,
		new Line(
			rectangle.X + rectangle.Width,
			rectangle.Y,
			rectangle.X + rectangle.Width,
			rectangle.Y + rectangle.Height
		)
	);
	const bottom = GetIntersectPoint(
		line,
		new Line(
			rectangle.X,
			rectangle.Y,
			rectangle.X + rectangle.Width,
			rectangle.Y
		)
	);
	const left = GetIntersectPoint(
		line,
		new Line(
			rectangle.X,
			rectangle.Y,
			rectangle.X,
			rectangle.Y + rectangle.Height
		)
	);

	// console.log("/////////////////");
	if (top !== undefined) {
		// console.log(`TOP: ${top.x}, ${top.y} => ${top.x ** 2 + top.y ** 2}`);
		result.push(top);
	}
	if (right !== undefined) {
		// console.log(
		// 	`RIGHT: ${right.x}, ${right.y} => ${right.x ** 2 + right.y ** 2}`
		// );
		result.push(right);
	}
	if (bottom !== undefined) {
		// console.log(
		// 	`BOTTOM: ${bottom.x}, ${bottom.y} => ${
		// 		bottom.x ** 2 + bottom.y ** 2
		// 	}`
		// );
		result.push(bottom);
	}
	if (left !== undefined) {
		// console.log(
		// 	`LEFT: ${left.x}, ${left.y} => ${left.x ** 2 + left.y ** 2}`
		// );
		result.push(left);
	}

	result.sort(
		(a, b) =>
			(a.x - line.X0) ** 2 +
			(a.y - line.Y0) ** 2 -
			((b.x - line.X0) ** 2 + (b.y - line.Y0) ** 2)
	);

	return result[0];
}
