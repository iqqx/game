import { GUI } from "../../Context.js";
import { Scene } from "../../Scene.js";
import { Color } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";
export class Cursor extends GUIBase {
    _radius;
    constructor(radius = 2) {
        super(radius, radius);
        this._radius = radius;
    }
    Update() {
        const mouse = Scene.Current.GetMousePosition();
        this._x = mouse.X;
        this._y = GUI.Height - mouse.Y;
    }
    Render() {
        GUI.SetFillColor(Color.White);
        GUI.ClearStroke();
        GUI.DrawCircle(this._x, this._y, this._radius);
    }
}
