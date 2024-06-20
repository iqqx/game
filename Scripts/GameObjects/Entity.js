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
            // if (collideOffsets.start.Y > 0 && collideOffsets.start.Y < 20) this._y += collideOffsets.start.Y;
            // else
            this._x -= collideOffsets.start.X;
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
            // if (collideOffsets.start.Y > 0 && collideOffsets.start.Y < 20) this._y += collideOffsets.start.Y;
            // else
            this._x += collideOffsets.end.X;
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
            const offsets = Scene.Current.GetCollides(this, Tag.Wall | Tag.Platform);
            offsets.sort((a, b) => (a.instance.Tag === b.instance.Tag ? (a.instance.Tag === Tag.Platform ? a.start.Y - b.start.Y : b.start.Y - a.start.Y) : a.instance.Tag));
            if (offsets.length > 0 && offsets[0].start.Y >= 0) {
                if (offsets[0].instance instanceof Spikes)
                    this.TakeDamage(100);
                else if (offsets[0].instance instanceof Platform && (prevY < offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height || this._movingDown))
                    return;
                this._verticalAcceleration = 0;
                this._grounded = true;
                this._y += offsets[0].start.Y;
            }
        }
        else if (this._verticalAcceleration > 0) {
            // взлетаем
            this._grounded = false;
            const offsets = Scene.Current.GetCollides(this, Tag.Wall);
            if (offsets.length > 0) {
                this._verticalAcceleration = 0;
                this._y += offsets.minBy((x) => x.instance.GetPosition().Y).end.Y;
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
//# sourceMappingURL=Entity.js.map