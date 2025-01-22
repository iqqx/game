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
        GUI.DrawTextCenterLineBreaked(this._x, this._y, this._text.split("\n"));
    }
}
//# sourceMappingURL=Label.js.map