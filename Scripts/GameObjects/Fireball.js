import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";
import { Rectangle, LoadImage, Vector2 } from "../Utilites.js";
import { GameObject } from "./GameObject.js";
export class Fireball extends GameObject {
    static _frames = [
        LoadImage("Images/Player/Fireball/2.png", new Rectangle(8, 8, 6, 10)),
        LoadImage("Images/Player/Fireball/1.png", new Rectangle(8, 9, 15, 10)),
        LoadImage("Images/Player/Fireball/0.png", new Rectangle(8, 10, 7, 8)),
    ];
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
        Canvas.DrawImageWithAngle(Fireball._frames[Math.floor(3 * Math.max(0, this._lifetime / 100))], new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, 50, 25), this._angle, 0, 25 / 2 - this._offset.Y);
    }
}
