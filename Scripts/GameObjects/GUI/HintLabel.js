import { GUI } from "../../Context.js";
import { Scene } from "../../Scene.js";
import { Color } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";
export class HintLabel extends GUIBase {
    _text;
    _size;
    constructor(text, fontSize) {
        super();
        this._text = text;
        this._size = fontSize;
        GUI.SetFont(fontSize);
        this.Width = GUI.GetTextSize(text, true).X;
        this.Height = GUI.GetTextSize(text, true).Y;
    }
    Update(dt) { }
    Render() {
        GUI.SetFillColor(new Color(255, 255, 255, 100 + (Math.sin(Scene.Time / 500) + 1) * 20));
        GUI.SetFont(this._size);
        GUI.DrawText(this.X, this.Y, this._text);
    }
}
//# sourceMappingURL=HintLabel.js.map