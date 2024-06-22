import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { Rectangle, Vector2 } from "../Utilites.js";
import { GameObject } from "./GameObject.js";
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
                this.MoveUp(dt);
            else if (this._movingDown)
                this.MoveDown(dt);
            return;
        }
        this.ApplyVForce(dt);
        if (this._movingLeft)
            this.MoveLeft(dt);
        else if (this._movingRight)
            this.MoveRight(dt);
        this.Direction = this._xTarget > this._x + this.Width / 2 - Scene.Current.GetLevelPosition() ? 1 : -1;
    }
    IsAlive() {
        return this._health > 0;
    }
    MoveRight(dt) {
        if (!this.IsAlive())
            return;
        this._x += this._speed * (dt / 15);
        const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
        if (collideOffsets !== false) {
            if (collideOffsets.instance instanceof Spikes)
                this.TakeDamage(100);
            // if (collideOffsets.start.Y > 0 && collideOffsets.start.Y < 20) this._y += collideOffsets.start.Y;
            // else
            this._x -= collideOffsets.start.X;
        }
    }
    MoveLeft(dt) {
        if (!this.IsAlive())
            return;
        this._x -= this._speed * (dt / 15);
        const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
        if (collideOffsets !== false) {
            if (collideOffsets.instance instanceof Spikes)
                this.TakeDamage(100);
            // if (collideOffsets.start.Y > 0 && collideOffsets.start.Y < 20) this._y += collideOffsets.start.Y;
            // else
            this._x += collideOffsets.end.X;
        }
    }
    MoveDown(dt) {
        if (!this.IsAlive())
            return;
        this._y -= this._speed * (dt / 15);
        const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
        if (collideOffsets !== false) {
            if (collideOffsets.instance instanceof Spikes)
                this.TakeDamage(100);
            this._y += collideOffsets.start.Y;
        }
    }
    MoveUp(dt) {
        if (!this.IsAlive())
            return;
        this._y += this._speed * (dt / 15);
        const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
        if (collideOffsets !== false) {
            if (collideOffsets.instance instanceof Spikes)
                this.TakeDamage(100);
            this._y -= collideOffsets.end.Y;
        }
    }
    Jump() {
        if (!this.IsAlive())
            return;
        if (!this._grounded)
            return;
        this._grounded = false;
        this._verticalAcceleration = this._jumpForce;
    }
    ApplyVForce(dt) {
        if (this._verticalAcceleration === 0) {
            // Проверка на стойкость
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x, this._y - 1, this._collider.Width, this._collider.Height), Tag.Wall | Tag.Platform);
            offsets.sort((a, b) => a.start.Y - b.start.Y);
            if (offsets.length === 0 ||
                (offsets[0].instance.Tag === Tag.Platform && (this._movingDown || this._y < offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height))) {
                this._grounded = false;
                this._verticalAcceleration -= (dt / 15) * 3;
            }
        }
        else if (this._verticalAcceleration < 0) {
            // падаем
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x, this._y + this._verticalAcceleration * (dt / 15), this._collider.Width, this._collider.Height), Tag.Wall | Tag.Platform);
            offsets.sort((a, b) => (a.instance.Tag !== b.instance.Tag ? b.instance.Tag - a.instance.Tag : a.instance.Tag === Tag.Platform ? a.start.Y - b.start.Y : b.start.Y - a.start.Y));
            if (offsets.length > 0 && offsets[0].start.Y >= 0) {
                if (offsets[0].instance instanceof Spikes)
                    this.TakeDamage(100);
                else if (offsets[0].instance instanceof Platform && this._y <= offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height) {
                    this._y += this._verticalAcceleration * (dt / 15);
                    this._verticalAcceleration -= (dt / 15) * 3;
                    return;
                }
                this._verticalAcceleration = 0;
                this._grounded = true;
                this._y = offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height;
            }
            else {
                this._y += this._verticalAcceleration * (dt / 15);
                this._verticalAcceleration -= (dt / 15) * 3;
            }
        }
        else if (this._verticalAcceleration > 0) {
            // взлетаем
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x, this._y + this._verticalAcceleration * (dt / 15), this._collider.Width, this._collider.Height), Tag.Wall);
            if (offsets.length > 0) {
                this._verticalAcceleration = 0;
                const r = offsets.minBy((x) => x.instance.GetPosition().Y);
                this._y = r.instance.GetPosition().Y - this._collider.Height;
            }
            else {
                this._y += this._verticalAcceleration * (dt / 15);
                this._verticalAcceleration -= (dt / 15) * 2;
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
//# sourceMappingURL=Entity.js.map