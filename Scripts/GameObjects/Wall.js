import { Rectangle } from "../Utilites.js";
import { Tag } from "../Enums.js";
import { GameObject } from "./GameObject.js";
export class Wall extends GameObject {
    constructor(x, y, width, height) {
        super(width, height);
        this.Tag = Tag.Wall;
        this._x = x;
        this._y = y;
        this._collider = new Rectangle(0, 0, width, height);
    }
    Render() {
        // Canvas.SetFillColor(new Color(255, 255, 0, 100));
        // Canvas.DrawRectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._width, this._height);
    }
}
