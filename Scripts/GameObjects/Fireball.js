import { Canvas } from "../Context.js";
import { GetSprite } from "../AssetsLoader.js";
import { Rectangle } from "../Utilites.js";
import { GameObject } from "./GameObject.js";
export class Fireball extends GameObject {
    _frames = GetSprite("Fireball");
    _angle;
    _lifetime = 80;
    _frameNumber;
    constructor(position, angle) {
        super(length, 2);
        this._x = position.X;
        this._y = position.Y;
        this._angle = angle;
        this._frameNumber = Math.floor(Math.random() * this._frames.length) % this._frames.length;
    }
    Update(dt) {
        this._lifetime -= dt;
        if (this._lifetime <= 0)
            this.Destroy();
    }
    Render() {
        const frame = this._frames[this._frameNumber];
        Canvas.DrawImageWithAngle(frame, new Rectangle(this._x, this._y, frame.ScaledSize.X, frame.ScaledSize.Y), this._angle, 0, frame.ScaledSize.Y * 0.5);
    }
}
//# sourceMappingURL=Fireball.js.map