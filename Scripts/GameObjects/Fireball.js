import { Canvas } from "../Context.js";
import { GetSprite } from "../Game.js";
import { Scene } from "../Scene.js";
import { Rectangle, Vector2 } from "../Utilites.js";
import { GameObject } from "./GameObject.js";
export class Fireball extends GameObject {
    _frames = GetSprite("Fireball");
    _angle;
    _offset;
    _lifetime = 100;
    constructor(x, y, angle, offset) {
        super(length, 2);
        this._x = x;
        this._y = y;
        this._angle = angle;
        this._offset = this._angle < Math.PI / -2 || this._angle > Math.PI / 2 ? new Vector2(-offset.X, -offset.Y) : offset;
    }
    Update(dt) {
        this._lifetime -= dt;
        if (this._lifetime <= 0)
            this.Destroy();
    }
    Render() {
        Canvas.DrawImageWithAngle(this._frames[Math.floor(3 * Math.max(0, this._lifetime / 100))], new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, 100, 50), this._angle, 0, 50 / 2 - this._offset.Y);
    }
}
//# sourceMappingURL=Fireball.js.map