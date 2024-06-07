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

	constructor(x: number, y: number, width: number, height:number) {
		this.X = x;
		this.Y = y;
		this.Width = width;
		this.Height = height
	}
}

export function UnorderedRemove<T>(array: Array<T>, index: number) {
	const element = array[index];
	array[index] = array.pop()
	return element;
}