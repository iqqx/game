import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { GameObject, Rectangle, Vector2 } from "../Utilites.js";
import { Platform } from "./Platform.js";
import { Spikes } from "./Spikes.js";
export class Entity extends GameObject {
    _maxHealth;
    _speed;
    _health;
    _movingUp = false;
    _movingDown = false;
    _movingLeft = false;
    _movingRight = false;
    _verticalAcceleration = 0;
    _grounded = true;
    _jumpForce = 20;
    _xTarget = 0;
    _yTarget = 0;
    _onLadder = null;
    Direction = 1;
    constructor(width, height, speed, maxHealth) {
        super(width, height);
        this._speed = Math.clamp(speed, 0, Number.MAX_VALUE);
        this._health = Math.clamp(maxHealth, 1, Number.MAX_VALUE);
        this._maxHealth = this._health;
        this._collider = new Rectangle(this._x, this._y, this.Width, this.Height);
    }
    Update(dt) {
        if (this._onLadder !== null) {
            if (this._movingUp)
                this._y += 5;
            else if (this._movingDown)
                this._y -= 5;
            return;
        }
        this.ApplyVForce();
        if (this._movingLeft)
            this.MoveLeft();
        else if (this._movingRight)
            this.MoveRight();
        this.Direction = this._xTarget > this._x + this.Width / 2 - Scene.Current.GetLevelPosition() ? 1 : -1;
    }
    IsAlive() {
        return this._health > 0;
    }
    MoveRight() {
        if (!this.IsAlive())
            return;
        this._x += this._speed;
        const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
        if (collideOffsets !== false) {
            if (collideOffsets.instance instanceof Spikes)
                this.TakeDamage(100);
            this._x -= collideOffsets.position.X;
        }
    }
    MoveLeft() {
        if (!this.IsAlive())
            return;
        this._x -= this._speed;
        const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
        if (collideOffsets !== false) {
            if (collideOffsets.instance instanceof Spikes)
                this.TakeDamage(100);
            this._x -= collideOffsets.position.X;
        }
    }
    Jump() {
        if (!this.IsAlive())
            return;
        if (!this._grounded)
            return;
        this._verticalAcceleration = this._jumpForce;
    }
    ApplyVForce() {
        const prevY = this._y;
        this._verticalAcceleration -= this._verticalAcceleration > 0 ? 2 : 3;
        this._y += this._verticalAcceleration;
        if (this._verticalAcceleration <= 0) {
            // падаем
            const offsets = Scene.Current.GetCollide(this, Tag.Wall | Tag.Platform | Tag.Ladder);
            if (offsets !== false && offsets.position.Y !== 0) {
                {
                    if (offsets.instance instanceof Spikes)
                        this.TakeDamage(100);
                    else if (offsets.instance instanceof Platform && (offsets.position.Y < 0 || prevY < offsets.instance.GetPosition().Y + offsets.instance.GetCollider().Height))
                        return;
                    this._verticalAcceleration = 0;
                    this._grounded = true;
                    this._y += offsets.position.Y;
                }
            }
        }
        else if (this._verticalAcceleration > 0) {
            // взлетаем
            this._grounded = false;
            const offsets = Scene.Current.GetCollide(this, Tag.Wall);
            if (offsets !== false) {
                this._verticalAcceleration = 0;
                this._y += offsets.position.Y;
                return;
            }
        }
    }
    TakeDamage(damage) {
        this._health -= damage;
    }
    GetTarget() {
        return new Vector2(this._xTarget, this._yTarget);
    }
}
