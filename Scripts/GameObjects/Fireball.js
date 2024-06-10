import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
import { GameObject, Rectangle, LoadImage } from "../Utilites.js";
export class Fireball extends GameObject {
    static _image = LoadImage("Images/fire.png");
    static _maxLifetime = 100;
    _angle;
    _lifetime = 0;
    constructor(x, y, angle) {
        super(length, 2);
        this._x = x;
        this._y = y;
        this._angle = angle;
    }
    Update(dt) {
        this._lifetime += dt;
        if (this._lifetime >= Fireball._maxLifetime)
            this.Destroy();
    }
    Render() {
        Canvas.DrawImageWithAngle(Fireball._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, 100, 50), this._angle, 0, 25);
    }
}
