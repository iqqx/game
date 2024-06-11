import { Canvas } from "./Context.js";
import { Tag } from "./Enums.js";
import { Bullet } from "./GameObjects/Bullet.js";
import { Enemy } from "./GameObjects/Enemies/Enemy.js";
import { Fireball } from "./GameObjects/Fireball.js";
import { Scene } from "./Scene.js";
import { Rectangle, Vector2 } from "./Utilites.js";
export class Weapon {
    Icon;
    _image;
    _fireSound;
    _fireCooldown;
    _damage;
    _spread;
    _width;
    _handOffset;
    _muzzleOffset;
    Heavy;
    Automatic;
    _position = Vector2.Zero;
    _angle = 0;
    _secondsToCooldown = 0;
    constructor(icon, image, fireSound, fireCooldown, damage, spread, heavy, auto, handOffset, muzzleOffset) {
        this.Icon = icon;
        this._image = image;
        this._fireSound = fireSound;
        this._fireCooldown = fireCooldown;
        this._damage = damage;
        this._spread = spread;
        (this._handOffset = handOffset), (this._muzzleOffset = muzzleOffset);
        this.Heavy = heavy;
        this.Automatic = auto;
        this._width = 30 * (this._image.BoundingBox.Width / this._image.BoundingBox.Height);
    }
    Update(dt, position, angle) {
        this._position = position;
        this._angle = angle;
        this._secondsToCooldown -= dt;
    }
    Render() {
        if (this.Heavy) {
            if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
                Canvas.DrawImageWithAngleVFlipped(this._image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this._image.Scale, 30 * this._image.Scale), this._angle, this._handOffset.X, this._handOffset.Y);
            else
                Canvas.DrawImageWithAngle(this._image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this._image.Scale, 30 * this._image.Scale), this._angle, this._handOffset.X, this._handOffset.Y);
        }
        else {
            if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
                Canvas.DrawImageWithAngleVFlipped(this._image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this._image.Scale, 30 * this._image.Scale), this._angle, this._handOffset.X, this._handOffset.Y);
            else
                Canvas.DrawImageWithAngle(this._image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this._image.Scale, 30 * this._image.Scale), this._angle, this._handOffset.X, this._handOffset.Y);
        }
    }
    TryShoot() {
        if (this._secondsToCooldown > 0)
            return false;
        this._secondsToCooldown = this._fireCooldown;
        const dir = this._angle - (Math.random() - 0.5) * this._spread;
        const hit = Scene.Current.Raycast(this._position, new Vector2(Math.cos(dir), -Math.sin(dir)), 1500, Tag.Enemy | Tag.Wall)[0];
        if (hit !== undefined && hit.instance instanceof Enemy)
            hit.instance.TakeDamage(this._damage);
        Scene.Current.Instantiate(new Bullet(this._position.X + Math.cos(dir) * this._width, this._position.Y - Math.sin(dir) * this._width, hit === undefined
            ? 2000
            : Math.sqrt((this._position.X - hit.position.X + Math.cos(dir) * this._width) ** 2 + (this._position.Y - hit.position.Y - Math.sin(dir) * this._width) ** 2), dir));
        Scene.Current.Instantiate(new Fireball(this._position.X + Math.cos(this._angle) * (this._width + this._muzzleOffset.X), this._position.Y - Math.sin(this._angle) * (this._width + this._muzzleOffset.X), this._angle, this._muzzleOffset));
        this._fireSound.Play(0.5);
        return true;
    }
}
