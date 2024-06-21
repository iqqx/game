import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { Rectangle } from "../../Utilites.js";
import { Enemy } from "./Enemy.js";
import { EnemyType } from "../../Enums.js";
import { GetSound, GetSprite } from "../../Game.js";
import { RatCorpse } from "../RatCorpse.js";
import { RatTail } from "../../Assets/Items/Item.js";
export class Rat extends Enemy {
    static Damage = 20;
    static AttackCooldown = 500;
    static _deathSound = new Audio("Sounds/rat_death.mp3");
    _image = GetSprite("Rat");
    _attackSound = GetSound("Rat_Attack");
    _attackCooldown = 0;
    constructor(x, y) {
        super(100, 50, 4, 5, EnemyType.Rat);
        this._x = x;
        this._y = y;
    }
    Update(dt) {
        super.Update(dt);
        const plrPos = Scene.Current.Player.GetPosition();
        const distance = this.GetDistanceToPlayer();
        if (this._attackCooldown <= 0) {
            if (Math.abs(distance) > 50 && Math.abs(distance) < 150) {
                this._verticalAcceleration = 20;
                this._attackCooldown = Rat.AttackCooldown;
            }
            if (Math.abs(this.GetDistanceToPlayer()) <= 100 && this._y == plrPos.Y) {
                this._attackCooldown = Rat.AttackCooldown;
                Scene.Current.Player.TakeDamage(Rat.Damage);
                this._attackSound.Play(0.5);
            }
        }
        else
            this._attackCooldown -= dt;
    }
    Render() {
        if (this.Direction === 1)
            Canvas.DrawImage(this._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
        else
            Canvas.DrawImageFlipped(this._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
    }
    TakeDamage(damage) {
        super.TakeDamage(damage);
        if (this._health <= 0) {
            this.Destroy();
            Scene.Current.Instantiate(new RatCorpse(this._x, this._y, new RatTail()));
            const s = Rat._deathSound.cloneNode();
            s.volume = 0.25;
            s.play();
        }
    }
}
//# sourceMappingURL=Rat.js.map