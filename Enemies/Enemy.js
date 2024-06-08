import { platforms, player } from "../Level.js";
import { DrawRectangle, SetFillColor } from "../context.js";
import { GetIntersectPointWithRectangle, Line } from "../utilites.js";
export class Enemy {
    _x = 0;
    _y = 0;
    _health;
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
    }
    MoveLeft() {
        this._x -= this._speed;
    }
    GetPosition() {
        return { x: this._x, y: this._y };
    }
    Draw() {
        SetFillColor("red");
        DrawRectangle(this._x, this._y, this._width, this._height);
    }
    Update() {
        if (this.IsSpotPlayer()) {
            if (player.x - this.GetPosition().x < 0)
                this.MoveLeft();
            else
                this.MoveRight();
        }
    }
}
