import { GetSound, GetSprite } from "../AssetsLoader.js";
import { Canvas } from "../Context.js";
import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { Rectangle, Vector2 } from "../Utilites.js";
import { GameObject } from "./GameObject.js";
import { ItemDrop } from "./ItemDrop.js";
export class FlyingThrowable extends GameObject {
    _explosive = GetSprite("Explosive");
    _sprite;
    _spawnedBy;
    _grounded = false;
    _impacted = false;
    _accelerationX;
    _accelerationY;
    _timeFromExplosive = 0;
    _timeFromThrow = 0;
    constructor(x, y, angle, by) {
        super(by.Sprite.ScaledSize.X, by.Sprite.ScaledSize.Y);
        this._spawnedBy = by;
        this._x = x;
        this._sprite = by.Sprite;
        this._collider = new Rectangle(0, 0, this.Width, this.Height);
        this._accelerationX = Math.cos(angle) * 35;
        this._accelerationY = Math.sin(-angle) * 25;
        this._y = y;
    }
    Update(dt) {
        if (this._impacted) {
            if (this._timeFromThrow < 200) {
                if (!this._grounded)
                    this.ApplyForce(dt);
                else {
                    Scene.Current.Instantiate(new ItemDrop(this._x, this._y, this._spawnedBy));
                    this.Destroy();
                }
            }
            else {
                this._timeFromExplosive += dt;
                if (this._timeFromExplosive >= 150)
                    this.Destroy();
            }
        }
        else {
            this._timeFromThrow += dt;
            this.ApplyForce(dt);
        }
    }
    Render() {
        if (this._impacted && this._timeFromThrow >= 200) {
            const frame = this._explosive[Math.floor(this._timeFromExplosive / 50)];
            Canvas.DrawImage(frame, new Rectangle(this._x - frame.ScaledSize.X / 2, this._y - frame.ScaledSize.Y / 2, frame.ScaledSize.X, frame.ScaledSize.Y));
        }
        else {
            // Canvas.DrawImage(this._sprite, new Rectangle(this._x  , this._y, this._sprite.ScaledSize.X, this._sprite.ScaledSize.Y));
            Canvas.DrawImageWithAngle(this._sprite, new Rectangle(this._x, this._y, this._sprite.ScaledSize.X, this._sprite.ScaledSize.Y), -2 * Math.atan2(this._accelerationY, this._accelerationX), 0, 0);
        }
    }
    ApplyForce(dt) {
        const physDt = dt / 15 / this._spawnedBy.Weight;
        const physDt2 = physDt / 20;
        if (this._accelerationY <= 0) {
            // падаем
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x, this._y + this._accelerationY * physDt, this._collider.Width, this._collider.Height), Tag.Wall | Tag.Enemy);
            offsets.sort((a, b) => (a.instance.Tag !== b.instance.Tag ? b.instance.Tag - a.instance.Tag : b.start.Y - a.start.Y));
            if (offsets.length > 0 && offsets[0].start.Y >= 0) {
                this._y = offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height;
                this._grounded = true;
                this.Detonate();
                return;
            }
            else {
                this._y += this._accelerationY * physDt;
                this._accelerationY -= physDt;
            }
        }
        else if (this._accelerationY > 0) {
            // взлетаем
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x, this._y + this._accelerationY * physDt, this._collider.Width, this._collider.Height), Tag.Wall | Tag.Enemy);
            if (offsets.length > 0) {
                const r = offsets.minBy((x) => x.instance.GetPosition().Y);
                this._y = r.instance.GetPosition().Y - this._collider.Height;
                this.Detonate();
                return;
            }
            else {
                this._y += this._accelerationY * physDt;
                this._accelerationY -= physDt;
            }
        }
        if (this._accelerationX < 0) {
            // летим влево
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x + this._accelerationX * physDt, this._y, this._collider.Width, this._collider.Height), Tag.Wall | Tag.Enemy);
            offsets.sort((a, b) => (a.instance.Tag !== b.instance.Tag ? b.instance.Tag - a.instance.Tag : b.start.X - a.start.X));
            if (offsets.length > 0) {
                this._x = offsets[0].instance.GetPosition().X + offsets[0].instance.GetCollider().Width;
                if (!this._grounded)
                    this._accelerationX = -this._accelerationX / 2;
                this.Detonate();
            }
            else {
                this._x += this._accelerationX * physDt;
                this._accelerationX = Math.min(this._accelerationX - physDt2, 0);
            }
        }
        else if (this._accelerationX > 0) {
            // летим вправо
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x + this._accelerationX * physDt, this._y, this._collider.Width, this._collider.Height), Tag.Wall | Tag.Enemy);
            if (offsets.length > 0) {
                const r = offsets.minBy((x) => x.instance.GetPosition().X);
                this._x = r.instance.GetPosition().X - this._collider.Width;
                if (!this._grounded)
                    this._accelerationX = -this._accelerationX / 2;
                this.Detonate();
            }
            else {
                this._x += this._accelerationX * physDt;
                this._accelerationX = Math.max(this._accelerationX - physDt2, 0);
            }
        }
    }
    Detonate() {
        this._impacted = true;
        if (this._timeFromThrow < 200) {
            if (this._grounded) {
                Scene.Current.Instantiate(new ItemDrop(this._x, this._y, this._spawnedBy));
                this.Destroy();
            }
        }
        else {
            const explosiveDamage = 350;
            const explosiveRange = 300;
            GetSound("Explosive").PlayOriginal();
            for (const entity of Scene.Current.GetByTag(Tag.Enemy | Tag.Player)) {
                const distance = Vector2.Length(entity.GetCenter(), new Vector2(this._x, this._y));
                if (distance < explosiveRange) {
                    entity.TakeDamage(explosiveDamage * (1 - distance / explosiveRange));
                }
            }
        }
    }
}
//# sourceMappingURL=FlyingThrowable.js.map