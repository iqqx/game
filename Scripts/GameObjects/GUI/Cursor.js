import { Canvas, GUI } from "../../Context.js";
import { Color, IsMobile } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";
export class Cursor extends GUIBase {
    _radius;
    _onMouseMove;
    constructor(radius = 2) {
        super();
        if (IsMobile())
            this._radius = 0;
        else {
            this._radius = radius;
            this._onMouseMove = (e) => {
                this.X = e.x;
                this.Y = e.y;
            };
            Canvas.HTML.addEventListener("mousemove", this._onMouseMove);
        }
    }
    Update(dt) { }
    Render() {
        GUI.SetFillColor(Color.White);
        GUI.ClearStroke();
        GUI.DrawCircle(this.X, this.Y, this._radius);
    }
    OnDestroy() {
        Canvas.HTML.removeEventListener("mousemove", this._onMouseMove);
    }
}
//# sourceMappingURL=Cursor.js.map