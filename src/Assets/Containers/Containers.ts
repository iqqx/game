import { Interactable } from "../../GameObjects/GameObject.js";
import { Scene } from "../../Scenes/Scene.js";
import { IItem, Vector2 } from "../../Utilites.js";

export class Container extends Interactable {
	protected readonly _items: (IItem | null)[][];
	public readonly SlotsSize: Vector2;

	constructor(width: number, height: number, slotsWidth: number, slotsHeight: number) {
		super(width, height);

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
		Scene.Current.Player.OpenContainer(this);
	}

	public GetItemAt(x: number, y: number): IItem | null {
		return this._items[y][x];
	}

	public TakeItemFrom(x: number, y: number): IItem | null {
		if (this._items[y][x] === null) return null;

		const item = this._items[y][x];
		this._items[y][x] = null;

		return item;
	}

	public RemoveItem(itemId: string, count: number) {
		for (let y = 0; y < this.SlotsSize.Y; y++) {
			for (let x = 0; x < this.SlotsSize.X; x++) {
				if (this._items[y][x] !== null && this._items[y][x].Id === itemId) {
					count -= this._items[y][x].Take(count);

					if (this._items[y][x].GetCount() <= 0) this._items[y][x] = null;

					if (count <= 0) break;
				}
			}
		}
	}

	public SwapItem(x: number, y: number, item: IItem): IItem | null {
		const existItem = this._items[y][x];

		this._items[y][x] = item;

		return existItem;
	}

	public TryPushItem(item: IItem): boolean {
		for (let y = 0; y < this.SlotsSize.Y; y++) {
			for (let x = 0; x < this.SlotsSize.X; x++) {
				const slot = this._items[y][x];

				if (slot === null) {
					this._items[y][x] = item;

					return true;
				} else if (slot.Id === item.Id && slot.GetCount() < slot.MaxStack) {
					if (!slot.AddItem(item)) return this.TryPushItem(item);
					else return true;
				}
			}
		}

		return false;
	}

	public CellInContainer(x: number, y: number) {
		return x >= 0 && y >= 0 && x < this.SlotsSize.X && y < this.SlotsSize.Y;
	}
}
