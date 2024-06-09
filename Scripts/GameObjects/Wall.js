import { Rectangle, Color, GameObject } from "../Utilites.js";
import { Tag } from "../Enums.js";
import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
export class Wall extends GameObject {
    constructor(x, y, width, height) {
        super(width, height);
        this.Tag = Tag.Platform;
        this._x = x;
        this._y = y;
        this._collider = new Rectangle(0, 0, width, height);
    }
    Render() {
        Canvas.SetFillColor(Color.Black);
        Canvas.DrawRectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._width, this._height);
    }
}
