import { PLAYER_HEIGHT, PLAYER_WIDTH } from "../constants.js";
import { DrawImage, DrawImageFlipped, DrawImageWithAngle, DrawImageWithAngleVFlipped, } from "../context.js";
import { bullets, enemies, images, platforms, player, sounds, } from "../Level.js";
import { Attack } from "../player.js";
import { GetNearestIntersectWithEnemies, GetNearestIntersectWithRectangles, Line, Rectangle, SquareMagnitude, } from "../utilites.js";
import { Enemy } from "./Enemy.js";
export class Human extends Enemy {
    static _deathSound = new Audio("Sounds/human_death.mp3");
    _lastShootTick = 0;
    _angle = 0;
    constructor() {
        super(100, 200, 1, 100);
        this._x = 1300;
    }
    Update(timeStamp) {
        if (this.IsDead())
            return;
        super.Update(timeStamp);
        this._angle = Math.atan2(player.y +
            (player.sit ? PLAYER_HEIGHT * 0.4 : PLAYER_HEIGHT * 0.9) -
            (this._y + this._height * 0.75), player.x + PLAYER_WIDTH / 2 - (this._x + this._width / 2));
        if (timeStamp - this._lastShootTick > 1000 && this.IsSpotPlayer())
            this.Shoot(timeStamp);
    }
    Draw() {
        if (this.IsDead())
            return;
        if (this._direction === 1) {
            DrawImage(images.Player.Walk[0], new Rectangle(this._x, this._y, this._width, this._height));
            DrawImageWithAngle(images.AK, new Rectangle(this._x + this._width / 2, this._y + this._height * 0.75, 52 * 3.125, 16 * 3.125), this._angle, -12, 16 * 2.4);
        }
        else {
            DrawImageFlipped(images.Player.Walk[0], new Rectangle(this._x, this._y, this._width, this._height));
            DrawImageWithAngleVFlipped(images.AK, new Rectangle(this._x + this._width / 2, this._y + this._height * 0.75, 52 * 3.125, 16 * 3.125), -this._angle, -12, 16 * 2.4);
        }
    }
    TakeDamage(damage) {
        if (this.IsDead())
            return;
        super.TakeDamage(damage);
        if (this._health <= 0) {
            const s = Human._deathSound.cloneNode();
            s.volume = 0.25;
            s.play();
        }
    }
    Shoot(timeStamp) {
        const hit = GetNearestIntersectWithRectangles(new Line(this._x + this._width / 2, this._y + this._height * 0.75, player.x + PLAYER_WIDTH / 2, player.y +
            (player.sit ? PLAYER_HEIGHT * 0.4 : PLAYER_HEIGHT * 0.9)), platforms);
        const enemyHit = GetNearestIntersectWithEnemies(new Line(this._x + this._width / 2, this._y + this._height * 0.75, player.x + PLAYER_WIDTH / 2, player.y +
            (player.sit ? PLAYER_HEIGHT * 0.4 : PLAYER_HEIGHT * 0.9)), enemies);
        if ((enemyHit !== undefined && hit === undefined) ||
            (enemyHit !== undefined &&
                hit !== undefined &&
                SquareMagnitude(this._x + this._width / 2, this._y + this._height * 0.75, enemyHit.x, enemyHit.y) <
                    SquareMagnitude(this._x + this._width / 2, this._y + this._height * 0.75, hit.x, hit.y))) {
            Attack(1);
        }
        bullets.push({
            x: this._x + this._width / 2,
            y: this._y + this._height * 0.75,
            length: hit === undefined
                ? 2000
                : Math.min(Math.sqrt((this._x + this._width / 2 - hit.x) ** 2 +
                    (this._y + this._height * 0.75 - hit.y) ** 2), 2000),
            angle: -this._angle,
            shootTimeStamp: timeStamp,
        });
        sounds.Shoot.Play(0.5);
        this._lastShootTick = timeStamp;
    }
}
