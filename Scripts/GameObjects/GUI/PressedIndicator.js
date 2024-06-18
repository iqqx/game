import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";
export class PressedIndicator extends GUIBase {
    _key;
    _delay;
    _spaceDowned = false;
    _spaceDownedTime = 0;
    constructor(x, y, key, delay) {
        super(20, 20);
        this._x = x;
        this._y = y;
        this._key = key;
        this._delay = delay;
        addEventListener("keydown", (e) => {
            if (e.code === key && this._spaceDowned === false) {
                this._spaceDowned = true;
                this._spaceDownedTime = 0;
            }
        });
        addEventListener("keyup", () => {
            this._spaceDowned = false;
            this._spaceDownedTime = 0;
        });
    }
    Update(dt) {
        if (this._spaceDowned)
            this._spaceDownedTime += dt;
    }
    Render() {
        GUI.SetFillColor(Color.White);
        GUI.DrawSector(this._x + this.Width / 2, this._y + 3, 10, Math.PI * 2 * (this._spaceDownedTime / this._delay));
    }
}
