import { GUI } from "../../Context.js";
import { Scene } from "../../Scene.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";
export class HintLabel extends GameObject {
    _text;
    constructor(text, x, y) {
        super(500, 0);
        this._text = text;
        this._x = x;
        this._y = y;
    }
    Render() {
        GUI.SetFillColor(new Color(255, 255, 255, 100 + (Math.sin(Scene.Time / 500) + 1) * 20));
        GUI.SetFont(12);
        GUI.DrawTextCenter(this._text, this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
    }
}
//# sourceMappingURL=HintLabel.js.map