import { Direction, EnemyType, PointerActionState } from "./Enums.js";
import { GameObject } from "./GameObjects/GameObject.js";

declare global {
	interface Array<T> {
		minBy(by: (element: T) => number): T;
		tryRemove(predicate: (element: T) => boolean): boolean;
		clear(): void;
	}

	interface Math {
		clamp(n: number, min: number, max: number): number;
	}
}

export interface IItem {
	readonly Id: string;
	readonly Name: string;
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
	/**
	 *
	 * @param item
	 * @returns Был ли опустошен добавляемый стак
	 */
	AddItem(item: IItem): boolean;
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

Array.prototype.tryRemove = function <T>(this: T[], predicate: (element: T) => boolean): boolean {
	for (let i = 0; i < this.length; ++i) {
		if (predicate(this[i])) {
			this.splice(i, 1);

			return true;
		}
	}

	return false;
};

Math.clamp = function (n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max);
};

export function Lerp(start: number, end: number, t: number) {
	return start * (1 - t) + end * t;
}

export type PointerState = {
	/**
	 * Смартфон: индекс косания \
	 * Мышь: индекс кнопки (Левая - 1, Средняя - 2, Правая - 3)
	 */
	Id: number;
	X: number;
	Y: number;
	State: PointerActionState;
	Shift: boolean;
	Control: boolean;
	Alt: boolean;
};

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
	public static readonly Blue = new Color(0, 0, 255);
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
	PlayOriginal: (volume?: number, speed?: number, looped?: boolean) => void;
	Play: (volume?: number, speed?: number, looped?: boolean) => void;
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

var a_table =
	"00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
var b_table = a_table.split(" ").map(function (s) {
	return parseInt(s, 16);
});
export function CRC32(str: string) {
	var crc = -1;
	for (var i = 0, iTop = str.length; i < iTop; ++i) {
		crc = (crc >>> 8) ^ b_table[(crc ^ str.charCodeAt(i)) & 0xff];
	}
	return (crc ^ -1) >>> 0;
}

export function IsMobile() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Mobile|Silk|Opera Mini/i.test(navigator.userAgent);
}
