import { GameObject } from "./GameObjects/GameObject.js";

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
	public static readonly Yellow = new Color(255, 255, 0, 255);
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
}

export type RaycastHit = {
	instance: GameObject;
	position: Vector2;
};

export type Sprite = {
	readonly Image: HTMLImageElement;
	readonly BoundingBox: Rectangle;
	readonly ScaledSize: Vector2;
	readonly Scale: number;
};

let imagesToLoad = 100000000;
let imagesLoaded = 0;
export function IsImagesLoaded() {
	return imagesLoaded >= imagesToLoad;
}
export function SetImageCount(count: number) {
	imagesToLoad = count;
}

export function LoadImage(source: string, boundingBox?: Rectangle, scale?: number): Sprite {
	const img = new Image();

	const cte = {
		Image: img,
		BoundingBox: boundingBox,
		Scale: scale,
		ScaledSize: new Vector2(0, 0),
	};

	img.onload = () => {
		cte.Scale = scale ?? 1;
		cte.BoundingBox = boundingBox ?? new Rectangle(0, 0, img.naturalWidth, img.naturalHeight);
		cte.ScaledSize = new Vector2(cte.BoundingBox.Width * scale, cte.BoundingBox.Height * scale);

		imagesLoaded++;
	};
	img.src = source;

	return cte;
}

export function LoadSound(source: string): Sound {
	const s = new Audio(source);
	s.volume = 1;

	return {
		Speed: 1,
		Volume: 1,
		Play: function (volume?: number, speed?: number) {
			if (volume === undefined && speed === undefined) (s.cloneNode() as HTMLAudioElement).play();
			else {
				const c = s.cloneNode() as HTMLAudioElement;
				c.volume = volume ?? this.Volume;
				c.playbackRate = speed ?? this.Speed;
				c.play();
			}
		},
		Apply: function () {
			s.volume = this.Volume;
			s.playbackRate = this.Speed;
		},
		PlayOriginal: function () {
			s.play();
		},
		IsPlayingOriginal: function () {
			return !s.paused;
		},
		StopOriginal: function () {
			s.pause();
		},
	};
}

export type Sound = {
	PlayOriginal: () => void;
	Play: (volume?: number, speed?: number) => void;
	Apply: () => void;
	IsPlayingOriginal: () => boolean;
	StopOriginal: () => void;
	Speed: number;
	Volume: number;
};
