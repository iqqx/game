import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";
export class FPSCounter extends GameObject {
    _delta = 0;
    constructor() {
        super(40, 20);
    }
    Update(dt) {
        this._delta = dt;
    }
    Render() {
        GUI.ClearStroke();
        GUI.SetFillColor(Color.Green);
        GUI.DrawRectangle(GUI.Width - this.Width, 0, this.Width, this.Height);
        GUI.SetFillColor(Color.White);
        GUI.SetFont(12);
        GUI.DrawTextCenter((1000 / this._delta).toFixed(1), GUI.Width - this.Width, 0, this.Width, this.Height);
    }
}
//# sourceMappingURL=FPSCounter.js.map