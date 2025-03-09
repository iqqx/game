import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";
export class BlinkingLabel extends GameObject {
    _text;
    _errorText;
    _colorOff;
    _colorOn;
    _cooldown;
    _timeToBlink = 0;
    _on = false;
    constructor(text, errorText, x, y, width, height, colorOff, colorOn, cooldown) {
        super(width, height);
        this._text = text;
        this._x = x;
        this._y = y;
        this._colorOff = colorOff;
        this._colorOn = colorOn;
        this._cooldown = cooldown;
        this._errorText = errorText;
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
        GUI.SetFont(32);
        GUI.DrawText2CenterLineBreaked(this._x, this._y, this._text);
        GUI.SetFillColor(Color.Red);
        GUI.SetFont(24);
        GUI.DrawText2CenterLineBreaked(this._x, this._y + 200, this._errorText);
    }
}
//# sourceMappingURL=BlinkingLabel.js.map