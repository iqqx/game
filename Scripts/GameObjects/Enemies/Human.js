import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { Rectangle, Vector2 } from "../../Utilites.js";
import { Player } from "../Player.js";
import { Enemy } from "./Enemy.js";
import { Corpse } from "../Corpse.js";
import { AidKit } from "../../Assets/Items/Item.js";
import { Glock } from "../../Assets/Weapons/Weapon.js";
import { GetSprite } from "../../Game.js";
import { GuardFake } from "../QuestGivers/GuardFake.js";
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
    _weapon;
    static _visibleDistance = 500;
    _armHeight = 0.65;
    _timeToNextFrame = 0;
    _frameIndex = 0;
    _angle = 0;
    _timeFromNotice = -1;
    _timeFromSaw = -1;
    _aggresive = false;
    _friendly = false;
    _timeToShoot = 500;
    _timeToTurn = 1500;
    _fakeCharacter = new GuardFake(0, 0);
    constructor(x, y, type, direction = 1, weapon) {
        super(50, 100, 1, 100, type);
        this._x = x;
        this._y = y;
        this._weapon = weapon ?? new Glock();
        this.Direction = direction;
        this._collider = new Rectangle(this._x, this._y, this.Width, this.Height);
    }
    Update(dt) {
        if (this._timeFromNotice >= 0)
            this._timeFromNotice += dt;
        if (this._timeFromSaw >= 0)
            this._timeFromSaw += dt;
        this.ApplyVForce();
        this._weapon?.Update(0, new Vector2(this._x + this.Width / 2, this._y + this.Height * 0.6), this._angle);
        const plrPos = Scene.Current.Player.GetPosition();
        const plrSize = Scene.Current.Player.GetCollider();
        if (Scene.Current.Player.IsMoving() === 2 && this.GetDirectionToPlayer() != this.Direction && this.GetDistanceToPlayer() < Human._visibleDistance && this._timeFromNotice === -1)
            this._timeFromNotice = 0;
        else if (this._timeFromNotice > this._timeToTurn) {
            this.Direction = this.GetDirectionToPlayer();
            if (this._timeFromSaw === -1)
                this._timeFromSaw = 0;
        }
        if (this.IsSpotPlayer()) {
            this._timeFromNotice = this._timeToTurn + 1;
            this._angle = (() => {
                const angle = -Math.atan2(plrPos.Y + plrSize.Height * 0.5 - (this._y + this.Height * 0.6), plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2));
                if (this.Direction == 1)
                    return Math.clamp(angle, -Math.PI / 2 + 0.4, Math.PI / 2 - 0.4);
                else
                    return angle < 0 ? Math.clamp(angle, -Math.PI, -Math.PI / 2 - 0.4) : Math.clamp(angle, Math.PI / 2 + 0.4, Math.PI);
            })();
            this._weapon?.Update(dt, new Vector2(this._x + this.Width / 2, this._y + this.Height * 0.6), this._angle);
            if (this._aggresive) {
                if (this._timeFromSaw > this._timeToShoot) {
                    const prevX = this._x;
                    if (this.GetDistanceToPlayer() < Human._visibleDistance) {
                        if (this.Direction == -1)
                            this.MoveRight(dt);
                        else
                            this.MoveLeft(dt);
                        if (prevX != this._x) {
                            this._timeToNextFrame -= dt;
                            if (this._timeToNextFrame < 0) {
                                this._frameIndex = (this._frameIndex + 1) % this._frames.Walk.length;
                                this._timeToNextFrame = 70;
                            }
                        }
                        else
                            this._frameIndex = 0;
                    }
                    if (!this._weapon.IsReloading()) {
                        if (this._weapon.GetLoadedAmmo() === 0)
                            this._weapon.Reload();
                        else
                            this._weapon.TryShoot(Tag.Player);
                    }
                }
            }
            else if (!this._friendly && this.GetDistanceToPlayer() < 500 && this._fakeCharacter.GetCompletedQuestsCount() === 0) {
                Scene.Current.GetByTag(Tag.Enemy).forEach((x) => {
                    if (x instanceof Human)
                        x.MakeFriendly();
                });
                Scene.Player.SpeakWith(this._fakeCharacter);
                this._friendly = true;
            }
        }
        else
            this._frameIndex = 0;
    }
    Render() {
        const framesPack = this._frames.Walk;
        const scale = this.Height / framesPack[0].BoundingBox.Height;
        const scaledWidth = framesPack[0].BoundingBox.Width * scale;
        const widthOffset = (scaledWidth - this.Width) / 2;
        if (this._timeFromNotice >= 0 && this._timeFromSaw < this._timeToShoot)
            Canvas.DrawImage(GetSprite("Notice"), new Rectangle(this._x - Scene.Current.GetLevelPosition() + widthOffset, this._y + this.Height + 15, 20, 20));
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
        if (!Scene.Player.IsAlive())
            return false;
        const plrPos = Scene.Current.Player.GetPosition();
        const plrSize = Scene.Current.Player.GetCollider();
        if (Math.sign(plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2)) != this.Direction)
            return false;
        const hit = Scene.Current.Raycast(new Vector2(this._x + this.Width / 2, this._y + this.Height * 0.4), new Vector2(plrPos.X - this._x, plrPos.Y + plrSize.Height * 0.9 - (this._y + this.Height * 0.4)), 1000, Tag.Player | Tag.Wall)[0];
        return hit !== undefined && hit.instance instanceof Player && hit.instance.IsAlive();
    }
    TakeDamage(damage) {
        super.TakeDamage(damage);
        Scene.Current.GetByTag(Tag.Enemy).forEach((x) => {
            if (x instanceof Human)
                x.MakeAgressive();
        });
        this.Direction = this.GetDirectionToPlayer();
        if (this._timeFromNotice === -1)
            this._timeFromNotice = 0;
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
    MakeFriendly() {
        this._friendly = true;
    }
    MakeAgressive() {
        this._aggresive = true;
    }
}
//# sourceMappingURL=Human.js.map