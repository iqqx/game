import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { LoadImage, Rectangle } from "../../Utilites.js";
import { Enemy } from "./Enemy.js";
import { EnemyType } from "../../Enums.js";
export class Rat extends Enemy {
    static Damage = 10;
    static AttackCooldown = 500;
    static _attackSound = new Audio("Sounds/rat_attack.mp3");
    static _deathSound = new Audio("Sounds/rat_death.mp3");
    static _frames = {
        Idle: LoadImage(`Images/Rat.png`),
    };
    _attackCooldown = 0;
    constructor(x, y) {
        super(50, 25, 2, 5, EnemyType.Rat);
        this._x = x;
        this._y = y;
    }
    Update(dt) {
        super.Update(dt);
        const plrPos = Scene.Current.Player.GetPosition();
        const plrSize = Scene.Current.Player.GetCollider();
        if (this._attackCooldown <= 0) {
            if (Math.abs(this._x +
                (this.Direction === 1 ? this._width : 0) -
                (plrPos.X + (this.Direction === 1 ? plrSize.Width : 0))) <= this._width &&
                this._y == plrPos.Y) {
                this._attackCooldown = Rat.AttackCooldown;
                Scene.Current.Player.TakeDamage(Rat.Damage);
                const s = Rat._attackSound.cloneNode();
                s.volume = 0.5;
                s.play();
            }
        }
        else
            this._attackCooldown -= dt;
    }
    Render() {
        if (this.Direction === 1) {
            Canvas.DrawImage(Rat._frames.Idle, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._width, this._height));
        }
        else {
            Canvas.DrawImageFlipped(Rat._frames.Idle, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._width, this._height));
        }
    }
    TakeDamage(damage) {
        super.TakeDamage(damage);
        if (this._health <= 0) {
            this.Destroy();
            const s = Rat._deathSound.cloneNode();
            s.volume = 0.25;
            s.play();
        }
    }
}
