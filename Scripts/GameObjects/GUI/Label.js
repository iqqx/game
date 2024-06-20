import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";
export class Label extends GameObject {
    _size;
    _text;
    _color;
    constructor(text, x, y, width, height, size = 12, color = Color.White) {
        super(width, height);
        this._text = text;
        this._x = x;
        this._y = y;
        this._color = color;
        this._size = size;
    }
    Render() {
        GUI.SetFillColor(this._color);
        GUI.SetFont(this._size);
        GUI.DrawTextCenter(this._text, this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
    }
}
//# sourceMappingURL=Label.js.map