import { Interactable } from "../../GameObjects/GameObject.js";
import { Scene } from "../../Scene.js";
import { Vector2 } from "../../Utilites.js";
export class Container extends Interactable {
    _items;
    SlotsSize;
    constructor(width, height, slotsWidth, slotsHeight) {
        super(width, height);
        this._items = new Array(slotsHeight);
        for (let y = 0; y < slotsHeight; y++) {
            this._items[y] = new Array(slotsWidth);
            for (let x = 0; x < slotsWidth; x++)
                this._items[y][x] = null;
        }
        this.SlotsSize = new Vector2(slotsWidth, slotsHeight);
    }
    GetInteractives() {
        return ["открыть"];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    OnInteractSelected(id) {
        Scene.Player.OpenContainer(this);
    }
    GetItemAt(x, y) {
        return this._items[y][x];
    }
    TakeItemFrom(x, y) {
        if (this._items[y][x] === null)
            return null;
        const item = this._items[y][x];
        this._items[y][x] = null;
        return item;
    }
    SwapItem(x, y, item) {
        const existItem = this._items[y][x];
        this._items[y][x] = item;
        return existItem;
    }
    TryPushItem(item) {
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
    CellInContainer(x, y) {
        return x >= 0 && y >= 0 && x < this.SlotsSize.X && y < this.SlotsSize.Y;
    }
}
//# sourceMappingURL=Containers.js.map