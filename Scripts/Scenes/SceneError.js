import { GUI } from "../Context.js";
import { Color } from "../Utilites.js";
export class SceneError {
    _colorOff = new Color(0, 0, 255);
    _colorOn = new Color(255, 0, 0);
    _cooldown = 1500;
    _textSize;
    _errorText;
    _timeToBlink = 0;
    _on = false;
    _time = 0;
    constructor(errorText) {
        GUI.SetFont(32);
        this._textSize = GUI.GetTextSize("КРИТИЧЕСКАЯ ОШИБКА", true);
        this._errorText = errorText;
    }
    Update(timeStamp) {
        this._timeToBlink -= timeStamp - this._time;
        this._time = timeStamp;
        if (this._timeToBlink <= 0) {
            this._timeToBlink = this._cooldown;
            this._on = !this._on;
        }
        this.Render();
    }
    Render() {
        GUI.SetFillColor(Color.Black);
        GUI.ClearStroke();
        GUI.DrawRectangle(0, 0, GUI.Width, GUI.Height);
        GUI.SetFillColor(this._on ? this._colorOn : this._colorOff);
        GUI.DrawRectangle(0, 0, GUI.Width, 10);
        GUI.DrawRectangle(0, GUI.Height - 10, GUI.Width, 10);
        GUI.DrawRectangle(0, 0, 10, GUI.Height);
        GUI.DrawRectangle(GUI.Width - 10, 0, 10, GUI.Height);
        GUI.DrawRectangle((GUI.Width - (this._textSize.X + 50)) * 0.5, 20, this._textSize.X + 50, this._textSize.Y + 20);
        GUI.SetFillColor(this._on ? this._colorOff : this._colorOn);
        GUI.SetFont(32);
        GUI.DrawText2CenterLineBreaked(GUI.Width * 0.5, 50, "КРИТИЧЕСКАЯ ОШИБКА");
        GUI.SetFillColor(Color.Red);
        GUI.SetFont(24);
        GUI.DrawText2CenterLineBreaked(GUI.Width * 0.5, 110, this._errorText);
    }
}
//# sourceMappingURL=SceneError.js.map