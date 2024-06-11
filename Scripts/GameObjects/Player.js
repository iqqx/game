import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { Canvas } from "../Context.js";
import { Rectangle, Color, Vector2, LoadImage } from "../Utilites.js";
import { Entity } from "./Entity.js";
import { AK } from "../Assets/Weapons/AK.js";
import { Glock } from "../Assets/Weapons/Glock.js";
export class Player extends Entity {
    _timeToNextFrame = 0;
    _frameIndex = 0;
    _LMBPressed = false;
    _sit = false;
    _angle = 1;
    _needDrawAntiVegnitte = 0;
    _needDrawRedVegnitte = 0;
    _selectedSlot = null;
    _inventory = [new AK(), new Glock()];
    _weapon = null;
    _hasInteraction = null;
    _interacting = null;
    _im = true;
    _quests = [];
    static _speed = 5;
    static _animationFrameDuration = 100;
    static _sitHeightModifier = 0.5;
    static _sitSpeedModifier = 0.75;
    static _frames = {
        Walk: [
            LoadImage(`Images/Player/Walk/0.png`, new Rectangle(0, 2, 20, 30), 3),
            LoadImage(`Images/Player/Walk/1.png`, new Rectangle(1, 2, 19, 30), 3),
            LoadImage(`Images/Player/Walk/2.png`, new Rectangle(7, 2, 11, 30), 3),
            LoadImage(`Images/Player/Walk/3.png`, new Rectangle(7, 2, 11, 30), 3),
            LoadImage(`Images/Player/Walk/4.png`, new Rectangle(7, 2, 11, 30), 3),
            LoadImage(`Images/Player/Walk/5.png`, new Rectangle(1, 2, 18, 30), 3),
        ],
        Sit: [LoadImage(`Images/Player/Crouch/3.png`, new Rectangle(0, 6, 22, 26), 3)],
        Hands: {
            Left: LoadImage("Images/Player/Arm_left.png", new Rectangle(4, 14, 20, 4), 3),
            Right: LoadImage("Images/Player/Arm_right.png", new Rectangle(4, 14, 11, 8), 3),
        },
    };
    constructor() {
        super(50, 100, Player._speed, 100);
        this.Tag = Tag.Player;
        this._collider = new Rectangle(0, 0, this._width, this._height);
        this._weapon = this._inventory[1];
        this._xTarget = -1000;
        this._yTarget = 0;
        this._x = 100;
        addEventListener("keydown", (e) => {
            switch (e.code) {
                case "KeyC":
                    if (this._sit === false) {
                        this._sit = true;
                        this._collider = new Rectangle(0, 0, this._width, this._height * Player._sitHeightModifier);
                        this._speed = Player._speed * Player._sitSpeedModifier;
                    }
                    else {
                        this._collider = new Rectangle(0, 0, this._width, this._height);
                        if (Scene.Current.IsCollide(this, Tag.Wall) !== false)
                            this._collider = new Rectangle(0, 0, this._width, this._height * Player._sitHeightModifier);
                        else {
                            this._sit = false;
                            this._speed = Player._speed;
                        }
                    }
                    break;
                case "Space":
                    this.Jump();
                    break;
                case "Digit1":
                    this.SelectSlot(0);
                    break;
                case "Digit2":
                    this.SelectSlot(1);
                    break;
                case "Digit3":
                    this.SelectSlot(2);
                    break;
                case "Digit4":
                    this.SelectSlot(3);
                    break;
                case "Digit5":
                    this.SelectSlot(4);
                    break;
                case "Digit6":
                    this.SelectSlot(5);
                    break;
                case "KeyA":
                    this._movingDirection = -1;
                    break;
                case "KeyD":
                    this._movingDirection = 1;
                    break;
                case "KeyS":
                    this.TryDown();
                    break;
                case "KeyE":
                    if (this._interacting !== null) {
                        const next = this._interacting.Continue();
                        if (next !== true) {
                            this._interacting = null;
                            this._hasInteraction = null;
                            this._quests.push(next);
                        }
                        else {
                            this._im = !this._im;
                        }
                    }
                    else if (this._hasInteraction !== null)
                        this._interacting = this._hasInteraction;
                    break;
                default:
                    break;
            }
        });
        addEventListener("keyup", (e) => {
            switch (e.code) {
                case "KeyA":
                    this._movingDirection = 0;
                    break;
                case "KeyD":
                    this._movingDirection = 0;
                    break;
                default:
                    break;
            }
        });
        addEventListener("mousedown", (e) => {
            this._xTarget = e.x - Canvas.GetClientRectangle().left + Scene.Current.GetLevelPosition();
            this._yTarget = 750 - (e.y - Canvas.GetClientRectangle().top);
            this._direction = e.x > this._x + this._width / 2 - Scene.Current.GetLevelPosition() ? 1 : -1;
            if (e.button === 0) {
                this._LMBPressed = true;
                this.Shoot();
            }
        });
        addEventListener("mouseup", (e) => {
            if (e.button === 0) {
                this._LMBPressed = false;
            }
        });
        addEventListener("mousemove", (e) => {
            this._xTarget = e.x - Canvas.GetClientRectangle().left + Scene.Current.GetLevelPosition();
            this._yTarget = 750 - (e.y - Canvas.GetClientRectangle().top);
            this._direction = e.x > this._x + this._width / 2 - Scene.Current.GetLevelPosition() ? 1 : -1;
        });
    }
    Update(dt) {
        const prevX = this._x;
        super.Update(dt);
        if (prevX != this._x) {
            this._timeToNextFrame -= dt;
            if (this._timeToNextFrame <= 0) {
                this._frameIndex = (this._frameIndex + 1) % (this._sit ? Player._frames.Sit.length : Player._frames.Walk.length);
                this._timeToNextFrame = Player._animationFrameDuration;
            }
        }
        else {
            this._frameIndex = 0;
        }
        this._angle = (() => {
            const angle = -Math.atan2(this._yTarget - (this._y + this._height * (this._sit ? 0.45 : 0.6)), this._xTarget - (this._x + this._width / 2));
            if (this._direction == 1)
                return Math.clamp(angle, -Math.PI / 2 + 0.4, Math.PI / 2 - 0.4);
            else
                return angle < 0 ? Math.clamp(angle, -Math.PI, -Math.PI / 2 - 0.4) : Math.clamp(angle, Math.PI / 2 + 0.4, Math.PI);
        })();
        this._weapon?.Update(dt, new Vector2(this._x + this._width / 2, this._y + this._height * (this._sit ? 0.45 : 0.6)), this._angle);
        if (this._interacting === null) {
            this._hasInteraction = null;
            Scene.Current.GetByTag(Tag.NPC).forEach((npc) => {
                const distance = (this._x + this._width / 2 - (npc.GetPosition().X + npc.GetSize().X / 2)) ** 2 + (this._y + this._height / 2 - (npc.GetPosition().Y + npc.GetSize().Y / 2)) ** 2;
                if (distance < 20000)
                    this._hasInteraction = npc;
            });
        }
        if (this._LMBPressed && this._weapon !== null && this._weapon.Automatic)
            this.Shoot();
    }
    Render() {
        if (this._direction == 1) {
            if (this._weapon === null)
                Canvas.DrawImageWithAngle(Player._frames.Hands.Right, new Rectangle(this._x + this._width / 2 - Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.45 : 0.6), Player._frames.Hands.Right.BoundingBox.Width * Player._frames.Hands.Right.Scale, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale), this._angle - Math.PI / 4, -(Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale - (Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2);
            else if (this._weapon.Heavy)
                Canvas.DrawImageWithAngle(Player._frames.Hands.Left, new Rectangle(this._x + this._width / 2 - Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.45 : 0.6), Player._frames.Hands.Left.BoundingBox.Width * Player._frames.Hands.Left.Scale, Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale), this._angle, -(Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2, (Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2);
            if (this._movingDirection !== 0)
                Canvas.DrawImage((this._sit ? Player._frames.Sit : Player._frames.Walk)[this._frameIndex], new Rectangle(this._x - 25 - Scene.Current.GetLevelPosition() + 15, this._y, this._width + 50, this._height));
            else
                Canvas.DrawImage((this._sit ? Player._frames.Sit : Player._frames.Walk)[0], new Rectangle(this._x - 25 - Scene.Current.GetLevelPosition() + 15, this._y, this._width + 50, this._height));
            if (this._weapon === null)
                Canvas.DrawImageWithAngle(Player._frames.Hands.Right, new Rectangle(this._x + this._width / 2 - Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.45 : 0.6), Player._frames.Hands.Right.BoundingBox.Width * Player._frames.Hands.Right.Scale, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale), this._angle, -(Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale - (Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2);
            else {
                this._weapon.Render();
                if (this._weapon.Heavy)
                    Canvas.DrawImageWithAngle(Player._frames.Hands.Right, new Rectangle(this._x + this._width / 2 - Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.45 : 0.6), Player._frames.Hands.Right.BoundingBox.Width * Player._frames.Hands.Right.Scale, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale), this._angle, -(Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale -
                        (Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2);
                else
                    Canvas.DrawImageWithAngle(Player._frames.Hands.Left, new Rectangle(this._x + this._width / 2 - Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.45 : 0.6), Player._frames.Hands.Left.BoundingBox.Width * Player._frames.Hands.Left.Scale, Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale), this._angle, -(Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2, (Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2);
            }
        }
        else {
            if (this._weapon === null)
                Canvas.DrawImageWithAngleVFlipped(Player._frames.Hands.Right, new Rectangle(this._x + this._width / 2 - Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.45 : 0.6), Player._frames.Hands.Right.BoundingBox.Width * Player._frames.Hands.Right.Scale, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale), this._angle + Math.PI / 4, -(Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale - (Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2);
            else if (this._weapon.Heavy)
                Canvas.DrawImageWithAngleVFlipped(Player._frames.Hands.Right, new Rectangle(this._x + this._width / 2 - Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.45 : 0.6), Player._frames.Hands.Right.BoundingBox.Width * Player._frames.Hands.Right.Scale, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale), this._angle, -(Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale - (Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2);
            if (this._movingDirection !== 0)
                Canvas.DrawImageFlipped((this._sit ? Player._frames.Sit : Player._frames.Walk)[this._frameIndex], new Rectangle(this._x - 25 - Scene.Current.GetLevelPosition() - 15, this._y, this._width + 50, this._height));
            else
                Canvas.DrawImageFlipped((this._sit ? Player._frames.Sit : Player._frames.Walk)[0], new Rectangle(this._x - 25 - Scene.Current.GetLevelPosition() - 15, this._y, this._width + 50, this._height));
            if (this._weapon === null)
                Canvas.DrawImageWithAngleVFlipped(Player._frames.Hands.Right, new Rectangle(this._x + this._width / 2 - Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.45 : 0.6), Player._frames.Hands.Right.BoundingBox.Width * Player._frames.Hands.Right.Scale, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale), this._angle, -(Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2, Player._frames.Hands.Right.BoundingBox.Height * Player._frames.Hands.Right.Scale - (Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2);
            else {
                this._weapon.Render();
                Canvas.DrawImageWithAngleVFlipped(Player._frames.Hands.Left, new Rectangle(this._x + this._width / 2 - Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.45 : 0.6), Player._frames.Hands.Left.BoundingBox.Width * Player._frames.Hands.Left.Scale, Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale), this._angle, -(Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2, (Player._frames.Hands.Left.BoundingBox.Height * Player._frames.Hands.Left.Scale) / 2);
            }
        }
    }
    RenderOverlay() {
        Canvas.SetFillColor(new Color(70, 70, 70, 100));
        Canvas.DrawRectangle(1500 / 2 - 330 / 2 - 10, 750 - 5, 340, -60);
        Canvas.SetFillColor(new Color(30, 30, 30));
        for (let i = 0; i < 6; i++) {
            Canvas.SetStroke(new Color(155, 155, 155), 1);
            if (i == this._selectedSlot)
                Canvas.SetStroke(new Color(200, 200, 200), 2);
            Canvas.DrawRectangleEx(new Rectangle(1500 / 2 - 330 / 2 - 5 + i * 55 + (i > 1 ? 5 : 0), 750 - 50 - 10, 50, 50));
            if (this._inventory[i] !== undefined) {
                2;
                if (i < 2)
                    Canvas.DrawImage(this._inventory[i].Icon, new Rectangle(1500 / 2 - 330 / 2 - 5 + i * 55 + (i > 1 ? 5 : 0) + 2, 750 - 50 - 10 + 2, 50 - 4, 50 - 4));
            }
        }
        if (this._hasInteraction) {
            Canvas.SetFillColor(new Color(70, 70, 70));
            Canvas.DrawRectangle(1500 / 2 - 200 / 2, 50, 200, 50);
            Canvas.SetFillColor(Color.White);
            Canvas.DrawTextEx(1500 / 2 - 200 / 2 + 5, 750 - 70, "Поговорить с Моршу   [E]", 16);
        }
        if (this._interacting !== null) {
            Canvas.SetFillColor(new Color(70, 70, 70));
            Canvas.DrawRectangle(1500 / 2 - 500 / 2, 50, 500, 150);
            Canvas.SetFillColor(Color.White);
            Canvas.DrawTextEx(1500 / 2 - 500 / 2 + 30, 750 - 150 - 20, this._im ? "Я" : "Моршу", 24);
            Canvas.DrawTextEx(1500 / 2 - 500 / 2 + 5, 750 - 150 + 10, this._interacting.Talk(), 16);
            Canvas.DrawTextEx(1500 / 2 - 500 / 2 + 5, 750 - 60, "Продолжить   [E]", 16);
        }
        this._quests.forEach((quest) => {
            Canvas.SetStroke(Color.Yellow, 5);
            Canvas.SetFillColor(quest.Tasks[0].IsCompleted() ? Color.Yellow : Color.Transparent);
            Canvas.DrawRectangleWithAngleAndStroke(20, 750 - 350, 20, 20, Math.PI / 4, -10, 0);
            Canvas.SetFillColor(Color.White);
            Canvas.DrawTextEx(50, 350, quest.Tasks[0].IsCompleted() ? "Возвращайтесь к Моршу" : quest.Tasks[0].toString(), 24);
        });
        // POSTPROCCES
        if (this._needDrawRedVegnitte > 0) {
            this._needDrawRedVegnitte--;
            Canvas.DrawVignette(new Color(255, 0, 0));
        }
        if (this._needDrawAntiVegnitte > 0) {
            this._needDrawAntiVegnitte--;
            Canvas.DrawVignette(new Color(100, 100, 100));
            Canvas.SetFillColor(Color.Red);
        }
        Canvas.DrawVignette(new Color(255 * (1 - this._health / this._maxHealth), 0, 0));
        // Canvas.SetFillColor(Color.Red);
        // if (this._health <= 0) Canvas.DrawRectangle(0, 0, 1500, 750);
        // Canvas.SetFillColor(new Color(50, 50, 50));
        // Canvas.DrawRectangle(0, 0, 1500, 750);
        // Canvas.SetFillColor(Color.Black);
        // Canvas.DrawTextEx(500,200,"STALKER 2",162)
        // Canvas.SetFillColor(new Color(25,25,25));
        // Canvas.DrawRectangle(300,200,300,150);
        // Canvas.SetFillColor(Color.White);
        // Canvas.DrawTextEx(400,500,"PLAY",32);
        Canvas.SetFillColor(Color.White);
        Canvas.DrawCircle(this._xTarget - 1 - Scene.Current.GetLevelPosition(), this._yTarget - 1, 2);
    }
    OnKilled(type) {
        this._quests.forEach((x) => x.OnKilled(type));
    }
    GetPosition() {
        return new Vector2(this._x, this._y);
    }
    SelectSlot(slot) {
        if (slot === this._selectedSlot) {
            this._selectedSlot = null;
            this._weapon = null;
            return;
        }
        if (slot <= 1)
            this._weapon = this._inventory[slot];
        else
            this._weapon = null;
        this._selectedSlot = slot;
    }
    Jump() {
        if (!this._grounded || this._sit)
            return;
        this._verticalAcceleration = this._jumpForce;
    }
    TryDown() {
        console.log(Scene.Current.Raycast(new Vector2(this._x, this._y), new Vector2(0, -1), 1, Tag.Platform));
        this._y--;
        console.log(Scene.Current.GetCollide(this, Tag.Platform | Tag.Wall));
    }
    Shoot() {
        if (this._weapon !== null && this._weapon.TryShoot())
            this._needDrawAntiVegnitte = 2;
    }
    TakeDamage(damage) {
        this._health -= damage;
        this._needDrawRedVegnitte = 5;
    }
}
