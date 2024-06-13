import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
import { Color, GameObject } from "../Utilites.js";
export class Box extends GameObject {
    _items = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ];
    constructor(x, y, ...items) {
        super(100, 100);
        this._x = x;
        this._y = y;
        var added = 0;
        for (const item of items) {
            if (added >= 9)
                break;
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
    Render() {
        Canvas.SetFillColor(new Color(0, 255, 0));
        Canvas.DrawRectangle(this._x - Scene.Current.GetLevelPosition(), this._y, 100, 100);
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
    TryPushItemTo(x, y, item) {
        if (this._items[y][x] !== null)
            return false;
        this._items[y][x] = item;
        return true;
    }
    TryPushItem(item) {
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
