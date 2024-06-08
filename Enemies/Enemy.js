import { platforms, player } from "../Level.js";
import { DrawRectangle, SetFillColor } from "../context.js";
import { GetIntersectPointWithRectangle, Line } from "../utilites.js";
export class Enemy {
    _x = 0;
    _y = 0;
    _health;
    _direction = 1;
    _width;
    _height;
    _speed;
    constructor(width, height, speed, maxHealth) {
        this._width = width;
        this._height = height;
        this._speed = speed;
        this._health = maxHealth;
    }
    IsSpotPlayer() {
        for (const platform of platforms)
            if (GetIntersectPointWithRectangle(new Line(this._x + this._width / 2, this._y + this._height / 2, player.x + 50, player.y + 100), platform) !== undefined)
                return false;
        return true;
    }
    MoveRight() {
        this._x += this._speed;
        const collide = this.IsCollideEx();
        if (collide !== false && collide.xOffset !== 0)
            this._x += collide.xOffset;
    }
    MoveLeft() {
        this._x -= this._speed;
        const collide = this.IsCollideEx();
        if (collide !== false && collide.xOffset !== 0)
            this._x -= collide.xOffset;
    }
    GetPosition() {
        return { x: this._x, y: this._y };
    }
    Draw() {
        SetFillColor("red");
        DrawRectangle(this._x, this._y, this._width, this._height);
    }
    Update(timeStamp) {
        if (this.IsSpotPlayer()) {
            if (this._x + this._width / 2 > player.x + 50) {
                this.MoveLeft();
                this._direction = -1;
            }
            else {
                this.MoveRight();
                this._direction = 1;
            }
        }
    }
    IsCollideEx() {
        for (const platform of platforms)
            if (this._x + this._width > platform.X &&
                this._x < platform.X + platform.Width &&
                this._y + this._height > platform.Y &&
                this._y < platform.Y + platform.Height) {
                const xstart = this._x + this._width - platform.X;
                const xend = platform.X + platform.Width - this._x;
                const ystart = platform.Y + platform.Height - this._y;
                const yend = this._y + this._height - platform.Y;
                let xOffset = 0;
                let yOffset = 0;
                if (xstart > 0 &&
                    xend > 0 &&
                    xend < platform.Width &&
                    xstart < platform.Width)
                    xOffset = 0;
                else if (xstart > 0 && (xend < 0 || xstart < xend))
                    xOffset = xstart;
                else if (xend > 0)
                    xOffset = -xend;
                if (ystart > 0 &&
                    yend > 0 &&
                    yend < platform.Height &&
                    ystart < platform.Height)
                    yOffset = 0;
                else if (ystart > 0 && (yend < 0 || ystart < yend))
                    yOffset = ystart;
                else if (yend > 0)
                    yOffset = -yend;
                if (xOffset == 0 && yOffset == 0)
                    return false;
                return { xOffset: xOffset, yOffset: yOffset };
            }
        return false;
    }
}
