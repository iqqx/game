import { Scene } from "../Scene.js";
import { Canvas } from "../Context.js";
import { Color, Rectangle } from "../Utilites.js";
import { GameObject } from "./GameObject.js";
export class Bullet extends GameObject {
    static _bulletColor0 = new Color(255, 255, 255, 5);
    static _bulletColor1 = new Color(255, 255, 255, 50);
    static _maxLifetime = 200;
    _length;
    _angle;
    _lifetime = 0;
    constructor(x, y, length, angle) {
        super(length, 2);
        this._x = x;
        this._y = y;
        this._length = length;
        this._angle = angle;
    }
    Update(dt) {
        this._lifetime += dt;
        if (this._lifetime >= Bullet._maxLifetime)
            this.Destroy();
    }
    Render() {
        Canvas.DrawRectangleWithGradientAndAngle(new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._length, 2), [this._lifetime / Bullet._maxLifetime, Bullet._bulletColor0], [1, Bullet._bulletColor1], this._angle, 0, 1);
    }
}
//# sourceMappingURL=Bullet.js.map