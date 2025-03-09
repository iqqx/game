import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { Rectangle } from "../../Utilites.js";
import { Enemy } from "./Enemy.js";
import { Direction, EnemyType, Tag } from "../../Enums.js";
import { GetSprite } from "../../AssetsLoader.js";
import { Platform } from "../Platform.js";
import { Spikes } from "../Spikes.js";
export class Monster extends Enemy {
    static Damage = 100;
    static AttackCooldown = 500;
    _sprites = GetSprite("Monster_Walk");
    Direction = Direction.Left;
    _accelerationX;
    _attackCooldown = 0;
    constructor(x, y) {
        super(0, 0, 4, 150, EnemyType.Rat);
        this._x = x;
        this._y = y;
        this.Width = this._sprites[0].ScaledSize.X;
        this.Height = this._sprites[0].ScaledSize.Y;
        this._collider = new Rectangle(0, 0, this.Width, this.Height);
    }
    Update(dt) {
        this.ApplyVForce(dt);
        this._attackCooldown -= dt;
        if (!this.IsSpotPlayer())
            return;
        const plrPos = Scene.Current.Player.GetCenter();
        this.Direction = Math.sign(plrPos.X - (this._x + this.Width / 2));
        if (this.GetDistanceToPlayer() < 50) {
            Scene.Current.Player.TakeDamage(Monster.Damage);
            this._accelerationX = 0;
        }
        else if (this.GetDistanceToPlayer() < 600 && this._attackCooldown <= 0 && this._grounded) {
            this._accelerationX = 150 * this.Direction;
            this._verticalAcceleration = 15;
            this._attackCooldown = Monster.AttackCooldown;
            this._grounded = false;
            return;
        }
    }
    Render() {
        const frame = this._sprites[this._grounded ? 0 : 1];
        if (this.Direction === Direction.Right)
            Canvas.DrawImage(frame, new Rectangle(this._x, this._y, this.Width, this.Height));
        else
            Canvas.DrawImageFlipped(frame, new Rectangle(this._x, this._y, this.Width, this.Height));
    }
    TakeDamage(damage) {
        super.TakeDamage(damage);
        if (this._health <= 0) {
            this.Destroy();
        }
    }
    ApplyVForce(dt) {
        const physDt = dt / 15;
        const physDt2 = physDt / 5;
        if (this._verticalAcceleration === 0) {
            // Проверка на стойкость
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x, this._y - 1, this._collider.Width, this._collider.Height), Tag.Wall | Tag.Platform);
            offsets.sort((a, b) => a.start.Y - b.start.Y);
            if (offsets.length === 0 ||
                (offsets[0].instance.Tag === Tag.Platform && (this._movingDown || this._y < offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height))) {
                this._grounded = false;
                this._verticalAcceleration -= physDt * 3;
            }
        }
        else if (this._verticalAcceleration < 0) {
            // падаем
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x, this._y + this._verticalAcceleration * physDt, this._collider.Width, this._collider.Height), Tag.Wall | Tag.Platform);
            offsets.sort((a, b) => (a.instance.Tag !== b.instance.Tag ? b.instance.Tag - a.instance.Tag : a.instance.Tag === Tag.Platform ? a.start.Y - b.start.Y : b.start.Y - a.start.Y));
            if (offsets.length > 0 && offsets[0].start.Y >= 0) {
                if (offsets[0].instance instanceof Spikes)
                    this.TakeDamage(100);
                else if (offsets[0].instance instanceof Platform && this._y <= offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height) {
                    this._y += this._verticalAcceleration * physDt;
                    this._verticalAcceleration -= physDt * 3;
                }
                else {
                    this._verticalAcceleration = 0;
                    this._grounded = true;
                    this._y = offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height;
                    return;
                }
            }
            else {
                this._y += this._verticalAcceleration * physDt;
                this._verticalAcceleration -= physDt;
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
                this._y += this._verticalAcceleration * physDt;
                this._verticalAcceleration -= physDt;
            }
        }
        if (this._accelerationX < 0) {
            // летим влево
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x + this._accelerationX * physDt, this._y, this._collider.Width, this._collider.Height), Tag.Wall);
            offsets.sort((a, b) => (a.instance.Tag !== b.instance.Tag ? b.instance.Tag - a.instance.Tag : b.start.X - a.start.X));
            if (offsets.length > 0) {
                this._x = offsets[0].instance.GetPosition().X + offsets[0].instance.GetCollider().Width;
                this._accelerationX = 0;
                this._grounded = true;
            }
            else {
                this._x += this._accelerationX * physDt2;
                this._accelerationX = Math.min(this._accelerationX, 0);
            }
        }
        else if (this._accelerationX > 0) {
            // летим вправо
            const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x + this._accelerationX * physDt, this._y, this._collider.Width, this._collider.Height), Tag.Wall);
            if (offsets.length > 0) {
                const r = offsets.minBy((x) => x.instance.GetPosition().X);
                this._x = r.instance.GetPosition().X - this._collider.Width;
                this._accelerationX = 0;
                this._grounded = true;
            }
            else {
                this._x += this._accelerationX * physDt2;
                this._accelerationX = Math.max(this._accelerationX, 0);
            }
        }
    }
}
//# sourceMappingURL=Monster.js.map