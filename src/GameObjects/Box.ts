import { Item } from "../Assets/Items/Item.js";
import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
import { Color, GameObject } from "../Utilites.js";

export class Box extends GameObject {
	private readonly _items: (Item | null)[][] = [
		[null, null, null],
		[null, null, null],
		[null, null, null],
	];

	constructor(x: number, y: number, ...items: { item: Item; Chance: number }[]) {
		super(100, 100);

		this._x = x;
		this._y = y;

		var added = 0;
		for (const item of items) {
			if (added >= 9) break;

			var nextCellX = Math.round(Math.random() * 2);
			var nextCellY = Math.round(Math.random() * 2);

			while (this._items[nextCellY][nextCellX] !== null) {
				nextCellX = Math.round(Math.random() * 2);
				nextCellY = Math.round(Math.random() * 2);
			}

			if (Math.random() <= item.Chance) {
				this._items[nextCellY][nextCellX] = item.item;
				added++;
			}
		}
	}

	override Render(): void {
		Canvas.SetFillColor(new Color(0, 255, 0));
		Canvas.DrawRectangle(this._x - Scene.Current.GetLevelPosition(), this._y, 100, 100);
	}

	public GetItemAt(x: 0 | 1 | 2, y: 0 | 1 | 2): Item | null {
		return this._items[y][x];
	}

	public TakeItemFrom(x: 0 | 1 | 2, y: 0 | 1 | 2): Item | null {
		if (this._items[y][x] === null) return null;

		const item = this._items[y][x];
		this._items[y][x] = null;

		return item;
	}

	public TryPushItemTo(x: 0 | 1 | 2, y: 0 | 1 | 2, item: Item): boolean {
		if (this._items[y][x] !== null) return false;

		this._items[y][x] = item;

		return true;
	}

	public TryPushItem(item: Item): boolean {
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				if ((this._items[y][x] = null)) {
					this._items[y][x] = item;

					return true;
				}
			}
		}

		return false;
	}
}
