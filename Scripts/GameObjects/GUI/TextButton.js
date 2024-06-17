import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { Button } from "./Button.js";
export class TextButton extends Button {
    _text;
    _size;
    constructor(x, y, width, height, text, size) {
        super(x, y, width, height);
        this._text = text;
        this._size = size;
    }
    Render() {
        super.Render();
        GUI.SetFillColor(Color.White);
        GUI.SetFont(this._size);
        GUI.DrawTextCenter(this._text, this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
    }
}
