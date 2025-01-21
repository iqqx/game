import { EnemyType, Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { Rectangle, Vector2 } from "../../Utilites.js";
import { Player } from "../Player.js";
import { Enemy } from "./Enemy.js";
import { Corpse } from "../Corpse.js";
import { AidKit } from "../../Assets/Items/Items.js";
import { Weapon } from "../../Assets/Weapons/Weapon.js";
import { GuardFake } from "../QuestGivers/GuardFake.js";
import { FakeEndGuard } from "../QuestGivers/FakeEndGuard.js";
import { Elder } from "../QuestGivers/Elder.js";
import { GetSound, GetSprite } from "../../AssetsLoader.js";
export class Human extends Enemy {
    _deathSound = GetSound("Human_Death_2");
    _frames;
    _weapon;
    static _visibleDistance = 500;
    _armHeight = 0.6;
    _timeToNextFrame = 0;
    _frameIndex = 0;
    _angle = 0;
    _timeFromNotice = -1;
    _timeFromSaw = -1;
    _timeToRotate = 0;
    _aggresive = false;
    _friendly = false;
    _timeToShoot = 500;
    _timeToTurn = 1500;
    _fakeCharacter = new GuardFake();
    _fakeEndCharacter = new FakeEndGuard();
    _warned = false;
    constructor(x, y, type, direction = 1, weapon) {
        super(0, 0, 1, 100, type);
        this._x = x;
        this._y = y;
        this._weapon = weapon ?? Weapon.GetById("Glock");
        this.Direction = direction;
        this._frames =
            type === EnemyType.Green
                ? {
                    Walk: GetSprite("Human_Green_Walk"),
                    Hands: {
                        Straight: GetSprite("Human_Green_Arm_Straight"),
                        Bend: GetSprite("Human_Green_Arm_Bend"),
                    },
                }
                : {
                    Walk: GetSprite("Human_Red_Walk"),
                    Hands: {
                        Straight: GetSprite("Human_Red_Arm_Straight"),
                        Bend: GetSprite("Human_Red_Arm_Bend"),
                    },
                };
        this.Width = this._frames.Walk[0].ScaledSize.X;
        this.Height = this._frames.Walk[0].ScaledSize.Y;
        this._collider = new Rectangle(this._x, this._y, this.Width, this.Height);
        this._angle = this.Direction === -1 ? Math.PI : 0;
        this._weapon.Load();
    }
    Update(dt) {
        if (this._timeFromNotice >= 0)
            this._timeFromNotice += dt;
        if (this._timeFromSaw >= 0)
            this._timeFromSaw += dt;
        this._timeToRotate -= dt;
        this.ApplyVForce(dt);
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
            this._angle = -Math.atan2(plrPos.Y + plrSize.Height * 0.5 - (this._y + this.Height * this._armHeight), plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2));
            const c = Math.cos(this._angle);
            const s = Math.sin(this._angle);
            const scale = this._frames.Walk[0].Scale;
            const dir = this.Direction === 1 ? 1 / 3 : 2 / 3;
            const handPosition = this._weapon.Heavy
                ? new Vector2(this._x + this.Width * dir + 14 * scale * c - 3 * scale * s * Math.sign(c), this._y + this.Height * this._armHeight - 3 * scale * c * Math.sign(c) - 14 * scale * s)
                : new Vector2(this._x + this.Width * dir + 22 * scale * c, this._y + this.Height * this._armHeight - 22 * scale * s);
            this._weapon.Update(dt, handPosition, this._angle);
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
                                this._timeToNextFrame = 150;
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
            else {
                if (this._type === EnemyType.Red) {
                    if (Scene.Current.GetByType(Elder)[0].GetCompletedQuestsCount() === 1) {
                        if (!this._warned) {
                            Scene.Current.GetByTag(Tag.Enemy).forEach((x) => {
                                if (x instanceof Human)
                                    x.MakeWarned();
                            });
                            Scene.Player.SpeakWith(this._fakeEndCharacter);
                        }
                    }
                    else if (this.GetDistanceToPlayer() < 700 && !this._warned) {
                        this._warned = true;
                        Scene.Player.SpeakWith(this._fakeEndCharacter);
                    }
                    else if (this.GetDistanceToPlayer() < 500 && this._warned) {
                        this._aggresive = true;
                    }
                    else if (this.GetDistanceToPlayer() > 1000)
                        Scene.Current.GetByTag(Tag.Enemy).forEach((x) => {
                            if (x instanceof Human)
                                x.MakeUnwarned();
                        });
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
        }
        else {
            if (this._timeToRotate <= 0) {
                this.Direction = -this.Direction;
                this._angle = this.Direction === 1 ? 0 : Math.PI;
                this._timeFromNotice = -1;
                this._timeFromSaw = -1;
                this._timeToRotate = 5000;
                const c = Math.cos(this._angle);
                const s = Math.sin(this._angle);
                const scale = this._frames.Walk[0].Scale;
                const dir = this.Direction === 1 ? 1 / 3 : 2 / 3;
                const handPosition = this._weapon.Heavy
                    ? new Vector2(this._x + this.Width * dir + 14 * scale * c - 3 * scale * s * Math.sign(c), this._y + this.Height * this._armHeight - 3 * scale * c * Math.sign(c) - 14 * scale * s)
                    : new Vector2(this._x + this.Width * dir + 22 * scale * c, this._y + this.Height * this._armHeight - 22 * scale * s);
                this._weapon.Update(dt, handPosition, this._angle);
            }
            this._frameIndex = 0;
        }
    }
    Render() {
        const scale = this._frames.Walk[0].Scale;
        const dir = this.Direction === 1 ? 1 / 3 : 2 / 3;
        if (this._timeFromNotice >= 0 && this._timeFromSaw < this._timeToShoot)
            Canvas.DrawImage(GetSprite("Notice"), new Rectangle(this._x - Scene.Current.GetLevelPosition() + this.Width / 2, this._y + this.Height + 15, 20, 20));
        if (this.Direction == 1) {
            if (this._weapon.Heavy)
                Canvas.DrawImageWithAngle(this._frames.Hands.Straight, new Rectangle(this._x - Scene.Current.GetLevelPosition() + this.Width * dir, this._y + this.Height * this._armHeight, this._frames.Hands.Straight.ScaledSize.X, this._frames.Hands.Straight.ScaledSize.Y), this._angle + 0.075, -4 * this._frames.Hands.Straight.Scale, (this._frames.Hands.Straight.BoundingBox.Height - 3) * this._frames.Hands.Straight.Scale);
            Canvas.DrawImage(this._frames.Walk[this._frameIndex], new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
            this._weapon.Render();
            if (this._weapon.Heavy)
                Canvas.DrawImageWithAngle(this._frames.Hands.Bend, new Rectangle(this._x + this.Width * dir - Scene.Current.GetLevelPosition(), this._y + this.Height * this._armHeight, this._frames.Hands.Bend.ScaledSize.X, this._frames.Hands.Bend.ScaledSize.Y), this._angle, -4 * scale, (this._frames.Hands.Straight.BoundingBox.Height + 3) * scale);
            else
                Canvas.DrawImageWithAngle(this._frames.Hands.Straight, new Rectangle(this._x + this.Width * dir - Scene.Current.GetLevelPosition(), this._y + this.Height * this._armHeight, this._frames.Hands.Straight.ScaledSize.X, this._frames.Hands.Straight.ScaledSize.Y), this._angle - 0.05, -4 * scale, (this._frames.Hands.Straight.BoundingBox.Height - 3) * scale);
        }
        else {
            if (this._weapon.Heavy)
                Canvas.DrawImageWithAngleVFlipped(this._frames.Hands.Bend, new Rectangle(this._x + this.Width * dir - Scene.Current.GetLevelPosition(), this._y + this.Height * this._armHeight, this._frames.Hands.Bend.ScaledSize.X, this._frames.Hands.Bend.ScaledSize.Y), this._angle, -4 * scale, (this._frames.Hands.Straight.BoundingBox.Height + 3) * scale);
            Canvas.DrawImageFlipped(this._frames.Walk[this._frameIndex], new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
            this._weapon.Render();
            Canvas.DrawImageWithAngleVFlipped(this._frames.Hands.Straight, new Rectangle(this._x + this.Width * dir - Scene.Current.GetLevelPosition(), this._y + this.Height * this._armHeight, this._frames.Hands.Straight.ScaledSize.X, this._frames.Hands.Straight.ScaledSize.Y), this._angle - (this._weapon.Heavy ? 0.075 : -0.05), -4 * scale, (this._frames.Hands.Straight.BoundingBox.Height - 3) * scale);
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
            this._deathSound.Play();
        }
    }
    MakeFriendly() {
        this._friendly = true;
    }
    MakeAgressive() {
        this._aggresive = true;
    }
    MakeWarned() {
        if (this._type === EnemyType.Red)
            this._warned = true;
    }
    MakeUnwarned() {
        if (this._type === EnemyType.Red)
            this._warned = false;
    }
}
//# sourceMappingURL=Human.js.map