import { Enemy } from "./Enemies/Enemy";

export function Clamp(n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max);
}

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

	if (
		t < 0 ||
		t > 1 ||
		t2 < 0 ||
		t2 > 1 ||
		Number.isNaN(t2) ||
		Number.isNaN(t)
	)
		return undefined;
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

	if (result.length === 0) return undefined;

	result.sort(
		(a, b) =>
			(a.x - line.X0) ** 2 +
			(a.y - line.Y0) ** 2 -
			((b.x - line.X0) ** 2 + (b.y - line.Y0) ** 2)
	);

	return result[0];
}

export function GetNearestIntersectWithRectangles(
	line: Line,
	rectangles: Rectangle[]
): { x: number; y: number } | undefined {
	const result: { x: number; y: number }[] = [];

	for (const rectangle of rectangles) {
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

		if (top !== undefined) result.push(top);
		if (right !== undefined) result.push(right);
		if (bottom !== undefined) result.push(bottom);
		if (left !== undefined) result.push(left);
	}

	return result.length === 0 ? undefined : result.minBy(	(a) =>
		(a.x - line.X0) ** 2 +
		(a.y - line.Y0) ** 2);
}

export function GetNearestIntersectWithEnemies(
	line: Line,
	enemies: Enemy[]
): {enemy: Enemy, x: number; y: number } | undefined {
	const result: {enemy: Enemy, x: number; y: number }[] = [];

	for (const enemy of enemies) {
		const rectangle = enemy.GetRectangle();

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

		if (top !== undefined) result.push({...top, enemy: enemy});
		if (right !== undefined) result.push({...right, enemy: enemy});
		if (bottom !== undefined) result.push({...bottom, enemy: enemy});
		if (left !== undefined) result.push({...left, enemy: enemy});
	}

	return result.length === 0
		? undefined
		: result.minBy((a) => (a.x - line.X0) ** 2 + (a.y - line.Y0) ** 2);
}

export function SquareMagnitude(
	x0: number,
	y0: number,
	x1: number,
	y1: number
): number {
	return (x0 - x1) ** 2 + (y0 - y1) ** 2;
}
