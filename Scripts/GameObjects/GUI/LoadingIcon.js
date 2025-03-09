import { GetSprite } from "../../AssetsLoader.js";
import { GUI } from "../../Context.js";
import { GUIBase } from "./GUIBase.js";
export class LoadingIcon extends GUIBase {
    _icon;
    _angle = 0;
    _timeToAction;
    _actions;
    constructor(timeToAction, actions) {
        super();
        this.Width = 50;
        this.Height = 50;
        this._actions = actions;
        this._timeToAction = timeToAction;
        this._icon = GetSprite("Loading_Icon");
    }
    Update(dt) {
        this._angle += dt / 400;
        if (this._timeToAction !== undefined && this._timeToAction > 0) {
            this._timeToAction -= dt;
            if (this._timeToAction <= 0) {
                this._timeToAction = undefined;
                for (const action of this._actions) {
                    action.call(this);
                }
            }
        }
    }
    Render() {
        GUI.DrawImageWithAngle(this._icon, this.X, this.Y, this.Width, this.Height, this._angle);
    }
}
//# sourceMappingURL=LoadingIcon.js.map