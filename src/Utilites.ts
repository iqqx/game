import { Direction, EnemyType } from "./Enums.js";
import { GameObject } from "./GameObjects/GameObject.js";

declare global {
	interface Array<T> {
		minBy(by: (element: T) => number): T;
		clear(): void;
	}

	interface Math {
		clamp(n: number, min: number, max: number): number;
	}
}

export interface IItem {
	readonly Id: string;
	readonly Icon: Sprite;
	readonly IsBig: boolean;
	readonly MaxStack: number;
	Update(dt: number, position: Vector2, angle: number, direction: Direction): void;
	// Use(callback: () => void): void;
	Render(): void;
	// IsUsing(): boolean;
	GetCount(): number;
	/**
	 * @returns Изьятое количество, может быть меньше изымаемого
	 * @param count
	 */
	Take(count: number): number;
	Add(count: number): number;
	Is(item: IItem): item is IItem;
	Clone(): IItem;
}

Array.prototype.minBy = function <T>(this: T[], by: (element: T) => number): T {
	let min = this[0];

	for (const element of this) if (by(element) < by(min)) min = element;

	return min;
};

Array.prototype.clear = function <T>(this: T[]): void {
	this.length = 0;
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

	public static readonly White = new Color(255, 255, 255);
	public static readonly Black = new Color(0, 0, 0);
	public static readonly Red = new Color(255, 0, 0);
	public static readonly Green = new Color(0, 255, 0);
	public static readonly Yellow = new Color(255, 255, 0);
	public static readonly Pink = new Color(255, 0, 255);
	public static readonly Transparent = new Color(0, 0, 0, 0);

	constructor(r: number, g: number, b: number, a = 255) {
		this.R = r;
		this.G = g;
		this.B = b;
		this.A = a;
	}

	toString() {
		return this.A === 255 ? `rgb(${this.R}, ${this.G}, ${this.B})` : `rgba(${this.R}, ${this.G}, ${this.B}, ${this.A / 255})`;
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

export function GetIntersectPoint(line0: Line, line1: Line): Vector2 | undefined {
	const denominator = (line1.Y1 - line1.Y0) * (line0.X0 - line0.X1) - (line1.X1 - line1.X0) * (line0.Y0 - line0.Y1);

	if (denominator == 0) {
		//   if ((x1 * y2 - x2 * y1) * (x4 - x3) - (x3 * y4 - x4 * y3) * (x2 - x1) == 0 && (x1 * y2 - x2 * y1) * (y4 - y3) - (x3 * y4 - x4 * y3) * (y2 - y1) == 0)
		//     System.Console.WriteLine("Отрезки пересекаются (совпадают)");
		//   else
		//     System.Console.WriteLine("Отрезки не пересекаются (параллельны)");

		return undefined;
	} else {
		const numerator_a = (line1.X1 - line0.X1) * (line1.Y1 - line1.Y0) - (line1.X1 - line1.X0) * (line1.Y1 - line0.Y1);
		const numerator_b = (line0.X0 - line0.X1) * (line1.Y1 - line0.Y1) - (line1.X1 - line0.X1) * (line0.Y0 - line0.Y1);
		const Ua = numerator_a / denominator;
		const Ub = numerator_b / denominator;

		if (Ua >= 0 && Ua <= 1 && Ub >= 0 && Ub <= 1) return new Vector2(line1.X0 * Ub + line1.X1 * (1 - Ub), line1.Y0 * Ub + line1.Y1 * (1 - Ub));
		else return undefined;
	}
}

export function SquareMagnitude(x0: number, y0: number, x1: number, y1: number): number {
	return (x0 - x1) ** 2 + (y0 - y1) ** 2;
}

export class Vector2 {
	public readonly X: number;
	public readonly Y: number;

	public static readonly Down = new Vector2(0, -1);
	public static readonly Zero = new Vector2(0, 0);

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

	public static Length(a: Vector2, b: Vector2) {
		return Math.sqrt((a.X - b.X) ** 2 + (a.Y - b.Y) ** 2);
	}

	public static Sub(a: Vector2, b: Vector2) {
		return new Vector2(a.X - b.X, a.Y - b.Y);
	}

	public static Add(a: Vector2, b: Vector2) {
		return new Vector2(a.X + b.X, a.Y + b.Y);
	}

	public static Mul(a: Vector2, b: number) {
		return new Vector2(a.X * b, a.Y * b);
	}

	public static Div(a: Vector2, b: number) {
		return new Vector2(a.X / b, a.Y / b);
	}
}

export type RaycastHit = {
	instance: GameObject;
	position: Vector2;
	Normal: Vector2;
	start?: Vector2;
	end?: Vector2;
};

export type Sprite = {
	readonly Image: HTMLImageElement;
	readonly BoundingBox: Rectangle;
	readonly ScaledSize: Vector2;
	readonly Scale: number;
};

declare global {
	interface MouseEvent {
		sourceCapabilities: { firesTouchEvents: boolean };
	}
}

export type Sound = {
	PlayOriginal: () => void;
	Play: (volume?: number, speed?: number) => void;
	Apply: () => void;
	IsPlayingOriginal: () => boolean;
	StopOriginal: () => void;
	Speed: number;
	Volume: number;
	Length: number;
};

export function GetEnemyTypeName(enemyType: EnemyType) {
	switch (enemyType) {
		case EnemyType.Rat:
			return "Крыса";
		case EnemyType.Yellow:
			return "Боец ВДНХ";
		case EnemyType.Red:
			return "Боец Ганза";
		case EnemyType.Green:
			return "Боец Ордена";
	}
}

export function CompareStrings(a: string, b: string): number {
	let result = -5 * Math.abs(a.length - b.length);

	const m = a.length > b.length ? b : a;

	for (let i = 0; i < m.length; i++) {
		if (a[i] === b[i]) result += 10;
		else if (a[i].toLowerCase() === b[i].toLowerCase()) result += 5;
	}

	return result;
}

export function GetMaxIdentityString(text: string, variants: string[]) {
	let result = variants[0];
	let last = Number.MIN_SAFE_INTEGER;

	for (const variant of variants) {
		const c = CompareStrings(text, variant);

		if (c > last) {
			last = c;
			result = variant;
		}
	}

	return result;
}

export function IsString(obj: any): obj is string {
	return typeof obj === "string";
}

export function IsNumber(obj: any): obj is number {
	return typeof obj === "number";
}
