import { GUI } from "../../Context.js";
import { Color, Vector2 } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";
export class GUISpotLight extends GUIBase {
    _dots = [];
    _timeToNextSpawn = 1000;
    constructor() {
        super(100, 100);
    }
    Update(dt) {
        if (this._timeToNextSpawn > 0) {
            this._timeToNextSpawn -= dt;
            if (this._timeToNextSpawn <= 0) {
                this._timeToNextSpawn = 1000;
                this._dots.push({ Position: new Vector2(Math.random() * GUI.Width, Math.random() * GUI.Height), lifeTime: 0 });
            }
        }
        for (const dot of this._dots) {
            dot.lifeTime += dt;
            if (dot.lifeTime > 3000)
                this._dots.splice(this._dots.indexOf(dot), 1);
        }
    }
    Render() {
        for (const dot of this._dots)
            GUI.DrawCircleWithGradient(dot.Position.X, dot.Position.Y, 1000, new Color(255, 255, 255, 25 * Math.sin(Math.PI * (dot.lifeTime / 3000))), Color.Transparent);
    }
}
//# sourceMappingURL=GUISpotLight.js.map