import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { Rectangle, Vector2 } from "../../Utilites.js";
import { Player } from "../Player.js";
import { Enemy } from "./Enemy.js";
import { Corpse } from "../Corpse.js";
import { AidKit } from "../../Assets/Items/Item.js";
import { AK } from "../../Assets/Weapons/Weapon.js";
import { GetSprite } from "../../Game.js";
export class Human extends Enemy {
    static _deathSound = new Audio("Sounds/human_death-2.mp3");
    _frames = {
        Walk: GetSprite("Player_Walk"),
        Sit: GetSprite("Player_Crouch"),
        Hands: {
            Straight: GetSprite("Player_Arm_Straight"),
            Bend: GetSprite("Player_Arm_Bend"),
        },
    };
    _weapon = new AK();
    static _visibleDistance = 500;
    _armHeight = 0.65;
    _timeToNextFrame = 0;
    _frameIndex = 0;
    _angle = 0;
    constructor(x, y, type) {
        super(50, 100, 1, 100, type);
        this._x = x;
        this._y = y;
        this._collider = new Rectangle(this._x, this._y, this.Width, this.Height);
    }
    Update(dt) {
        const prevX = this._x;
        super.Update(dt);
        if (prevX != this._x) {
            this._timeToNextFrame -= dt;
            if (this._timeToNextFrame < 0) {
                this._frameIndex = (this._frameIndex + 1) % this._frames.Walk.length;
                this._timeToNextFrame = 70;
            }
        }
        else {
            this._frameIndex = 0;
        }
        this._weapon?.Update(dt, new Vector2(this._x + this.Width / 2, this._y + this.Height * 0.6), this._angle);
        const plrPos = Scene.Current.Player.GetPosition();
        const plrSize = Scene.Current.Player.GetCollider();
        if (Scene.Current.Player.IsMoving() === 2 &&
            Math.sign(plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2)) != this.Direction &&
            (plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2)) ** 2 + (plrPos.Y + plrSize.Height / 2 - (this._y + this.Height / 2)) < Human._visibleDistance ** 2)
            this.Direction *= -1;
        if (this.IsSpotPlayer()) {
            this._angle = (() => {
                const angle = -Math.atan2(plrPos.Y + plrSize.Height * 0.5 - (this._y + this.Height * 0.6), plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2));
                if (this.Direction == 1)
                    return Math.clamp(angle, -Math.PI / 2 + 0.4, Math.PI / 2 - 0.4);
                else
                    return angle < 0 ? Math.clamp(angle, -Math.PI, -Math.PI / 2 - 0.4) : Math.clamp(angle, Math.PI / 2 + 0.4, Math.PI);
            })();
            this._weapon.TryShoot(Tag.Player);
        }
    }
    Render() {
        const framesPack = this._frames.Walk;
        const scale = this.Height / framesPack[0].BoundingBox.Height;
        const scaledWidth = framesPack[0].BoundingBox.Width * scale;
        const widthOffset = (scaledWidth - this.Width) / 2;
        if (this.Direction == 1) {
            Canvas.DrawImageWithAngle(this._frames.Hands.Straight, new Rectangle(this._x + this.Width / 2 - Scene.Current.GetLevelPosition(), this._y + this.Height * this._armHeight, this._frames.Hands.Straight.BoundingBox.Width * scale, this._frames.Hands.Straight.BoundingBox.Height * scale), this._angle + 0.05, -2 * scale, (this._frames.Hands.Straight.BoundingBox.Height - 2) * scale);
            Canvas.DrawImage(framesPack[this._frameIndex], new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y, scaledWidth, this.Height));
            this._weapon.Render();
            Canvas.DrawImageWithAngle(this._frames.Hands.Bend, new Rectangle(this._x + this.Width / 2 - Scene.Current.GetLevelPosition(), this._y + this.Height * this._armHeight, this._frames.Hands.Bend.BoundingBox.Width * scale, this._frames.Hands.Bend.BoundingBox.Height * scale), this._angle, -2 * scale, (this._frames.Hands.Bend.BoundingBox.Height - 2) * scale);
        }
        else {
            Canvas.DrawImageWithAngleVFlipped(this._frames.Hands.Bend, new Rectangle(this._x + this.Width / 2 - Scene.Current.GetLevelPosition(), this._y + this.Height * this._armHeight, this._frames.Hands.Bend.BoundingBox.Width * scale, this._frames.Hands.Bend.BoundingBox.Height * scale), this._angle, -2 * scale, (this._frames.Hands.Bend.BoundingBox.Height - 2) * scale);
            Canvas.DrawImageFlipped(framesPack[this._frameIndex], new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y, scaledWidth, this.Height));
            this._weapon.Render();
            Canvas.DrawImageWithAngleVFlipped(this._frames.Hands.Straight, new Rectangle(this._x + this.Width / 2 - Scene.Current.GetLevelPosition(), this._y + this.Height * this._armHeight, this._frames.Hands.Straight.BoundingBox.Width * scale, this._frames.Hands.Straight.BoundingBox.Height * scale), this._angle - 0.05, -2 * scale, (this._frames.Hands.Straight.BoundingBox.Height - 2) * scale);
        }
    }
    IsSpotPlayer() {
        const plrPos = Scene.Current.Player.GetPosition();
        const plrSize = Scene.Current.Player.GetCollider();
        if (Math.sign(plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2)) != this.Direction)
            return false;
        const hit = Scene.Current.Raycast(new Vector2(this._x + this.Width / 2, this._y + this.Height * 0.4), new Vector2(plrPos.X - this._x, plrPos.Y + plrSize.Height * 0.9 - (this._y + this.Height * 0.4)), 1000, Tag.Player | Tag.Wall)[0];
        return hit !== undefined && hit.instance instanceof Player && hit.instance.IsAlive();
    }
    TakeDamage(damage) {
        super.TakeDamage(damage);
        if (this._health <= 0) {
            this.Destroy();
            Scene.Current.Player.OnKilled(this._type);
            Scene.Current.Instantiate(new Corpse(this._x, this._y, this._weapon, new AidKit()));
            const s = Human._deathSound.cloneNode();
            s.playbackRate = 0.5;
            s.volume = 1;
            s.play();
        }
    }
}
