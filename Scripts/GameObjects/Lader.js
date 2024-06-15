import { Scene } from "../Scene.js";
import { Canvas } from "../Context.js";
import { Color, GameObject } from "../Utilites.js";
export class Platform extends GameObject {
    constructor(x, y, height) {
        super(25, height);
        this._x = x;
        this._y = y;
    }
    Render() {
        Canvas.SetFillColor(new Color(100, 50, 50, 100));
        Canvas.DrawRectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height);
    }
}
