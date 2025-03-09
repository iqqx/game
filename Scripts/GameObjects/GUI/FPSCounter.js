import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";
export class FPSCounter extends GUIBase {
    _delta = 0;
    constructor() {
        super();
        this.Width = 40;
        this.Height = 20;
    }
    Update(dt) {
        this._delta = dt;
    }
    Render() {
        GUI.ClearStroke();
        GUI.SetFillColor(Color.Green);
        GUI.DrawRectangle(this.X, 0, this.Width, this.Height);
        GUI.SetFillColor(Color.White);
        GUI.SetFont(12);
        GUI.DrawTextCenter((1000 / this._delta).toFixed(1), this.X, this.Y, this.Width, this.Height);
    }
}
//# sourceMappingURL=FPSCounter.js.map