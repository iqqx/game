import { Scene } from "../../Scene.js";
import { Interactable, Vector2 } from "../../Utilites.js";
import { Item } from "../Items/Item.js";

export class Container extends Interactable {
	protected readonly _items: (Item | null)[][];
	public readonly SlotsSize: Vector2;

	constructor(slotsWidth: number, slotsHeight: number) {
		super(50, 50);

		this._items = new Array(slotsHeight);
		for (let y = 0; y < slotsHeight; y++) {
			this._items[y] = new Array(slotsWidth);

			for (let x = 0; x < slotsWidth; x++) this._items[y][x] = null;
		}

		this.SlotsSize = new Vector2(slotsWidth, slotsHeight);
	}

	public GetInteractives(): string[] {
		return ["открыть"];
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public OnInteractSelected(id: number): void {
		Scene.Player.OpenContainer(this);
	}

	public GetItemAt(x: number, y: number): Item | null {
		return this._items[y][x];
	}

	public TakeItemFrom(x: number, y: number): Item | null {
		if (this._items[y][x] === null) return null;

		const item = this._items[y][x];
		this._items[y][x] = null;

		return item;
	}

	public SwapItem(x: number, y: number, item: Item): Item | null {
		const existItem = this._items[y][x];

		this._items[y][x] = item;

		return existItem;
	}

	public TryPushItem(item: Item): boolean {
		for (let y = 0; y < this.SlotsSize.Y; y++) {
			for (let x = 0; x < this.SlotsSize.X; x++) {
				if (this._items[y][x] === null) {
					this._items[y][x] = item;

					return true;
				}
			}
		}

		return false;
	}

	public CellInContainer(x: number, y: number) {
		return x >= 0 && y >= 0 && x < this.SlotsSize.X && y < this.SlotsSize.Y;
	}
}
