import { Container } from "../Assets/Containers/Containers.js";
import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
import { Color } from "../Utilites.js";
export class Corpse extends Container {
    constructor(x, y, ...items) {
        super(100, 50, 3, 1);
        this._x = x;
        this._y = y;
        for (const item of items)
            this.TryPushItem(item);
    }
    Render() {
        Canvas.SetFillColor(new Color(0, 0, 255));
        Canvas.DrawRectangle(this._x - Scene.Current.GetLevelPosition(), this._y, 100, 50);
    }
}
