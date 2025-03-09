import { Canvas, GUI } from "../../Context.js";
import { Color, IsMobile } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";
export class PressedIndicator extends GUIBase {
    _delay;
    _pressed = false;
    _pressedTime = 0;
    _deadlineTime;
    _actions;
    _onkeyDown;
    _onkeyUp;
    constructor(key, delay, deadline, actions) {
        super();
        this._actions = actions;
        this._delay = delay;
        this._deadlineTime = deadline;
        this.Width = this.Height = 20;
        if (IsMobile()) {
        }
        else {
            this._onkeyDown = (e) => {
                if (e.code === key && this._pressed === false) {
                    this._pressed = true;
                    this._pressedTime = 0;
                }
            };
            this._onkeyUp = (e) => {
                if (e.code === key) {
                    this._pressed = false;
                    this._pressedTime = 0;
                }
            };
            Canvas.HTML.addEventListener("keydown", this._onkeyDown);
            Canvas.HTML.addEventListener("keyup", this._onkeyUp);
        }
    }
    Update(dt) {
        this._deadlineTime -= dt;
        if (this._deadlineTime <= 0)
            for (const action of this._actions) {
                action.call(this);
            }
        else if (this._pressed) {
            this._pressedTime += dt;
            if (this._pressedTime >= this._delay) {
                for (const action of this._actions) {
                    action.call(this);
                }
            }
        }
    }
    Render() {
        GUI.SetFillColor(Color.White);
        GUI.DrawSector(this.X - this.Width, this.Y - this.Height * 0.25, this.Width * 0.5, Math.PI * 2 * (this._pressedTime / this._delay));
    }
    OnDestroy() {
        Canvas.HTML.removeEventListener("keydown", this._onkeyDown);
        Canvas.HTML.removeEventListener("keyup", this._onkeyUp);
    }
}
//# sourceMappingURL=PressedIndicator.js.map