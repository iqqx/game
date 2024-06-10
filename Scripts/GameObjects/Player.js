import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { Canvas } from "../Context.js";
import { Rectangle, Color, Vector2, LoadImage } from "../Utilites.js";
import { Entity } from "./Entity.js";
import { AK } from "../Assets/Weapons/AK.js";
import { M4A1 } from "../Assets/Weapons/M4A1.js";
export class Player extends Entity {
    _timeToNextFrame = 0;
    // private _timeToNextShoot = 0;
    _frameIndex = 0;
    _LMBPressed = false;
    _sit = false;
    _angle = 1;
    _needDrawAntiVegnitte = 0;
    _needDrawRedVegnitte = 0;
    _active = 0;
    static _speed = 5;
    static _firerate = 200;
    static _animationFrameDuration = 125;
    static _sitHeightModifier = 0.5;
    static _sitSpeedModifier = 0.75;
    static _frames = {
        Walk: (function () {
            const images = [];
            for (let i = 0; i < 4; i++) {
                const img = new Image();
                img.src = `Images/Player_${i}.png`;
                images.push(img);
            }
            return images;
        })(),
        Sit: (function () {
            const images = [];
            for (let i = 0; i < 4; i++) {
                const img = new Image();
                img.src = `Images/Player_sit_${i}.png`;
                images.push(img);
            }
            return images;
        })(),
        Hands: {
            Left: LoadImage("Images/Player_left_hand.png"),
            Right: LoadImage("Images/Player_right_hand.png"),
        },
    };
    _weapon = new M4A1();
    constructor() {
        super(50, 200, Player._speed, 100);
        this.Tag = Tag.Player;
        this._collider = new Rectangle(0, 0, this._width, this._height);
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
                    this._weapon = new AK();
                    this._active = 0;
                    break;
                case "Digit2":
                    this._active = 1;
                    this._weapon = new M4A1();
                    break;
                case "Digit3":
                    this._active = 2;
                    break;
                case "Digit4":
                    this._active = 3;
                    break;
                case "Digit5":
                    this._active = 4;
                    break;
                case "Digit6":
                    this._active = 5;
                    break;
                case "KeyA":
                    this._movingLeft = true;
                    break;
                case "KeyS":
                    this.TryDown();
                    break;
                case "KeyD":
                    this._movingRight = true;
                    break;
                default:
                    break;
            }
        });
        addEventListener("keyup", (e) => {
            switch (e.code) {
                case "KeyA":
                    this._movingLeft = false;
                    break;
                case "KeyD":
                    this._movingRight = false;
                    break;
                default:
                    break;
            }
        });
        addEventListener("mousedown", (e) => {
            this._xTarget =
                e.x -
                    Canvas.GetClientRectangle().left +
                    Scene.Current.GetLevelPosition();
            this._yTarget = 750 - (e.y - Canvas.GetClientRectangle().top);
            this._direction =
                e.x >
                    this._x + this._width / 2 - Scene.Current.GetLevelPosition()
                    ? 1
                    : -1;
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
            this._xTarget =
                e.x -
                    Canvas.GetClientRectangle().left +
                    Scene.Current.GetLevelPosition();
            this._yTarget = 750 - (e.y - Canvas.GetClientRectangle().top);
            this._direction =
                e.x >
                    this._x + this._width / 2 - Scene.Current.GetLevelPosition()
                    ? 1
                    : -1;
        });
    }
    Update(dt) {
        const prevX = this._x;
        super.Update(dt);
        if (prevX != this._x) {
            this._timeToNextFrame -= dt;
            if (this._timeToNextFrame <= 0) {
                this._frameIndex = (this._frameIndex + 1) % 4;
                this._timeToNextFrame = Player._animationFrameDuration;
            }
        }
        else {
            this._frameIndex = 0;
        }
        this._angle = (() => {
            const angle = -Math.atan2(this._yTarget -
                (this._y + this._height * (this._sit ? 0.25 : 0.75)), this._xTarget - (this._x + this._width / 2));
            if (this._direction == 1)
                return Math.clamp(angle, -Math.PI / 2 + 0.4, Math.PI / 2 - 0.4);
            else
                return angle < 0
                    ? Math.clamp(angle, -Math.PI, -Math.PI / 2 - 0.4)
                    : Math.clamp(angle, Math.PI / 2 + 0.4, Math.PI);
        })();
        this._weapon.Update(dt, new Vector2(this._x + this._width / 2, this._y + this._height * (this._sit ? 0.25 : 0.75)), this._angle);
        if (this._LMBPressed)
            this.Shoot();
    }
    Render() {
        if (this._direction == 1) {
            Canvas.DrawImageWithAngle(Player._frames.Hands.Left, new Rectangle(this._x +
                this._width / 2 -
                Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.25 : 0.75), 52 * 3.125, 16 * 3.125), this._angle, -12, 16 * 2.4);
            Canvas.DrawImage((this._sit ? Player._frames.Sit : Player._frames.Walk)[this._frameIndex], new Rectangle(this._x - 25 - Scene.Current.GetLevelPosition(), this._y, this._width + 50, this._height));
            this._weapon.Render();
            Canvas.DrawImageWithAngle(Player._frames.Hands.Right, new Rectangle(this._x +
                this._width / 2 -
                Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.25 : 0.75), 52 * 3.125, 16 * 3.125), this._angle, -12, 16 * 2.4);
        }
        else {
            Canvas.DrawImageWithAngleVFlipped(Player._frames.Hands.Right, new Rectangle(this._x +
                this._width / 2 -
                Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.25 : 0.75), 52 * 3.125, 16 * 3.125), this._angle, -12, 16 * 2.4);
            Canvas.DrawImageFlipped((this._sit ? Player._frames.Sit : Player._frames.Walk)[this._frameIndex], new Rectangle(this._x - 25 - Scene.Current.GetLevelPosition(), this._y, this._width + 50, this._height));
            this._weapon.Render();
            Canvas.DrawImageWithAngleVFlipped(Player._frames.Hands.Left, new Rectangle(this._x +
                this._width / 2 -
                Scene.Current.GetLevelPosition(), this._y + this._height * (this._sit ? 0.25 : 0.75), 52 * 3.125, 16 * 3.125), this._angle, -12, 16 * 2.4);
        }
    }
    RenderOverlay() {
        // SetFillColor("black");
        // DrawRectangleFixed(1500 / 2 - 250 / 2, 750 - 25 - 10, 250, 25);
        // DrawRectangleFixed(1500 / 2 - 240 / 2, 750 - 25 - 15, 240, 35);
        // DrawRectangleFixed(1500 / 2 - 260 / 2, 750 - 20 - 10, 260, 15);
        // SetFillColor("white");
        // DrawText(10, 10, timeStamp.toString());
        // DrawRectangleFixed(
        // 	1500 / 2 -
        // 		250 / 2 +
        // 		PLAYER_HEIGHT * (player.x / (levelLength - PLAYER_WIDTH)),
        // 	750 - 25 - 10,
        // 	50,
        // 	25
        // );
        for (let i = 0; i < 9; i++) {
            Canvas.SetFillColor(new Color(255, 255, 255));
            Canvas.DrawRectangle(1000 / 2 - 50 / 2 + i * 50, 750 - 50 - 10, 50, 50);
            Canvas.SetFillColor(new Color(0, 0, 0));
            Canvas.DrawRectangle(1000 / 2 - 50 / 2 + i * 50, 750 - 50 - 10, 1, 50);
        }
        Canvas.SetFillColor(new Color(255, 0, 0));
        Canvas.DrawCircle(1000 / 2 + (this._active - 1) * 50, 750 - 45, 20);
        // POSTPROCCES
        if (this._needDrawRedVegnitte > 0) {
            this._needDrawRedVegnitte--;
            Canvas.DrawVignette(new Color(255, 0, 0));
        }
        if (this._needDrawAntiVegnitte > 0) {
            this._needDrawAntiVegnitte--;
            Canvas.DrawVignette(new Color(100, 100, 100));
            Canvas.SetFillColor(Color.Red);
            // Canvas.DrawImageWithAngle(
            // 	Player._FIRE,
            // 	new Rectangle(
            // 		this._x +
            // 			this._width / 2 +
            // 			Math.cos(this._angle) * 150 -
            // 			Scene.Current.GetLevelPosition(),
            // 		this._y +
            // 			this._height * (this._sit ? 0.25 : 0.75) -
            // 			Math.sin(this._angle) * 150,
            // 		150,
            // 		100
            // 	),
            // 	this._angle,
            // 	0,
            // 	50
            // );
        }
        Canvas.DrawVignette(new Color(255 - 255 * (this._health / this._maxHealth), 0, 0));
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
    GetPosition() {
        return new Vector2(this._x, this._y);
    }
    Jump() {
        if (!this._grounded || this._sit)
            return;
        this._verticalAcceleration = this._jumpForce;
    }
    TryDown() {
        console.log(Scene.Current.Raycast(new Vector2(this._x, this._y), new Vector2(0, -1), 1, Tag.Platform));
    }
    Shoot() {
        if (!this._weapon.TryShoot())
            return;
        // const dir = this._angle - (Math.random() - 0.5) * 0.01;
        // const hits = Scene.Current.Raycast(
        // 	new Vector2(
        // 		this._x + this._width / 2,
        // 		this._y + this._height * (this._sit ? 0.25 : 0.75)
        // 	),
        // 	new Vector2(Math.cos(dir), -Math.sin(dir)),
        // 	1500,
        // 	Tag.Enemy | Tag.Wall
        // );
        // const hit = hits === undefined ? undefined : hits[0];
        // if (hit !== undefined && hit.instance instanceof Enemy)
        // 	hit.instance.TakeDamage(50);
        // Scene.Current.Instantiate(
        // 	new Bullet(
        // 		this._x + this._width / 2 + Math.cos(dir) * 200,
        // 		this._y +
        // 			this._height * (this._sit ? 0.25 : 0.75) -
        // 			Math.sin(dir) * 200,
        // 		hit === undefined
        // 			? 2000
        // 			: Math.min(
        // 					Math.sqrt(
        // 						(this._x +
        // 							this._width / 2 -
        // 							hit.position.X +
        // 							Math.cos(dir) * 200) **
        // 							2 +
        // 							(this._y +
        // 								this._height *
        // 									(this._sit ? 0.25 : 0.75) -
        // 								hit.position.Y -
        // 								Math.sin(dir) * 200) **
        // 								2
        // 					),
        // 					2000
        // 			  ),
        // 		dir
        // 	)
        // );
        // sounds.Shoot.Play(0.5);
        this._needDrawAntiVegnitte = 2;
        // this._timeToNextShoot = Player._firerate;
    }
    TakeDamage(damage) {
        this._health -= damage;
        this._needDrawRedVegnitte = 5;
    }
}
