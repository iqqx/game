import { GUI } from "../../Context.js";
import { GameObject } from "../GameObject.js";
export class GUIRectangle extends GameObject {
    _color;
    constructor(rect, color) {
        super(rect.Width, rect.Height);
        this._x = rect.X;
        this._y = rect.Y;
        this._color = color;
    }
    Render() {
        GUI.SetFillColor(this._color);
        GUI.ClearStroke();
        GUI.DrawRectangle(this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
    }
}
//# sourceMappingURL=GUIRectangle.js.map