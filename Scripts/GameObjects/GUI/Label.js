import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";
export class Label extends GameObject {
    _text;
    _color;
    constructor(text, x, y, width, height, color = Color.White) {
        super(width, height);
        this._text = text;
        this._x = x;
        this._y = y;
        this._color = color;
    }
    Render() {
        GUI.SetFillColor(this._color);
        GUI.SetFont(36);
        GUI.DrawTextCenter(this._text, this._x, this._y, this.Width, this.Height);
    }
}
