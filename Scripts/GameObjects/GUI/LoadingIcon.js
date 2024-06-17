import { GUI } from "../../Context.js";
import { GetSprite } from "../../Game.js";
import { GUIBase } from "./GUIBase.js";
export class LoadingIcon extends GUIBase {
    _icon;
    _angle = 0;
    _timeToAction;
    _action;
    constructor(x, y, timeToAction, action) {
        super(50, 50);
        this._x = x;
        this._y = y;
        this._action = action;
        this._timeToAction = timeToAction;
        this._icon = GetSprite("Loading_Icon");
    }
    Update(dt) {
        this._angle += dt / 400;
        if (this._timeToAction !== undefined && this._timeToAction > 0) {
            this._timeToAction -= dt;
            if (this._timeToAction <= 0) {
                this._timeToAction = undefined;
                this._action();
            }
        }
    }
    Render() {
        GUI.DrawImageWithAngle(this._icon, this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height, this._angle);
    }
}
