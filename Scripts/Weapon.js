import { Canvas } from "./Context.js";
import { Tag } from "./Enums.js";
import { Bullet } from "./GameObjects/Bullet.js";
import { Enemy } from "./GameObjects/Enemies/Enemy.js";
import { Fireball } from "./GameObjects/Fireball.js";
import { Scene } from "./Scene.js";
import { Rectangle, Vector2 } from "./Utilites.js";
export class Weapon {
    _image;
    _fireSound;
    _fireCooldown;
    _damage;
    _spread;
    _position = Vector2.Zero;
    _angle = 0;
    _secondsToCooldown = 0;
    constructor(image, fireSound, fireCooldown, damage, spread) {
        this._image = image;
        this._fireSound = fireSound;
        this._fireCooldown = fireCooldown;
        this._damage = damage;
        this._spread = spread;
    }
    Update(dt, position, angle) {
        this._position = position;
        this._angle = angle;
        this._secondsToCooldown -= dt;
    }
    Render() {
        if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
            Canvas.DrawImageWithAngleVFlipped(this._image, new Rectangle(this._position.X -
                Scene.Current.GetLevelPosition(), this._position.Y, 52 * 3.125, 16 * 3.125), this._angle, -12, 16 * 2.4);
        else
            Canvas.DrawImageWithAngle(this._image, new Rectangle(this._position.X -
                Scene.Current.GetLevelPosition(), this._position.Y, 52 * 3.125, 16 * 3.125), this._angle, -12, 16 * 2.4);
    }
    TryShoot() {
        if (this._secondsToCooldown > 0)
            return false;
        this._secondsToCooldown = this._fireCooldown;
        const dir = this._angle - (Math.random() - 0.5) * this._spread;
        const hits = Scene.Current.Raycast(this._position, new Vector2(Math.cos(dir), -Math.sin(dir)), 1500, Tag.Enemy | Tag.Wall);
        const hit = hits === undefined ? undefined : hits[0];
        if (hit !== undefined && hit.instance instanceof Enemy)
            hit.instance.TakeDamage(this._damage);
        Scene.Current.Instantiate(new Bullet(this._position.X + Math.cos(dir) * 200, this._position.Y - Math.sin(dir) * 200, hit === undefined
            ? 2000
            : Math.min(Math.sqrt((this._position.X -
                hit.position.X +
                Math.cos(dir) * 200) **
                2 +
                (this._position.Y -
                    hit.position.Y -
                    Math.sin(dir) * 200) **
                    2), 2000), dir));
        Scene.Current.Instantiate(new Fireball(this._position.X + Math.cos(this._angle) * 150, this._position.Y - Math.sin(this._angle) * 150, this._angle));
        this._fireSound.Play(0.5);
        return true;
    }
}
