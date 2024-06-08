import { platforms, player } from "../Level.js";
import { DrawRectangle, SetFillColor } from "../context.js";
import { GetIntersectPointWithRectangle, Line } from "../utilites.js";

export abstract class Enemy {
	protected _x = 0;
	protected _y = 0;
	protected _health: number;
	protected readonly _width: number;
	protected readonly _height: number;
	protected readonly _speed: number;

	constructor(width: number, height: number, speed: number, maxHealth: number) {
		this._width = width;
		this._height = height;
		this._speed = speed;
		this._health = maxHealth
	}

	public IsSpotPlayer(): boolean {
		for (const platform of platforms)
			if (
				GetIntersectPointWithRectangle(
					new Line(
						this._x + this._width / 2,
						this._y + this._height / 2,
						player.x + 50,
						player.y + 100
					),
					platform
				) !== undefined
			)
				return false;

		return true;
	}

	public MoveRight() {
		this._x += this._speed;
	}

	public MoveLeft() {
		this._x -= this._speed;
	}

	public GetPosition(): { x: number; y: number } {
		return { x: this._x, y: this._y };
	}

	public Draw() {
		SetFillColor("red");
		DrawRectangle(this._x, this._y, this._width, this._height);
	}

	public Update() {
		if (this.IsSpotPlayer()) {
			if (player.x - this.GetPosition().x < 0) this.MoveLeft();
			else this.MoveRight();
		}
	}
}
