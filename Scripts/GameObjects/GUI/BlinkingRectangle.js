import { GUI } from "../../Context.js";
import { GameObject } from "../GameObject.js";
export class BlinkingRectangle extends GameObject {
    _colorOff;
    _colorOn;
    _cooldown;
    _timeToBlink = 0;
    _on = false;
    constructor(rect, colorOff, colorOn, cooldown) {
        super(rect.Width, rect.Height);
        this._x = rect.X;
        this._y = rect.Y;
        this._colorOff = colorOff;
        this._colorOn = colorOn;
        this._cooldown = cooldown;
    }
    Update(dt) {
        this._timeToBlink -= dt;
        if (this._timeToBlink <= 0) {
            this._timeToBlink = this._cooldown;
            this._on = !this._on;
        }
    }
    Render() {
        GUI.SetFillColor(this._on ? this._colorOn : this._colorOff);
        GUI.ClearStroke();
        GUI.DrawRectangle(this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
    }
}
