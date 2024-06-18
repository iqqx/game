import { Canvas } from "../Context.js";
import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { Color, Rectangle, Vector2 } from "../Utilites.js";
import { GameObject } from "./GameObject.js";

export class Blood extends GameObject {
	private _accelerationX: number;
	private _accelerationY: number;
	private _freezed = false;
	private _timeFromFreeze = 0;
	private _rotated: boolean;

	constructor(position: Vector2, acceleration: Vector2) {
		super(10, 10);

		this._x = position.X;
		this._y = position.Y;
		this._accelerationX = acceleration.X;
		this._accelerationY = acceleration.Y;

		this._collider = new Rectangle(0, 0, 10, 10);
	}

	public override Update(dt: number): void {
		if (this._freezed) {
			if (this._timeFromFreeze > 5000 && !this._rotated) return;
			this._timeFromFreeze += dt;

			if (this._rotated) {
				const hits = Scene.Current.Raycast(new Vector2(this._x, this._y - 25), new Vector2(0, -1), 1, Tag.Wall);

				if (hits.length === 0) this._y -= 0.1;
				else {
					this._rotated = false;
					this._timeFromFreeze = 0;
					this._y = hits[0].position.Y;
				}
			}

			return;
		}

		const prevX = this._accelerationX;

		this._accelerationY -= 2;
		this._accelerationX -= Math.sign(this._accelerationX);

		console.log(prevX / this._accelerationX);
		if (this._accelerationX === 0 || prevX / this._accelerationX === -1) this._accelerationX = 0;

		const dir = new Vector2(this._accelerationX, this._accelerationY);
		const hits = Scene.Current.Raycast(this.GetCenter(), dir, dir.GetLength(), Tag.Wall);

		if (hits.length > 0) {
			this._freezed = true;

			this._x = hits[0].position.X;
			this._y = hits[0].position.Y;

			this._rotated = hits[0].Normal.X !== 0;
		} else {
			this._x += this._accelerationX;
			this._y += this._accelerationY;
		}
	}

	override Render(): void {
		Canvas.SetFillColor(Color.Red);
		Canvas.ClearStroke();

		if (this._freezed) {
			if (this._rotated) {
				const progress = 15 * Math.min(this._timeFromFreeze / 1000, 1);

				Canvas.DrawEllipse(this._x - Scene.Current.GetLevelPosition(), this._y - progress * 2, 2, 2 + progress);
			} else Canvas.DrawEllipse(this._x - Scene.Current.GetLevelPosition(), this._y, 2 + 15 * Math.min(this._timeFromFreeze / 1000, 1), 2);
		} else Canvas.DrawCircle(this._x - Scene.Current.GetLevelPosition(), this._y, 2);
	}
}
