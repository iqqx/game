import { Canvas } from "../Context.js";
import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { Color, GameObject, Rectangle, Vector2 } from "../Utilites.js";

export class Blood extends GameObject {
	private _accelerationX: number;
	private _accelerationY: number;
	private _freezed = false;

	constructor(position: Vector2, acceleration: Vector2) {
		super(10, 10);

		this._x = position.X;
		this._y = position.Y;
		this._accelerationX = acceleration.X;
		this._accelerationY = acceleration.Y;

		this._collider = new Rectangle(0, 0, 10, 10);
	}

	public override Update(dt: number): void {
		if (this._freezed) return;

		const prevX = this._accelerationX;

		this._accelerationY -= 2;
		this._accelerationX -= Math.sign(this._accelerationX);

		console.log(prevX / this._accelerationX);
		if (this._accelerationX === 0 || prevX / this._accelerationX === -1) this._accelerationX = 0;

		this._x += this._accelerationX;
		this._y += this._accelerationY;

		if (Scene.Current.IsCollide(this, Tag.Wall)) this._freezed = true;
	}

	override Render(): void {
		Canvas.SetFillColor(Color.Red);
		Canvas.DrawCircle(this._x - Scene.Current.GetLevelPosition(), this._y, 10);
	}
}
