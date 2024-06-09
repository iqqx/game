import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { GameObject, Rectangle } from "../Utilites.js";
export class Entity extends GameObject {
    _maxHealth;
    _speed;
    _direction = 1;
    _health;
    _movingLeft = false;
    _movingRight = false;
    _verticalAcceleration = 0;
    _grounded = true;
    _jumpForce = 25;
    _xTarget = 0;
    _yTarget = 0;
    constructor(width, height, speed, maxHealth) {
        super(width, height);
        this._speed = Math.clamp(speed, 0, Number.MAX_VALUE);
        this._health = Math.clamp(maxHealth, 1, Number.MAX_VALUE);
        this._maxHealth = this._health;
        this._collider = new Rectangle(this._x, this._y, this._width, this._height);
    }
    Update(dt) {
        this.ApplyVForce();
        if (this._movingLeft)
            this.MoveLeft();
        else if (this._movingRight)
            this.MoveRight();
        this._direction = this._xTarget > this._x + this._width / 2 ? 1 : -1;
    }
    MoveRight() {
        this._x += this._speed;
        const collideOffsets = Scene.Current.GetCollide(this, Tag.Platform);
        if (collideOffsets !== false && collideOffsets.X != 0)
            this._x -= collideOffsets.X;
    }
    MoveLeft() {
        this._x -= this._speed;
        const collideOffsets = Scene.Current.GetCollide(this, Tag.Platform);
        if (collideOffsets !== false && collideOffsets.X != 0)
            this._x -= collideOffsets.X;
    }
    Jump() {
        if (!this._grounded)
            return;
        this._verticalAcceleration = this._jumpForce;
    }
    ApplyVForce() {
        this._verticalAcceleration -= this._verticalAcceleration > 0 ? 2 : 3;
        this._y += this._verticalAcceleration;
        if (this._verticalAcceleration <= 0) {
            const offsets = Scene.Current.GetCollide(this, Tag.Platform);
            if (offsets !== false && offsets.Y !== 0) {
                this._verticalAcceleration = 0;
                this._grounded = true;
                this._y += offsets.Y;
            }
        }
        else if (this._verticalAcceleration > 0) {
            this._grounded = false;
            const offsets = Scene.Current.GetCollide(this, Tag.Platform);
            if (offsets !== false) {
                this._verticalAcceleration = 0;
                this._y += offsets.Y;
                return;
            }
        }
    }
    TakeDamage(damage) {
        this._health -= damage;
    }
}
